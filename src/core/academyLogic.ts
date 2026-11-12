import { LESSONS, PASS_THRESHOLD } from '../content/academy';
import type { Lesson } from '../content/types';
import type { LessonProgress } from './types';

/**
 * Reglas de avance (pedagógicas):
 * - Una lección está COMPLETA cuando el ejercicio está hecho y la evaluación supera el 70 %.
 * - Una lección se DESBLOQUEA cuando la anterior está completa. No se salta a temas complejos.
 * - El primer tema de un nivel se desbloquea al completar todas las lecciones disponibles del nivel anterior.
 */
export function isComplete(p: LessonProgress | undefined): boolean {
  return !!p && p.exerciseDone && p.quizBest >= PASS_THRESHOLD;
}

export function isUnlocked(lesson: Lesson, progress: Record<string, LessonProgress>): boolean {
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  if (idx <= 0) return true;
  const prevReady = LESSONS.slice(0, idx).filter((l) => l.ready);
  if (prevReady.length === 0) return true;
  // todas las lecciones disponibles anteriores deben estar completas
  return prevReady.every((l) => isComplete(progress[l.id]));
}

export function nextLesson(progress: Record<string, LessonProgress>): Lesson | undefined {
  return LESSONS.find((l) => l.ready && !isComplete(progress[l.id]) && isUnlocked(l, progress));
}

export function levelStats(level: number, progress: Record<string, LessonProgress>) {
  const lessons = LESSONS.filter((l) => l.level === level);
  const ready = lessons.filter((l) => l.ready);
  const done = ready.filter((l) => isComplete(progress[l.id]));
  return { total: lessons.length, ready: ready.length, done: done.length };
}

export function overallStats(progress: Record<string, LessonProgress>) {
  const ready = LESSONS.filter((l) => l.ready);
  const done = ready.filter((l) => isComplete(progress[l.id]));
  return { ready: ready.length, done: done.length, pct: ready.length ? done.length / ready.length : 0 };
}

export function scoreQuiz(answers: (number | null)[], lesson: Lesson): number {
  const quiz = lesson.quiz ?? [];
  if (!quiz.length) return 0;
  const correct = quiz.filter((q, i) => answers[i] === q.answer).length;
  return correct / quiz.length;
}
