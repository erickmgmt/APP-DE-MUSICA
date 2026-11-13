import { normalize } from '../id';
import { TUTOR_KB, type TutorAnswer } from '../../content/tutor/knowledge';

export interface TutorMatch {
  answer: TutorAnswer;
  score: number;
}

/** Motor offline: encuentra la respuesta de la base de conocimiento que mejor encaja. */
export function matchQuestion(question: string): { best?: TutorMatch; alternatives: TutorMatch[] } {
  const q = normalize(question);
  if (!q) return { alternatives: [] };
  const words = q.split(' ');
  const scored: TutorMatch[] = TUTOR_KB.map((answer) => {
    let score = 0;
    for (const group of answer.triggers) {
      if (group.every((t) => q.includes(t))) score += 6 + group.length;
    }
    for (const kw of answer.keywords) {
      const stem = kw.slice(0, Math.max(4, kw.length - 2));
      if (words.some((w) => w.startsWith(stem) || (w.length >= 4 && kw.startsWith(w)))) score += 1.5;
    }
    return { answer, score };
  })
    .filter((m) => m.score >= 3)
    .sort((a, b) => b.score - a.score);
  const [best, ...rest] = scored;
  return { best, alternatives: rest.slice(0, 3) };
}

export const SUGGESTED_QUESTIONS = [
  'Mi kick y mi bajo se están peleando',
  'Quiero que mi canción tenga más profundidad',
  'No sé qué poner en el segundo drop',
  'Mi mezcla suena muy opaca',
  '¿Qué hago después de terminar la batería?',
  'La app se traba y hace cortes',
  '¿Cuántos LUFS debe tener mi master?',
  'Mi groove suena robótico',
];
