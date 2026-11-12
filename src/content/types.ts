/**
 * Tipos del CONTENIDO EDUCATIVO (vive en el código, versionado con la app).
 *
 * Niveles de verificación — toda instrucción de REAPER debe llevar uno:
 *  - verificado:   función estándar de REAPER 7 con la configuración por defecto.
 *  - confirmar:    existe en REAPER, pero el nombre/ubicación puede variar según versión,
 *                  tema o paquete de idioma. El usuario debe confirmarlo en su pantalla.
 *  - general:      recomendación general de producción (punto de partida, no regla).
 *  - experimental: sugerencia creativa; se juzga con los oídos.
 */
export type Verification = 'verificado' | 'confirmar' | 'general' | 'experimental';

export interface MenuPath {
  en: string[]; // texto original de REAPER (inglés)
  es?: string[]; // traducción habitual; tu paquete de idioma puede usar otro texto
}

export interface ReaperStep {
  text: string;
  menu?: MenuPath;
  shortcut?: string; // atajo por defecto de REAPER
  level: Verification;
  tip?: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export type VisualKind =
  | 'daw-map'
  | 'reaper-map'
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
  reaper?: ReaperStep[];
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
