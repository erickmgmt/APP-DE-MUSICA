/** Registro de cambios de la APP (visible en Sistema). Mantener sincronizado con CHANGELOG.md. */
export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const APP_VERSION = '0.1.0';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-11-12',
    title: 'Primera versión funcional',
    changes: [
      'Estudio (dashboard) con progreso, proyectos, siguiente paso y visualizador de espectro real.',
      'Academia: Nivel 1 completo (10 lecciones interactivas con ejercicios, evaluación y progreso). Niveles 2–4 planificados.',
      'Productor paso a paso: proyectos con 15 etapas, ruta completa de Deep House, consejos contextuales, ficha, problemas, versiones e historial restaurable.',
      'Biblioteca de sonidos con buscador por intención y ejemplos sintetizados.',
      'Catálogo personal de plugins y recomendador (tuyos → REAPER → gratuitos ligeros).',
      'Profesor: base de conocimiento offline con respuestas en 6 partes y conexión opcional a IA mediante tu propio servidor.',
      'Ideas y mejoras con prioridades y generación de instrucciones para Claude Code.',
      'Sistema: copias de seguridad (exportar/importar), puntos de restauración, proyectos recuperables, registro de actividad y mapa de módulos.',
      'Instalable como PWA y funcionamiento sin conexión.',
    ],
  },
];
