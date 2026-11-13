/**
 * Teoría musical básica (temperamento igual, La4 = 440 Hz).
 * Nombres anglosajones (C D E...) y latinos (Do Re Mi...) — la mayoría de programas musicales usan los anglosajones.
 */

export const NOTES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'] as const;

export type NoteName = (typeof NOTES_EN)[number];

/** Número MIDI → frecuencia. MIDI 69 = A4 = 440 Hz; MIDI 60 = C4 (Do central). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Nombre de nota con octava: el Do central (MIDI 60) es C4. */
export function midiToName(midi: number, latin = false): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${latin ? NOTES_ES[pc] : NOTES_EN[pc]}${octave}`;
}

export function pitchClass(note: string): number {
  const idx = NOTES_EN.indexOf(note as NoteName);
  if (idx < 0) throw new Error(`Nota desconocida: ${note}`);
  return idx;
}

export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);
}

export interface ScaleDef {
  id: string;
  name: string;
  intervals: number[]; // semitonos desde la tónica
  pattern: string; // T = tono, S = semitono
  mood: string;
}

export const SCALES: ScaleDef[] = [
  { id: 'mayor', name: 'Mayor (jónica)', intervals: [0, 2, 4, 5, 7, 9, 11], pattern: 'T T S T T T S', mood: 'Luminosa, alegre, estable.' },
  { id: 'menor', name: 'Menor natural (eólica)', intervals: [0, 2, 3, 5, 7, 8, 10], pattern: 'T S T T S T T', mood: 'Melancólica, nocturna. Muy usada en Deep House.' },
  { id: 'dorica', name: 'Dórica', intervals: [0, 2, 3, 5, 7, 9, 10], pattern: 'T S T T T S T', mood: 'Menor pero con un toque esperanzador (6ª mayor). Frecuente en house y jazz.' },
  { id: 'pent-menor', name: 'Pentatónica menor', intervals: [0, 3, 5, 7, 10], pattern: '3S T T 3S T', mood: 'Cinco notas que casi nunca "suenan mal". Ideal para empezar melodías y bajos.' },
  { id: 'pent-mayor', name: 'Pentatónica mayor', intervals: [0, 2, 4, 7, 9], pattern: 'T T 3S T 3S', mood: 'Abierta y alegre, sin tensiones.' },
];

export function scaleNotes(tonic: string, scaleId: string): number[] {
  const scale = SCALES.find((s) => s.id === scaleId);
  if (!scale) throw new Error(`Escala desconocida: ${scaleId}`);
  const root = pitchClass(tonic);
  return scale.intervals.map((i) => (root + i) % 12);
}

export function scaleNoteNames(tonic: string, scaleId: string, latin = false): string[] {
  return scaleNotes(tonic, scaleId).map((pc) => (latin ? NOTES_ES[pc] : NOTES_EN[pc]));
}

/** Tonalidad relativa: La menor ↔ Do mayor comparten notas. */
export function relativeKey(tonic: string, mode: 'mayor' | 'menor'): { tonic: string; mode: 'mayor' | 'menor' } {
  const pc = pitchClass(tonic);
  return mode === 'mayor'
    ? { tonic: NOTES_EN[(pc + 9) % 12], mode: 'menor' }
    : { tonic: NOTES_EN[(pc + 3) % 12], mode: 'mayor' };
}

export interface ChordDef {
  id: string;
  name: string;
  symbol: string;
  intervals: number[];
}

export const CHORDS: ChordDef[] = [
  { id: 'maj', name: 'Mayor', symbol: '', intervals: [0, 4, 7] },
  { id: 'min', name: 'Menor', symbol: 'm', intervals: [0, 3, 7] },
  { id: 'min7', name: 'Menor séptima', symbol: 'm7', intervals: [0, 3, 7, 10] },
  { id: 'maj7', name: 'Mayor séptima', symbol: 'maj7', intervals: [0, 4, 7, 11] },
  { id: 'min9', name: 'Menor novena', symbol: 'm9', intervals: [0, 3, 7, 10, 14] },
];

export function chordMidi(rootMidi: number, chordId: string): number[] {
  const chord = CHORDS.find((c) => c.id === chordId);
  if (!chord) throw new Error(`Acorde desconocido: ${chordId}`);
  return chord.intervals.map((i) => rootMidi + i);
}

/** Milisegundos por nota a un BPM dado (útil para delays y release de compresores). */
export function noteMs(bpm: number, division: 1 | 2 | 4 | 8 | 16 | 32, dotted = false): number {
  const quarter = 60000 / bpm;
  const ms = quarter * (4 / division);
  return dotted ? ms * 1.5 : ms;
}

/** Duración de N compases de 4/4. */
export function barsToSeconds(bars: number, bpm: number, beatsPerBar = 4): number {
  return (bars * beatsPerBar * 60) / bpm;
}
