import { getAudio } from '../audio/engine';
import { StudioGraph } from './graph';
import { getInstrument } from './instruments';
import { STEPS_PER_BAR, audibleTracks, resolveStep, totalBars, type Song, type StepPosition } from './song';

/** Buffers decodificados de los samples del usuario (los AudioBuffer sirven en cualquier contexto). */
export const sampleBuffers = new Map<string, AudioBuffer>();

export async function decodeSample(id: string, data: ArrayBuffer): Promise<AudioBuffer> {
  const cached = sampleBuffers.get(id);
  if (cached) return cached;
  const buf = await getAudio().ctx.decodeAudioData(data.slice(0));
  sampleBuffers.set(id, buf);
  return buf;
}

function playSample(dest: AudioNode, buffer: AudioBuffer, time: number, semitones: number, vel: number) {
  const c = dest.context;
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = Math.pow(2, semitones / 12);
  const g = c.createGain();
  g.gain.value = vel;
  src.connect(g).connect(dest);
  src.start(time);
}

export const stepDuration = (bpm: number) => 60 / bpm / 4;

/** Programa todo lo que suena en un paso. Lo usan el reproductor en vivo y la exportación. */
export function scheduleStep(graph: StudioGraph, song: Song, bpm: number, pos: StepPosition, time: number, audible: Set<string>): void {
  const sd = stepDuration(bpm);
  const t = time + (pos.loopStep % 2 === 1 ? song.swing * sd : 0);
  let kickHit = false;
  for (const tr of song.tracks) {
    if (!pos.active.has(tr.id) || !audible.has(tr.id)) continue;
    const dest = graph.input(tr.id);
    if (!dest) continue;
    if (tr.kind === 'synth') {
      const inst = getInstrument(tr.instrument);
      if (!inst) continue;
      for (const n of tr.notes) if (n.step === pos.loopStep) inst.play({ dest, time: t, midi: n.pitch, duration: n.len * sd, velocity: n.vel });
    } else {
      const v = tr.steps[pos.loopStep] ?? 0;
      if (v <= 0) continue;
      if (tr.kind === 'sample') {
        const buf = tr.sampleId ? sampleBuffers.get(tr.sampleId) : undefined;
        if (buf) playSample(dest, buf, t, tr.pitch, v);
      } else {
        const inst = getInstrument(tr.instrument);
        inst?.play({ dest, time: t, midi: 60 + tr.pitch, duration: sd, velocity: v });
        if (inst?.sidechainSource) kickHit = true;
      }
    }
  }
  if (kickHit) {
    for (const tr of song.tracks) if (tr.duck > 0 && pos.active.has(tr.id)) graph.duck(tr.id, t, tr.duck, bpm);
  }
}

// =====================================================================
// Reproductor en vivo
// =====================================================================
export type PlayMode = 'loop' | 'cancion';

export class StudioPlayer {
  private graph: StudioGraph | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private mode: PlayMode = 'loop';
  private uiTimers: number[] = [];

  constructor(
    private get: () => { song: Song; bpm: number },
    private onPosition: (pos: StepPosition | null, globalStep: number) => void,
  ) {}

  get playing(): boolean {
    return this.timer !== null;
  }

  ensureGraph(): StudioGraph {
    if (!this.graph) {
      const { ctx, master } = getAudio();
      this.graph = new StudioGraph(ctx, master);
    }
    const { song, bpm } = this.get();
    this.graph.apply(song, bpm);
    return this.graph;
  }

  /** Aplica cambios de mezcla al instante. */
  refresh(): void {
    if (this.graph) {
      const { song, bpm } = this.get();
      this.graph.apply(song, bpm);
    }
  }

  start(mode: PlayMode, fromStep = 0): void {
    this.stop();
    this.mode = mode;
    const g = this.ensureGraph();
    this.step = fromStep;
    this.nextTime = g.ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.tick(), 25);
    this.tick();
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.uiTimers.forEach(clearTimeout);
    this.uiTimers = [];
    this.onPosition(null, -1);
  }

  private tick(): void {
    const g = this.graph!;
    const { song, bpm } = this.get();
    const sd = stepDuration(bpm);
    const audible = audibleTracks(song);
    while (this.nextTime < g.ctx.currentTime + 0.12) {
      const pos = resolveStep(song, this.step, this.mode);
      if (!pos) {
        const endIn = Math.max(0, (this.nextTime - g.ctx.currentTime) * 1000);
        window.clearInterval(this.timer!);
        this.timer = null;
        this.uiTimers.push(window.setTimeout(() => this.onPosition(null, -1), endIn));
        return;
      }
      scheduleStep(g, song, bpm, pos, this.nextTime, audible);
      const s = this.step;
      const delay = Math.max(0, (this.nextTime - g.ctx.currentTime) * 1000);
      if (s % 2 === 0) this.uiTimers.push(window.setTimeout(() => this.onPosition(pos, s), delay));
      if (this.uiTimers.length > 64) this.uiTimers.splice(0, 32);
      this.nextTime += sd;
      this.step++;
    }
  }

  /** Escuchar una nota o golpe suelto de una pista (al editar). */
  preview(trackId: string, midi?: number): void {
    const g = this.ensureGraph();
    const { song, bpm } = this.get();
    const tr = song.tracks.find((t) => t.id === trackId);
    const dest = g.input(trackId);
    if (!tr || !dest) return;
    const t = g.ctx.currentTime + 0.01;
    if (tr.kind === 'sample') {
      const buf = tr.sampleId ? sampleBuffers.get(tr.sampleId) : undefined;
      if (buf) playSample(dest, buf, t, tr.pitch, 0.9);
    } else getInstrument(tr.instrument)?.play({ dest, time: t, midi: midi ?? 60 + tr.pitch, duration: stepDuration(bpm) * 2, velocity: 0.85 });
  }

  dispose(): void {
    this.stop();
    this.graph?.dispose();
    this.graph = null;
  }
}

// =====================================================================
// Exportación (render offline, más rápido que tiempo real y sin cortes)
// =====================================================================
export async function renderSong(song: Song, bpm: number, onProgress?: (p: number) => void, sampleRate = 44100): Promise<AudioBuffer> {
  const mode: PlayMode = song.sections.length ? 'cancion' : 'loop';
  const bars = mode === 'cancion' ? totalBars(song) : song.loopBars;
  const total = bars * STEPS_PER_BAR;
  const sd = stepDuration(bpm);
  const offset = 0.05;
  const tail = 3; // segundos para las colas de reverb/delay
  const duration = offset + total * sd + tail;
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const graph = new StudioGraph(ctx, ctx.destination);
  graph.apply(song, bpm);
  const audible = audibleTracks(song);

  let next = 0;
  const scheduleUntil = (end: number) => {
    for (; next < Math.min(end, total); next++) {
      const pos = mode === 'loop' ? resolveStep(song, next, 'loop') : resolveStep(song, next, 'cancion');
      if (pos) scheduleStep(graph, song, bpm, pos, offset + next * sd, audible);
    }
  };
  // Se programa por bloques para no crear miles de nodos a la vez (memoria en equipos modestos)
  const chunk = STEPS_PER_BAR * 8;
  scheduleUntil(chunk * 2);
  const suspendAt = (k: number) => {
    const t = offset + k * chunk * sd;
    if (k * chunk >= total) return;
    void ctx.suspend(t).then(() => {
      scheduleUntil((k + 2) * chunk);
      onProgress?.(Math.min(1, (k * chunk) / total));
      suspendAt(k + 1);
      void ctx.resume();
    });
  };
  suspendAt(1);
  const buffer = await ctx.startRendering();
  onProgress?.(1);
  graph.dispose();
  return buffer;
}
