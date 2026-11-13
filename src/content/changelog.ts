/** Registro de cambios de la APP (visible en Sistema). Mantener sincronizado con CHANGELOG.md. */
export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const APP_VERSION = '0.2.0';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-11-13',
    title: 'App independiente con estudio propio',
    changes: [
      'Nuevo Estudio: produce dentro de la app sin otro programa. Pistas de batería (16 pasos, acentos, afinación), instrumentos con editor de notas (modo Acorde y "solo notas de la escala") y samples propios.',
      '23 instrumentos incluidos (kicks, claps, hats, percusión, bajos, pianos, órgano, pads, plucks, lead, campana), sintetizados en el dispositivo.',
      'Mezcla: volumen, mute/solo, paneo, EQ de 3 bandas, filtro, reverb, delay sincronizado, sidechain del kick, limitador de protección, medidor de pico y espectro.',
      'Estructura: convierte el loop en canción (Intro, Groove, Break, Drop, Outro) y reprodúcela en modo Canción.',
      'Exportación a WAV 16/24 bits con medición real de pico y loudness integrado (LUFS, BS.1770).',
      'Plantilla Deep House lista para sonar y aprender modificándola. Deshacer y guardado automático.',
      'Se elimina REAPER: lecciones, guía paso a paso y profesor enseñan con el estudio de la app. Se retira el catálogo de plugins (los datos guardados se conservan).',
      'Los samples se incluyen en la copia de seguridad descargada.',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-11-12',
    title: 'Primera versión funcional',
    changes: [
      'Estudio (dashboard) con progreso, proyectos, siguiente paso y visualizador de espectro real.',
      'Academia: Nivel 1 completo (10 lecciones interactivas con ejercicios, evaluación y progreso). Niveles 2–4 planificados.',
      'Productor paso a paso: proyectos con 15 etapas, ruta completa de Deep House, consejos contextuales, ficha, problemas, versiones e historial restaurable.',
      'Biblioteca de sonidos con buscador por intención y ejemplos sintetizados.',
      'Profesor: base de conocimiento offline con respuestas en 6 partes y conexión opcional a IA mediante tu propio servidor.',
      'Ideas y mejoras con prioridades y generación de instrucciones para Claude Code.',
      'Sistema: copias de seguridad (exportar/importar), puntos de restauración, proyectos recuperables, registro de actividad y mapa de módulos.',
      'Instalable como PWA y funcionamiento sin conexión.',
    ],
  },
];
