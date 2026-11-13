import type { Song, StudioTrack } from './song';
import { audibleTracks } from './song';

/**
 * MEZCLADOR DEL ESTUDIO (grafo de Web Audio).
 * Pista: entrada → filtro paso bajo → EQ (graves/medios/agudos) → sidechain (ducking) → paneo → volumen
 *        → master · envíos post-fader → reverb y delay (buses compartidos, como en un estudio real).
 * Master: volumen → limitador (protección de picos) → salida.
 * El mismo grafo se construye en vivo (AudioContext) y al exportar (OfflineAudioContext).
 */
export const dbToGain = (db: number) => (db <= -40 ? 0 : Math.pow(10, db / 20));

interface TrackNodes {
  input: GainNode;
  filter: BiquadFilterNode;
  low: BiquadFilterNode;
  mid: BiquadFilterNode;
  high: BiquadFilterNode;
  duck: GainNode;
  pan: StereoPannerNode;
  vol: GainNode;
  revSend: GainNode;
  delSend: GainNode;
}

function makeImpulse(c: BaseAudioContext, seconds = 2.2): AudioBuffer {
  // Respuesta de impulso sintética: ruido estéreo con caída exponencial (reverb tipo sala)
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

const impulseCache = new WeakMap<BaseAudioContext, AudioBuffer>();

export class StudioGraph {
  readonly tracks = new Map<string, TrackNodes>();
  readonly masterIn: GainNode;
  private masterGain: GainNode;
  private limiter: DynamicsCompressorNode;
  private reverbIn: GainNode;
  private delayIn: GainNode;
  private delayNode: DelayNode;
  private limiterOn = true;

  constructor(
    readonly ctx: BaseAudioContext,
    private output: AudioNode,
  ) {
    const c = ctx;
    this.masterIn = c.createGain();
    this.masterGain = c.createGain();
    this.limiter = c.createDynamicsCompressor();
    this.limiter.threshold.value = -1.5;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.002;
    this.limiter.release.value = 0.12;
    this.masterIn.connect(this.masterGain).connect(this.limiter).connect(output);

    // Bus de reverb
    this.reverbIn = c.createGain();
    const conv = c.createConvolver();
    let ir = impulseCache.get(c);
    if (!ir) {
      ir = makeImpulse(c);
      impulseCache.set(c, ir);
    }
    conv.buffer = ir;
    const revHp = c.createBiquadFilter();
    revHp.type = 'highpass';
    revHp.frequency.value = 250; // la reverb no ensucia los graves
    const revOut = c.createGain();
    revOut.gain.value = 0.7;
    this.reverbIn.connect(conv).connect(revHp).connect(revOut).connect(this.masterIn);

    // Bus de delay (corchea con puntillo, sincronizado al BPM)
    this.delayIn = c.createGain();
    this.delayNode = c.createDelay(2);
    const fb = c.createGain();
    fb.gain.value = 0.35;
    const delLp = c.createBiquadFilter();
    delLp.type = 'lowpass';
    delLp.frequency.value = 4000;
    this.delayIn.connect(this.delayNode).connect(delLp).connect(fb).connect(this.delayNode);
    const delOut = c.createGain();
    delOut.gain.value = 0.6;
    delLp.connect(delOut).connect(this.masterIn);
  }

  private create(t: StudioTrack): TrackNodes {
    const c = this.ctx;
    const n: TrackNodes = {
      input: c.createGain(),
      filter: c.createBiquadFilter(),
      low: c.createBiquadFilter(),
      mid: c.createBiquadFilter(),
      high: c.createBiquadFilter(),
      duck: c.createGain(),
      pan: c.createStereoPanner(),
      vol: c.createGain(),
      revSend: c.createGain(),
      delSend: c.createGain(),
    };
    n.filter.type = 'lowpass';
    n.filter.Q.value = 0.7;
    n.low.type = 'lowshelf';
    n.low.frequency.value = 150;
    n.mid.type = 'peaking';
    n.mid.frequency.value = 1000;
    n.mid.Q.value = 0.8;
    n.high.type = 'highshelf';
    n.high.frequency.value = 6000;
    n.input.connect(n.filter).connect(n.low).connect(n.mid).connect(n.high).connect(n.duck).connect(n.pan).connect(n.vol).connect(this.masterIn);
    n.vol.connect(n.revSend).connect(this.reverbIn);
    n.vol.connect(n.delSend).connect(this.delayIn);
    this.tracks.set(t.id, n);
    return n;
  }

  /** Aplica los ajustes de la canción (crea/elimina pistas y actualiza parámetros). */
  apply(song: Song, bpm: number): void {
    const audible = audibleTracks(song);
    const now = this.ctx.currentTime;
    const set = (p: AudioParam, v: number) => p.setTargetAtTime(v, now, 0.015);
    for (const t of song.tracks) {
      const n = this.tracks.get(t.id) ?? this.create(t);
      set(n.vol.gain, audible.has(t.id) ? dbToGain(t.volume) : 0);
      set(n.pan.pan, t.pan);
      set(n.low.gain, t.eqLow);
      set(n.mid.gain, t.eqMid);
      set(n.high.gain, t.eqHigh);
      set(n.filter.frequency, Math.min(20000, Math.max(80, t.cutoff)));
      set(n.revSend.gain, t.reverb);
      set(n.delSend.gain, t.delay);
    }
    for (const [id, n] of this.tracks) {
      if (!song.tracks.some((t) => t.id === id)) {
        n.vol.disconnect();
        this.tracks.delete(id);
      }
    }
    set(this.masterGain.gain, dbToGain(song.masterVolume));
    set(this.delayNode.delayTime, (60 / bpm) * 0.75);
    if (song.limiter !== this.limiterOn) {
      this.limiterOn = song.limiter;
      this.masterGain.disconnect();
      this.limiter.disconnect();
      if (song.limiter) this.masterGain.connect(this.limiter).connect(this.output);
      else this.masterGain.connect(this.output);
    }
  }

  input(trackId: string): AudioNode | undefined {
    return this.tracks.get(trackId)?.input;
  }

  /** Sidechain por "ducking": baja el volumen de la pista justo cuando suena el kick. */
  duck(trackId: string, time: number, amount: number, bpm: number): void {
    const n = this.tracks.get(trackId);
    if (!n || amount <= 0) return;
    const depth = 1 - Math.min(0.95, amount * 0.9);
    const release = Math.min(0.25, (60 / bpm) * 0.3);
    n.duck.gain.setTargetAtTime(depth, time, 0.004);
    n.duck.gain.setTargetAtTime(1, time + 0.03, release / 3);
  }

  dispose(): void {
    this.masterIn.disconnect();
    this.masterGain.disconnect();
    this.limiter.disconnect();
    this.tracks.forEach((n) => n.vol.disconnect());
    this.tracks.clear();
  }
}
