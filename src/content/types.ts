/**
 * Tipos del CONTENIDO EDUCATIVO (vive en el código, versionado con la app).
 *
 * Niveles de los CONSEJOS de producción:
 *  - general:      recomendación habitual en producción (punto de partida, no regla).
 *  - experimental: sugerencia creativa; se juzga con los oídos.
 * Las instrucciones de uso del estudio (StudioStep) describen la propia app, así que son exactas
 * y deben mantenerse al día si cambia la interfaz del estudio.
 */
export type Verification = 'general' | 'experimental';

/** Pestaña del estudio a la que lleva un paso ("Abrir en el estudio"). */
export type StudioView = 'pistas' | 'mezcla' | 'estructura' | 'exportar';

export interface StudioStep {
  text: string;
  tip?: string;
  view?: StudioView;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export type VisualKind =
  | 'daw-map'
  | 'studio-map'
  | 'metronome'
  | 'bar-grid'
  | 'piano'
  | 'scale-player'
  | 'key-explorer'
  | 'piano-roll'
  | 'waveform'
  | 'step-seq'
  | 'freq-spectrum';

export interface Lesson {
  id: string;
  level: 1 | 2 | 3 | 4;
  title: string;
  summary: string;
  minutes: number;
  ready: boolean; // false = contenido en preparación
  explanation: string[];
  keyPoints?: string[];
  visual?: { kind: VisualKind; caption: string; preset?: string };
  example?: { title: string; text: string };
  steps?: StudioStep[]; // cómo hacerlo en el estudio de la app
  exercise?: { goal: string; steps: string[]; check: string[] };
  mistakes?: { error: string; fix: string }[];
  quiz?: QuizQuestion[];
}

export interface Level {
  id: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  color: string;
}
