/**
 * Motor de audio ligero (Web Audio API).
 * - Un único AudioContext, creado SOLO tras una interacción del usuario (requisito de los navegadores).
 * - Todos los sonidos se SINTETIZAN aquí: son aproximaciones didácticas, no samples comerciales.
 * - Nada se ejecuta en segundo plano: el planificador solo corre mientras algo está sonando.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

export function getAudio(): { ctx: AudioContext; master: GainNode; analyser: AnalyserNode } {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = 0.8;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    master.connect(analyser);
    analyser.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ctx, master: master!, analyser: analyser! };
}

export function hasAudio(): boolean {
  return ctx !== null;
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}

export function setMasterVolume(v: number): void {
  getAudio().master.gain.value = v;
}

function getNoise(c: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== c.sampleRate) {
    const len = c.sampleRate * 1;
    noiseBuffer = c.createBuffer(1, len, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function out(dest?: AudioNode): AudioNode {
  return dest ?? getAudio().master;
}

// ------------------------------------------------------------------
// Voces de batería
// ------------------------------------------------------------------
export interface KickOptions {
  startFreq?: number; // Hz al inicio del golpe
  endFreq?: number; // Hz del cuerpo
  decay?: number; // s
  click?: number; // 0..1 cantidad de ataque
  gain?: number;
}

export function playKick(time?: number, o: KickOptions = {}, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const { startFreq = 150, endFreq = 50, decay = 0.45, click = 0.35, gain = 0.95 } = o;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.11);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  osc.connect(g).connect(out(dest));
  osc.start(t);
  osc.stop(t + decay + 0.05);
  if (click > 0) {
    const n = c.createBufferSource();
    n.buffer = getNoise(c);
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2500;
    const ng = c.createGain();
    ng.gain.setValueAtTime(click * 0.4, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
    n.connect(hp).connect(ng).connect(out(dest));
    n.start(t);
    n.stop(t + 0.03);
  }
}

export function playClap(time?: number, gain = 0.55, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 0.9;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  // tres micro-golpes + cola: así suena una palmada "multicapa"
  [0, 0.011, 0.022].forEach((d) => {
    g.gain.setValueAtTime(gain, t + d);
    g.gain.exponentialRampToValueAtTime(gain * 0.25, t + d + 0.009);
  });
  g.gain.setValueAtTime(gain * 0.7, t + 0.032);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  const n = c.createBufferSource();
  n.buffer = getNoise(c);
  n.connect(bp).connect(g).connect(out(dest));
  n.start(t);
  n.stop(t + 0.3);
}

export function playHat(time?: number, open = false, gain = 0.25, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7500;
  const g = c.createGain();
  const len = open ? 0.32 : 0.05;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  const n = c.createBufferSource();
  n.buffer = getNoise(c);
  n.connect(hp).connect(g).connect(out(dest));
  n.start(t);
  n.stop(t + len + 0.02);
}

export function playShaker(time?: number, gain = 0.12, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 6000;
  bp.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  const n = c.createBufferSource();
  n.buffer = getNoise(c);
  n.connect(bp).connect(g).connect(out(dest));
  n.start(t);
  n.stop(t + 0.1);
}

export function playRim(time?: number, gain = 0.3, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1700, t);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1800;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  osc.connect(bp).connect(g).connect(out(dest));
  osc.start(t);
  osc.stop(t + 0.06);
}

export function playClick(time?: number, accent = false, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'square';
  osc.frequency.value = accent ? 1760 : 1100;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.25 : 0.14, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  osc.connect(g).connect(out(dest));
  osc.start(t);
  osc.stop(t + 0.04);
}

// ------------------------------------------------------------------
// Voces tonales
// ------------------------------------------------------------------
export interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  cutoff?: number; // Hz del filtro paso bajo
  detune?: number;
}

export function playTone(freq: number, duration = 0.5, time?: number, o: ToneOptions = {}, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const { type = 'triangle', gain = 0.25, attack = 0.008, release = 0.25, cutoff = 6000, detune = 0 } = o;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = cutoff;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.setValueAtTime(gain, t + Math.max(attack, duration));
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack, duration) + release);
  osc.connect(lp).connect(g).connect(out(dest));
  osc.start(t);
  osc.stop(t + duration + release + 0.05);
}

/** Tono tipo "piano eléctrico" sencillo (dos osciladores). */
export function playKeys(freq: number, duration = 0.6, time?: number, gain = 0.18, dest?: AudioNode): void {
  playTone(freq, duration, time, { type: 'sine', gain, release: 0.5 }, dest);
  playTone(freq * 2, duration * 0.5, time, { type: 'triangle', gain: gain * 0.25, release: 0.3 }, dest);
}

export function playBass(freq: number, duration = 0.3, time?: number, gain = 0.4, dest?: AudioNode): void {
  playTone(freq, duration, time, { type: 'sine', gain, attack: 0.005, release: 0.08 }, dest);
  playTone(freq, duration, time, { type: 'triangle', gain: gain * 0.35, attack: 0.005, release: 0.06, cutoff: 900 }, dest);
}

export function playPad(freqs: number[], duration = 2, time?: number, gain = 0.07, dest?: AudioNode): void {
  freqs.forEach((f) => {
    [-8, 8].forEach((det) =>
      playTone(f, duration, time, { type: 'sawtooth', gain, attack: 0.5, release: 1.2, cutoff: 1400, detune: det }, dest),
    );
  });
}

export function playPluck(freq: number, time?: number, gain = 0.2, dest?: AudioNode): void {
  playTone(freq, 0.02, time, { type: 'sawtooth', gain, attack: 0.002, release: 0.25, cutoff: 2500 }, dest);
}

/** Ruido rosa aproximado filtrado: barrido tipo "riser" para FX. */
export function playRiser(duration = 2, time?: number, dest?: AudioNode): void {
  const { ctx: c } = getAudio();
  const t = time ?? c.currentTime;
  const n = c.createBufferSource();
  n.buffer = getNoise(c);
  n.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(9000, t + duration);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.25, t + duration * 0.95);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.05);
  n.connect(bp).connect(g).connect(out(dest));
  n.start(t);
  n.stop(t + duration + 0.1);
}

// ------------------------------------------------------------------
// Planificador por pasos (patrón "lookahead": preciso y ligero)
// ------------------------------------------------------------------
export interface SchedulerOptions {
  bpm: number;
  stepsPerBeat?: number; // 4 = semicorcheas
  totalSteps: number;
  swing?: number; // 0..0.5 retrasa los pasos impares
  onStep: (step: number, time: number) => void;
  onUiStep?: (step: number) => void;
}

export class StepScheduler {
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private uiTimers: number[] = [];
  constructor(public opts: SchedulerOptions) {}

  get running(): boolean {
    return this.timer !== null;
  }

  start(): void {
    if (this.timer !== null) return;
    const { ctx: c } = getAudio();
    this.step = 0;
    this.nextTime = c.currentTime + 0.06;
    this.timer = window.setInterval(() => this.tick(), 25);
    this.tick();
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.uiTimers.forEach((id) => window.clearTimeout(id));
    this.uiTimers = [];
    this.opts.onUiStep?.(-1);
  }

  private tick(): void {
    const { ctx: c } = getAudio();
    const spb = this.opts.stepsPerBeat ?? 4;
    const stepDur = 60 / this.opts.bpm / spb;
    while (this.nextTime < c.currentTime + 0.12) {
      const swing = this.step % 2 === 1 ? (this.opts.swing ?? 0) * stepDur : 0;
      const t = this.nextTime + swing;
      const s = this.step;
      this.opts.onStep(s, t);
      if (this.opts.onUiStep) {
        const delay = Math.max(0, (t - c.currentTime) * 1000);
        const id = window.setTimeout(() => this.opts.onUiStep?.(s), delay);
        this.uiTimers.push(id);
        if (this.uiTimers.length > 64) this.uiTimers.splice(0, 32);
      }
      this.nextTime += stepDur;
      this.step = (this.step + 1) % this.opts.totalSteps;
    }
  }
}
