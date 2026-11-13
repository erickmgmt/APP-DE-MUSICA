import { uid } from '../id';
import { getInstrument } from './instruments';

/**
 * MODELO DE CANCIÓN DEL ESTUDIO (se guarda dentro de cada proyecto: project.song).
 * - Cada pista tiene un loop de `loopBars` compases (16 pasos de semicorchea por compás).
 * - La ESTRUCTURA (sections) decide qué pistas suenan en cada parte de la canción:
 *   así se construye una canción completa "quitando y poniendo" elementos, como en el house.
 */
export const STEPS_PER_BAR = 16;

export interface StudioNote {
  id: string;
  step: number; // inicio dentro del loop (0..loopSteps-1)
  pitch: number; // MIDI
  len: number; // duración en pasos
  vel: number; // 0..1
}

export type TrackKind = 'drum' | 'synth' | 'sample';

export interface StudioTrack {
  id: string;
  name: string;
  color: string;
  kind: TrackKind;
  instrument: string; // id del instrumento (drum/synth)
  sampleId?: string; // pistas de sample
  steps: number[]; // drum/sample: velocidad por paso (0 = apagado)
  notes: StudioNote[]; // synth
  pitch: number; // transposición en semitonos (drum/sample)
  volume: number; // dB (-40..+6)
  pan: number; // -1..1
  mute: boolean;
  solo: boolean;
  eqLow: number; // dB
  eqMid: number;
  eqHigh: number;
  cutoff: number; // Hz del filtro paso bajo (20000 = abierto)
  reverb: number; // envío 0..1
  delay: number; // envío 0..1
  duck: number; // sidechain 0..1 (cuánto baja cuando suena el kick)
}

export interface StudioSection {
  id: string;
  name: string;
  bars: number;
  tracks: string[]; // ids de pistas activas
}

export interface Song {
  version: 1;
  loopBars: 1 | 2 | 4;
  swing: number; // 0..0.4
  tracks: StudioTrack[];
  sections: StudioSection[];
  masterVolume: number; // dB
  limiter: boolean;
}

export const TRACK_COLORS = ['#8b5cf6', '#3b82f6', '#2dd4bf', '#a3e635', '#fbbf24', '#fb7185', '#22d3ee', '#f472b6', '#c084fc', '#34d399'];

export function loopSteps(song: Song): number {
  return song.loopBars * STEPS_PER_BAR;
}

export function newTrack(song: Song, init: Partial<StudioTrack> & { kind: TrackKind; instrument: string }): StudioTrack {
  const inst = getInstrument(init.instrument);
  return {
    id: uid('trk'),
    name: inst?.name ?? 'Pista',
    color: TRACK_COLORS[song.tracks.length % TRACK_COLORS.length],
    steps: Array(loopSteps(song)).fill(0),
    notes: [],
    pitch: 0,
    volume: -6,
    pan: 0,
    mute: false,
    solo: false,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    cutoff: 20000,
    reverb: 0,
    delay: 0,
    duck: 0,
    ...init,
  };
}

/** Normaliza una canción guardada por una versión anterior (rellena campos que falten). */
export function normalizeSong(s: Partial<Song> | undefined): Song {
  const base: Song = { version: 1, loopBars: 4, swing: 0.12, tracks: [], sections: [], masterVolume: -1, limiter: true, ...s } as Song;
  const ls = base.loopBars * STEPS_PER_BAR;
  base.tracks = base.tracks.map((t) => {
    const full = newTrack({ ...base, tracks: [] }, { ...t });
    const steps = [...(t.steps ?? [])];
    while (steps.length < ls) steps.push(0);
    return { ...full, id: t.id, color: t.color ?? full.color, steps: steps.slice(0, ls) };
  });
  return base;
}

/** Cambia la duración del loop conservando lo programado (repite o recorta). */
export function setLoopBars(song: Song, bars: 1 | 2 | 4): Song {
  const oldLen = loopSteps(song);
  const newLen = bars * STEPS_PER_BAR;
  return {
    ...song,
    loopBars: bars,
    tracks: song.tracks.map((t) => ({
      ...t,
      steps: Array.from({ length: newLen }, (_, i) => t.steps[i % oldLen] ?? 0),
      notes: newLen > oldLen ? [...t.notes, ...Array.from({ length: newLen / oldLen - 1 }, (_, k) => t.notes.map((n) => ({ ...n, id: uid('n'), step: n.step + oldLen * (k + 1) }))).flat()] : t.notes.filter((n) => n.step < newLen),
    })),
  };
}

export function totalBars(song: Song): number {
  return song.sections.reduce((a, s) => a + s.bars, 0);
}

export interface StepPosition {
  loopStep: number;
  bar: number; // compás absoluto (0-based)
  sectionIndex: number;
  active: Set<string>; // pistas que suenan
}

/**
 * Traduce un paso global a su posición.
 * - modo 'loop': repite el loop con todas las pistas.
 * - modo 'cancion': recorre la estructura; devuelve null al terminar.
 */
export function resolveStep(song: Song, globalStep: number, mode: 'loop' | 'cancion'): StepPosition | null {
  const ls = loopSteps(song);
  if (mode === 'loop' || song.sections.length === 0) {
    return { loopStep: globalStep % ls, bar: Math.floor(globalStep / STEPS_PER_BAR) % song.loopBars, sectionIndex: -1, active: new Set(song.tracks.map((t) => t.id)) };
  }
  let start = 0;
  for (let i = 0; i < song.sections.length; i++) {
    const s = song.sections[i];
    const len = s.bars * STEPS_PER_BAR;
    if (globalStep < start + len) {
      const inSection = globalStep - start;
      return { loopStep: inSection % ls, bar: Math.floor(globalStep / STEPS_PER_BAR), sectionIndex: i, active: new Set(s.tracks) };
    }
    start += len;
  }
  return null;
}

export function sectionStartStep(song: Song, index: number): number {
  return song.sections.slice(0, index).reduce((a, s) => a + s.bars * STEPS_PER_BAR, 0);
}

/** Pistas audibles teniendo en cuenta mute y solo. */
export function audibleTracks(song: Song): Set<string> {
  const anySolo = song.tracks.some((t) => t.solo);
  return new Set(song.tracks.filter((t) => !t.mute && (!anySolo || t.solo)).map((t) => t.id));
}

// =====================================================================
// Plantillas
// =====================================================================
const bars4 = (perBar: number[], vel = 1, bars = 4) => {
  const s = Array(bars * STEPS_PER_BAR).fill(0);
  for (let b = 0; b < bars; b++) perBar.forEach((st) => (s[b * STEPS_PER_BAR + st] = vel));
  return s;
};

const note = (step: number, pitch: number, len: number, vel = 0.9): StudioNote => ({ id: uid('n'), step, pitch, len, vel });

export function emptySong(): Song {
  const song: Song = { version: 1, loopBars: 4, swing: 0.12, tracks: [], sections: [], masterVolume: -1, limiter: true };
  const kick = newTrack(song, { kind: 'drum', instrument: 'kick-deep', name: 'Kick' });
  song.tracks.push(kick);
  song.sections = [{ id: uid('sec'), name: 'Parte 1', bars: 8, tracks: [kick.id] }];
  return song;
}

/**
 * Plantilla Deep House en La menor (Am7 → Dm7), loop de 4 compases.
 * Pensada para aprender modificándola: cada pista muestra una técnica típica del género.
 */
export function deepHouseSong(): Song {
  const song: Song = { version: 1, loopBars: 4, swing: 0.14, tracks: [], sections: [], masterVolume: -1, limiter: true };
  const add = (t: Partial<StudioTrack> & { kind: TrackKind; instrument: string }) => {
    const tr = newTrack(song, t);
    song.tracks.push(tr);
    return tr;
  };
  const kick = add({ kind: 'drum', instrument: 'kick-deep', name: 'Kick', steps: bars4([0, 4, 8, 12]), volume: -4 });
  const clap = add({ kind: 'drum', instrument: 'clap', name: 'Clap', steps: bars4([4, 12], 0.9), volume: -9, reverb: 0.2 });
  const hat = add({ kind: 'drum', instrument: 'hat-open', name: 'Hat abierto', steps: bars4([2, 6, 10, 14], 0.8), volume: -12, pan: 0.15 });
  const shaker = add({
    kind: 'drum',
    instrument: 'shaker',
    name: 'Shaker',
    steps: Array.from({ length: 64 }, (_, i) => (i % 2 === 0 ? 0.8 : 0.45)),
    volume: -14,
    pan: -0.2,
  });
  // Bajo: notas sincopadas siguiendo la raíz (A1 = 33 en los compases 1-2, D2 = 38 en 3-4)
  const bassNotes: StudioNote[] = [];
  [33, 33, 38, 38].forEach((root, bar) => {
    const o = bar * 16;
    bassNotes.push(note(o + 2, root, 2), note(o + 6, root + 12, 1, 0.7), note(o + 7, root, 1), note(o + 10, root, 2), note(o + 14, root + 7, 1, 0.75));
  });
  const bass = add({ kind: 'synth', instrument: 'bass-deep', name: 'Bajo', notes: bassNotes, volume: -6, duck: 0.6, cutoff: 1200 });
  // Acordes: stabs de piano eléctrico en contratiempo. Am7 (A C E G) y Dm7 (A C D F)
  const am7 = [57, 60, 64, 67];
  const dm7 = [57, 60, 62, 65];
  const chordNotes: StudioNote[] = [];
  [am7, am7, dm7, dm7].forEach((ch, bar) => {
    const o = bar * 16;
    ch.forEach((p) => chordNotes.push(note(o + 3, p, 2, 0.75), note(o + 10, p, 3, 0.65)));
  });
  const keys = add({ kind: 'synth', instrument: 'keys-rhodes', name: 'Acordes', notes: chordNotes, volume: -10, reverb: 0.3, delay: 0.15, duck: 0.3, eqLow: -4 });
  // Pad: acordes largos de fondo (2 compases cada uno)
  const padNotes: StudioNote[] = [...[64, 67, 72].map((p) => note(0, p, 32, 0.7)), ...[65, 69, 72].map((p) => note(32, p, 32, 0.7))];
  const pad = add({ kind: 'synth', instrument: 'pad-warm', name: 'Pad', notes: padNotes, volume: -16, reverb: 0.5, duck: 0.5, eqLow: -6 });

  const drums = [kick.id, hat.id, shaker.id];
  song.sections = [
    { id: uid('sec'), name: 'Intro', bars: 16, tracks: drums },
    { id: uid('sec'), name: 'Groove', bars: 16, tracks: [...drums, clap.id, bass.id] },
    { id: uid('sec'), name: 'Break', bars: 16, tracks: [shaker.id, keys.id, pad.id] },
    { id: uid('sec'), name: 'Drop', bars: 32, tracks: song.tracks.map((t) => t.id) },
    { id: uid('sec'), name: 'Outro', bars: 16, tracks: drums },
  ];
  return song;
}

export const SONG_TEMPLATES = [
  { id: 'deep-house', name: 'Plantilla Deep House', description: 'Groove, bajo, acordes Am7–Dm7, pad y estructura completa. Ideal para aprender modificándola.', create: deepHouseSong },
  { id: 'vacia', name: 'Canción vacía', description: 'Solo un kick. Construye todo tú desde cero.', create: emptySong },
];
