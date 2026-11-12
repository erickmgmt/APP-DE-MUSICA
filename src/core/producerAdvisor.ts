import { getGenre } from '../content/producer/genres';
import { STAGES, type Stage } from '../content/producer/stages';
import type { Project } from './types';

export interface AdvisorNote {
  tone: 'info' | 'warn' | 'ok';
  text: string;
  stageId?: string;
}

export function stageDone(project: Project, stageId: string): boolean {
  return project.stages[stageId]?.status === 'hecho';
}

export function checklistRatio(project: Project, stage: Stage): number {
  const st = project.stages[stage.id];
  if (!st || !stage.checklist.length) return 0;
  return stage.checklist.filter((c) => st.checklist[c.id]).length / stage.checklist.length;
}

export function projectProgress(project: Project): { done: number; total: number; pct: number } {
  const done = STAGES.filter((s) => stageDone(project, s.id)).length;
  return { done, total: STAGES.length, pct: done / STAGES.length };
}

export function currentStage(project: Project): Stage {
  return STAGES.find((s) => !stageDone(project, s.id)) ?? STAGES[STAGES.length - 1];
}

/**
 * El "productor": observa el estado del proyecto y da consejos contextuales.
 * No es una lista rígida: permite trabajar fuera de orden, pero avisa de lo que falta.
 */
export function advise(project: Project): AdvisorNote[] {
  const notes: AdvisorNote[] = [];
  const genre = getGenre(project.genreId);
  const cur = currentStage(project);
  const order = cur.order;

  if (project.bpm < genre.bpm[0] || project.bpm > genre.bpm[1]) {
    notes.push({ tone: 'warn', stageId: 'tempo-tono', text: `Tu BPM (${project.bpm}) está fuera del rango habitual de ${genre.name} (${genre.bpm[0]}–${genre.bpm[1]}). Puede ser una decisión artística; si no lo es, ajústalo antes de grabar audio.` });
  }
  if (!project.key && order >= 3) {
    notes.push({ tone: 'warn', stageId: 'tempo-tono', text: 'Aún no has definido la tonalidad. Hazlo antes del bajo y los acordes para que todo encaje.' });
  }
  if (project.references.length === 0) {
    notes.push({ tone: 'info', stageId: 'idea', text: 'Añade al menos una canción de referencia: la usarás para comparar sonidos, estructura y mezcla.' });
  }
  // etapas posteriores marcadas antes que anteriores
  const skipped = STAGES.filter((s) => s.order < order && !stageDone(project, s.id));
  const laterDone = STAGES.filter((s) => s.order > order && stageDone(project, s.id));
  if (laterDone.length && skipped.length === 0) {
    notes.push({ tone: 'info', text: `Has avanzado etapas posteriores (${laterDone.map((s) => s.title).join(', ')}). Está bien trabajar fuera de orden; vuelve a "${cur.title}" cuando puedas.` });
  }
  // etapas marcadas como hechas con checklist incompleta
  for (const s of STAGES) {
    if (stageDone(project, s.id) && checklistRatio(project, s) < 1) {
      notes.push({ tone: 'info', stageId: s.id, text: `"${s.title}" está marcada como hecha pero su checklist no está completa. Revisa si te falta algo.` });
    }
  }
  const pending = project.problems.filter((p) => !p.resolved);
  if (pending.length) {
    notes.push({ tone: 'warn', text: `Tienes ${pending.length} problema(s) pendiente(s). Puedes preguntar al Profesor por cada uno.` });
  }
  if (order >= 13 && !stageDone(project, 'mezcla') && project.problems.length === 0) {
    notes.push({ tone: 'info', stageId: 'mezcla', text: 'Durante la mezcla, anota en "Problemas" todo lo que no te convenza: así no se te olvida nada.' });
  }
  if (notes.length === 0) {
    notes.push({ tone: 'ok', stageId: cur.id, text: `Todo en orden. Siguiente paso: ${cur.title} — ${cur.goal}` });
  }
  // Los avisos importantes primero
  const rank = { warn: 0, info: 1, ok: 2 } as const;
  return notes.sort((a, b) => rank[a.tone] - rank[b.tone]);
}
