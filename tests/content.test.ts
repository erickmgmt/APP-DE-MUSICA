import { describe, expect, it } from 'vitest';
import { LESSONS } from '../src/content/academy';
import { STAGES } from '../src/content/producer/stages';
import { SOUNDS, SOUND_CATEGORIES } from '../src/content/sounds/library';
import { TUTOR_KB } from '../src/content/tutor/knowledge';
import { PLUGIN_CATEGORIES, REAPER_STOCK, FREE_ALTERNATIVES } from '../src/content/plugins/catalog';
import type { ReaperStep } from '../src/content/types';

const LEVELS = ['verificado', 'confirmar', 'general', 'experimental'];
const checkSteps = (steps: ReaperStep[] | undefined, where: string) =>
  (steps ?? []).forEach((s) => expect(LEVELS, `${where}: ${s.text}`).toContain(s.level));

describe('integridad del contenido', () => {
  it('ids únicos', () => {
    for (const list of [LESSONS, STAGES, SOUNDS, TUTOR_KB]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it('cada lección disponible tiene las 8 partes', () => {
    for (const l of LESSONS.filter((x) => x.ready)) {
      expect(l.explanation.length, l.id).toBeGreaterThan(0);
      expect(l.visual, l.id).toBeTruthy();
      expect(l.example, l.id).toBeTruthy();
      expect(l.reaper?.length, l.id).toBeGreaterThan(0);
      expect(l.exercise?.check.length, l.id).toBeGreaterThan(0);
      expect(l.mistakes?.length, l.id).toBeGreaterThan(0);
      expect(l.quiz!.length, l.id).toBeGreaterThanOrEqual(3);
      l.quiz!.forEach((q) => expect(q.answer).toBeLessThan(q.options.length));
      checkSteps(l.reaper, l.id);
    }
  });
  it('las 15 etapas tienen checklist y nivel de verificación en cada paso y consejo', () => {
    expect(STAGES).toHaveLength(15);
    for (const s of STAGES) {
      expect(s.checklist.length).toBeGreaterThan(0);
      expect(s.byGenre['deep-house'], `Deep House en ${s.id}`).toBeTruthy();
      for (const g of [s.generic, ...Object.values(s.byGenre)]) {
        checkSteps(g!.reaper, s.id);
        [...g!.recommendations, ...(g!.avoid ?? [])].forEach((a) => {
          expect(LEVELS).toContain(a.level);
          expect(a.why.length).toBeGreaterThan(10);
        });
      }
    }
  });
  it('sonidos con categorías válidas', () => {
    const cats = SOUND_CATEGORIES.map((c) => c.id);
    SOUNDS.forEach((s) => {
      expect(cats).toContain(s.category);
      expect(s.freq.low).toBeLessThan(s.freq.high);
    });
  });
  it('plugins con categorías válidas', () => {
    const cats = PLUGIN_CATEGORIES.map((c) => c.id);
    [...REAPER_STOCK, ...FREE_ALTERNATIVES].forEach((p) => p.categories.forEach((c) => expect(cats).toContain(c)));
  });
  it('respuestas del profesor completas', () => {
    TUTOR_KB.forEach((a) => {
      expect(a.solution.length).toBeGreaterThan(0);
      expect(a.verify.length).toBeGreaterThan(0);
      checkSteps(a.steps, a.id);
    });
  });
});
