import { describe, expect, it } from 'vitest';
import { searchSounds } from '../src/core/search/soundSearch';
import { matchQuestion } from '../src/core/ai/tutorEngine';
import { isUnlocked, nextLesson, scoreQuiz } from '../src/core/academyLogic';
import { LESSONS, getLesson } from '../src/content/academy';
import { scaleNoteNames, relativeKey, midiToFreq, midiToName, noteMs } from '../src/core/music/theory';
import { advise } from '../src/core/producerAdvisor';
import { normalizeProject } from '../src/core/db/repo';

describe('buscador de sonidos', () => {
  it('entiende "sonido atmosférico para el fondo"', () => {
    const r = searchSounds('Necesito un sonido atmosférico para el fondo de mi canción');
    expect(r.detected).toContain('ambiente / atmósfera');
    expect(r.detected).toContain('capa de fondo');
    expect(['pad', 'texture']).toContain(r.results[0].sound.category);
  });
  it('detecta graves', () => {
    const r = searchSounds('algo con mucho peso grave');
    expect(['bass', 'kick']).toContain(r.results[0].sound.category);
  });
  it('detecta transición', () => {
    expect(searchSounds('tensión antes del drop').results[0].sound.category).toBe('fx');
  });
});

describe('profesor offline', () => {
  const cases: [string, string][] = [
    ['Mi kick y mi bajo se están peleando', 'kick-bajo'],
    ['Quiero que mi canción tenga más profundidad', 'profundidad'],
    ['No sé qué poner en el segundo drop', 'segundo-drop'],
    ['Mi mezcla suena muy opaca', 'opaca'],
    ['¿Qué hago después de terminar la batería?', 'despues-bateria'],
    ['la app hace chasquidos y se traba', 'cpu'],
    ['mi pista no suena', 'midi-no-suena'],
    ['como hago sidechain', 'sidechain'],
    ['cuantos LUFS para spotify', 'lufs'],
  ];
  it.each(cases)('"%s" → %s', (q, id) => {
    expect(matchQuestion(q).best?.answer.id).toBe(id);
  });
  it('no inventa respuesta para preguntas sin relación', () => {
    expect(matchQuestion('receta de tortilla').best).toBeUndefined();
  });
});

describe('academia', () => {
  it('solo la primera lección está desbloqueada al inicio', () => {
    expect(isUnlocked(LESSONS[0], {})).toBe(true);
    expect(isUnlocked(LESSONS[1], {})).toBe(false);
    expect(nextLesson({})?.id).toBe('l1-daw');
  });
  it('aprobar desbloquea la siguiente; suspender no', () => {
    const base = { started: true, checks: {}, quizAttempts: 1, completedAt: null, notes: '', updatedAt: 0 };
    const fail = { 'l1-daw': { ...base, lessonId: 'l1-daw', exerciseDone: true, quizBest: 0.5 } };
    expect(isUnlocked(LESSONS[1], fail)).toBe(false);
    const pass = { 'l1-daw': { ...base, lessonId: 'l1-daw', exerciseDone: true, quizBest: 0.75 } };
    expect(isUnlocked(LESSONS[1], pass)).toBe(true);
  });
  it('puntúa la evaluación', () => {
    const l = getLesson('l1-daw')!;
    expect(scoreQuiz(l.quiz!.map((q) => q.answer), l)).toBe(1);
  });
});

describe('teoría musical', () => {
  it('escalas y relativas', () => {
    expect(scaleNoteNames('A', 'menor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(scaleNoteNames('C', 'mayor')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(scaleNoteNames('A', 'pent-menor')).toEqual(['A', 'C', 'D', 'E', 'G']);
    expect(relativeKey('C', 'mayor')).toEqual({ tonic: 'A', mode: 'menor' });
    expect(relativeKey('A', 'menor')).toEqual({ tonic: 'C', mode: 'mayor' });
  });
  it('frecuencias y nombres (C4 = MIDI 60)', () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
    expect(midiToFreq(33)).toBeCloseTo(55); // A1
    expect(midiToName(60)).toBe('C4');
    expect(noteMs(120, 4)).toBe(500);
    expect(noteMs(122, 4)).toBeCloseTo(491.8, 1);
  });
});

describe('productor', () => {
  it('avisa si el BPM está fuera del rango del género', () => {
    const p = normalizeProject({ id: 'x', genreId: 'deep-house', bpm: 140 });
    expect(advise(p).some((n) => n.text.includes('fuera del rango'))).toBe(true);
  });
});
