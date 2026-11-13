import { describe, expect, it } from 'vitest';
import { deepHouseSong, emptySong, normalizeSong, resolveStep, setLoopBars, totalBars, audibleTracks, STEPS_PER_BAR } from '../src/core/studio/song';
import { INSTRUMENTS, getInstrument } from '../src/core/studio/instruments';
import { encodeWav, samplePeakDb } from '../src/core/studio/wav';
import { scaleNotes } from '../src/core/music/theory';

describe('canción del estudio', () => {
  it('la plantilla Deep House es coherente', () => {
    const s = deepHouseSong();
    expect(s.tracks.length).toBeGreaterThanOrEqual(7);
    s.tracks.forEach((t) => expect(getInstrument(t.instrument), t.instrument).toBeTruthy());
    expect(totalBars(s)).toBe(96);
    // todas las notas en La menor
    const am = new Set(scaleNotes('A', 'menor'));
    s.tracks.flatMap((t) => t.notes).forEach((n) => expect(am.has(n.pitch % 12)).toBe(true));
    // el kick suena en los 4 pulsos
    const kick = s.tracks.find((t) => t.name === 'Kick')!;
    expect([0, 4, 8, 12].every((i) => kick.steps[i] > 0)).toBe(true);
  });

  it('recorre la estructura y termina', () => {
    const s = deepHouseSong();
    const first = resolveStep(s, 0, 'cancion')!;
    expect(first.sectionIndex).toBe(0);
    expect(first.active.size).toBe(3); // intro solo batería
    const drop = resolveStep(s, 48 * STEPS_PER_BAR, 'cancion')!;
    expect(s.sections[drop.sectionIndex].name).toBe('Drop');
    expect(drop.loopStep).toBe(0);
    expect(resolveStep(s, 96 * STEPS_PER_BAR, 'cancion')).toBeNull();
    expect(resolveStep(s, 1000, 'loop')!.loopStep).toBe(1000 % 64);
  });

  it('cambiar la duración del loop conserva lo programado', () => {
    const s = setLoopBars(emptySong(), 1);
    s.tracks[0].steps[0] = 1;
    const s4 = setLoopBars(s, 4);
    expect(s4.tracks[0].steps).toHaveLength(64);
    expect(s4.tracks[0].steps[16]).toBe(1);
  });

  it('mute y solo', () => {
    const s = deepHouseSong();
    s.tracks[0].solo = true;
    expect(audibleTracks(s).size).toBe(1);
    s.tracks[0].solo = false;
    s.tracks[1].mute = true;
    expect(audibleTracks(s).has(s.tracks[1].id)).toBe(false);
  });

  it('normaliza canciones incompletas', () => {
    const n = normalizeSong({ loopBars: 2, tracks: [{ id: 'x', kind: 'drum', instrument: 'clap' } as never] });
    expect(n.tracks[0].steps).toHaveLength(32);
    expect(n.tracks[0].volume).toBe(-6);
    expect(n.limiter).toBe(true);
  });

  it('instrumentos con ids únicos', () => {
    expect(new Set(INSTRUMENTS.map((i) => i.id)).size).toBe(INSTRUMENTS.length);
  });
});

describe('WAV', () => {
  const fake = (vals: number[]) => ({ numberOfChannels: 2, sampleRate: 44100, length: vals.length, getChannelData: () => Float32Array.from(vals) });
  it('cabecera correcta', async () => {
    const blob = encodeWav(fake([0, 0.5, -0.5, 1]), 16);
    expect(blob.size).toBe(44 + 4 * 2 * 2);
    const head = new TextDecoder().decode((await blob.arrayBuffer()).slice(0, 4));
    expect(head).toBe('RIFF');
    expect(encodeWav(fake([0, 1]), 24).size).toBe(44 + 2 * 2 * 3);
  });
  it('mide el pico real', () => {
    expect(samplePeakDb(fake([0, 0.5, -0.25]))).toBeCloseTo(-6.02, 1);
  });
});

import { integratedLufs } from '../src/core/studio/loudness';
describe('loudness (BS.1770)', () => {
  // Referencia EBU Tech 3341: seno estéreo de 1 kHz a -23 dBFS por canal = -23 LUFS
  const sine = (dbfs: number, sr: number) => Float32Array.from({ length: sr * 5 }, (_, i) => Math.pow(10, dbfs / 20) * Math.sin((2 * Math.PI * 1000 * i) / sr));
  it('seno estéreo 1 kHz a -23 dBFS ≈ -23 LUFS (48 kHz y 44,1 kHz)', () => {
    for (const sr of [48000, 44100]) {
      const data = sine(-23, sr);
      expect(integratedLufs({ numberOfChannels: 2, sampleRate: sr, length: data.length, getChannelData: () => data })).toBeCloseTo(-23, 0);
    }
  });
  it('mono: 3 dB menos', () => {
    const data = sine(-20, 48000);
    expect(integratedLufs({ numberOfChannels: 1, sampleRate: 48000, length: data.length, getChannelData: () => data })).toBeCloseTo(-23, 0);
  });
  it('silencio = -∞', () => {
    const data = new Float32Array(48000);
    expect(integratedLufs({ numberOfChannels: 2, sampleRate: 48000, length: data.length, getChannelData: () => data })).toBe(-Infinity);
  });
});
