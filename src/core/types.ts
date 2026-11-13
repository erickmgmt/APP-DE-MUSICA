// Tipos de los DATOS PERSONALES del usuario (se guardan en IndexedDB).
// El contenido educativo (lecciones, sonidos, géneros) vive en src/content y NO se guarda aquí:
// así una actualización de la app nunca sobrescribe datos personales.

import type { Song } from './studio/song';

export type ID = string;

export interface Timestamps {
  createdAt: number;
  updatedAt: number;
}

// ---------- Proyectos ----------
export type StageStatus = 'pendiente' | 'en-curso' | 'hecho';

export interface StageState {
  status: StageStatus;
  checklist: Record<string, boolean>;
  notes: string;
}

export interface MusicalKey {
  tonic: string; // 'A', 'C#', ...
  mode: 'mayor' | 'menor';
}

export interface Reference {
  id: ID;
  title: string;
  artist: string;
  notes: string;
}

export interface Instrument {
  id: ID;
  name: string;
  role: string; // kick, bajo, pad...
  source: string; // plugin o sample
  notes: string;
}

export interface FxChain {
  id: ID;
  target: string; // pista o bus: "Bajo", "Master"...
  plugins: string[]; // en orden
  notes: string;
}

export interface Problem {
  id: ID;
  text: string;
  resolved: boolean;
  createdAt: number;
}

export interface Milestone {
  id: ID;
  label: string; // "v1 - groove listo"
  observation: string;
  createdAt: number;
}

export interface Project extends Timestamps {
  id: ID;
  name: string;
  genreId: string;
  bpm: number;
  key: MusicalKey | null;
  idea: string;
  references: Reference[];
  instruments: Instrument[];
  pluginsUsed: string[];
  fxChains: FxChain[];
  stages: Record<string, StageState>;
  notes: string;
  problems: Problem[];
  milestones: Milestone[];
  archived: boolean;
  song?: Song; // canción del estudio de la app (desde v0.2)
}

export interface ProjectSnapshot {
  id: ID;
  projectId: ID;
  createdAt: number;
  reason: string;
  data: Project;
}

// ---------- Academia ----------
export interface LessonProgress {
  lessonId: string;
  started: boolean;
  exerciseDone: boolean;
  checks: Record<string, boolean>; // checklist del ejercicio (índice → hecho)
  quizBest: number; // 0..1
  quizAttempts: number;
  completedAt: number | null;
  notes: string;
  updatedAt: number;
}

// ---------- Samples del usuario ----------
export interface UserSample {
  id: ID;
  name: string;
  mime: string;
  size: number;
  duration: number; // segundos
  data: ArrayBuffer;
  createdAt: number;
}

// ---------- Plugins ----------
export type PluginFormat = 'VST2' | 'VST3' | 'CLAP' | 'JS' | 'AU' | 'Otro';
export type CpuWeight = 'ligero' | 'medio' | 'pesado' | 'desconocido';

export interface UserPlugin extends Timestamps {
  id: ID;
  name: string;
  developer: string;
  version: string;
  format: PluginFormat;
  categories: string[]; // ids de src/content/plugins/categories.ts
  cpu: CpuWeight;
  notes: string;
  favorite: boolean;
}

// ---------- Ideas ----------
export type IdeaStatus = 'nueva' | 'planificada' | 'en-desarrollo' | 'hecha' | 'descartada';
export type IdeaPriority = 'alta' | 'media' | 'baja';

export interface Idea extends Timestamps {
  id: ID;
  title: string;
  description: string;
  module: string;
  priority: IdeaPriority;
  status: IdeaStatus;
  votes: number;
}

// ---------- Tutor ----------
export interface ChatMessage {
  id: ID;
  role: 'user' | 'tutor';
  text: string;
  answerId?: string; // id de la respuesta de la base de conocimiento offline
  source?: 'offline' | 'ia';
  createdAt: number;
}

// ---------- Ajustes ----------
export interface AiSettings {
  provider: 'none' | 'openai-compatible';
  baseUrl: string; // p.ej. http://localhost:3001/v1 (tu proxy propio)
  model: string;
  shareContext: boolean; // enviar género/BPM/plugins (nunca audio)
}

export interface Settings {
  id: 'main';
  displayName: string;
  includeReaperStock: boolean;
  ai: AiSettings;
  lastBackupAt: number | null;
  onboardingDone: boolean;
}

export interface ActivityEntry {
  id: ID;
  at: number;
  kind: string; // 'project', 'idea', 'plugin', 'lesson', 'backup', 'sistema'
  text: string;
}

export interface RestorePoint {
  id: ID;
  createdAt: number;
  label: string;
  payload: string; // JSON del respaldo completo
  sizeBytes: number;
}
