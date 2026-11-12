import type { Lesson, Level } from '../types';
import { LEVEL1 } from './level1';

export const LEVELS: Level[] = [
  { id: 1, title: 'Fundamentos', subtitle: 'DAW, REAPER, ritmo, notas, MIDI y audio', color: '#2dd4bf' },
  { id: 2, title: 'Producción', subtitle: 'Batería, bajo, sintes, arreglo y transiciones', color: '#8b5cf6' },
  { id: 3, title: 'Mezcla', subtitle: 'Ganancia, EQ, compresión, espacio y automatización', color: '#3b82f6' },
  { id: 4, title: 'Mastering', subtitle: 'Loudness, LUFS, True Peak y exportación', color: '#fbbf24' },
];

/** Lecciones planificadas: aparecen en la ruta pero su contenido llega en próximas versiones. */
function planned(level: 2 | 3 | 4, items: [string, string, string][]): Lesson[] {
  return items.map(([id, title, summary]) => ({
    id,
    level,
    title,
    summary,
    minutes: 15,
    ready: false,
    explanation: [],
  }));
}

const LEVEL2 = planned(2, [
  ['l2-kick', 'Kick', 'Elegir, afinar y procesar el kick que sostiene el groove.'],
  ['l2-clap', 'Clap', 'Capas, cola y posición del clap.'],
  ['l2-snare', 'Snare', 'Cuándo usar snare en lugar de clap.'],
  ['l2-hats', 'Hi-hats', 'Cerrados, abiertos, velocity y swing.'],
  ['l2-perc', 'Percusiones', 'Shakers, congas, rims y groove secundario.'],
  ['l2-bass', 'Bassline', 'Bajos Deep House: notas, ritmo y convivencia con el kick.'],
  ['l2-synths', 'Synths', 'Osciladores, filtros y envolventes.'],
  ['l2-pads', 'Pads', 'Atmósfera y acordes sostenidos.'],
  ['l2-leads', 'Leads', 'Melodías principales que no saturan la mezcla.'],
  ['l2-arreglo', 'Arreglos', 'Estructura: intro, groove, break, drop, outro.'],
  ['l2-transiciones', 'Transiciones', 'Risers, filtros, cortes y fills.'],
]);

const LEVEL3 = planned(3, [
  ['l3-ganancia', 'Ganancia', 'Gain staging: niveles sanos antes de mezclar.'],
  ['l3-balance', 'Balance de volumen', 'La mezcla empieza con los faders.'],
  ['l3-paneo', 'Paneo', 'Ancho estéreo y qué debe ir al centro.'],
  ['l3-eq', 'Ecualización', 'Limpiar, hacer espacio y dar carácter.'],
  ['l3-comp', 'Compresión', 'Controlar dinámica y dar pegada.'],
  ['l3-sat', 'Saturación', 'Armónicos, calidez y presencia.'],
  ['l3-reverb', 'Reverb', 'Profundidad y espacio sin enturbiar.'],
  ['l3-delay', 'Delay', 'Ecos rítmicos sincronizados al BPM.'],
  ['l3-sidechain', 'Sidechain', 'Que el kick respire sobre el bajo.'],
  ['l3-auto', 'Automatizaciones', 'Movimiento y evolución en el tiempo.'],
]);

const LEVEL4 = planned(4, [
  ['l4-headroom', 'Headroom', 'El margen que necesita el mastering.'],
  ['l4-loudness', 'Loudness', 'Volumen percibido frente a picos.'],
  ['l4-lufs', 'LUFS', 'Cómo se mide la sonoridad.'],
  ['l4-truepeak', 'True Peak', 'Picos entre muestras y por qué importan.'],
  ['l4-limit', 'Limitadores', 'Subir el volumen sin romper la mezcla.'],
  ['l4-eqmaster', 'EQ de mastering', 'Ajustes amplios y suaves.'],
  ['l4-buscomp', 'Compresión de bus', 'Cohesión ("glue") del master.'],
  ['l4-referencias', 'Referencias comerciales', 'Comparar con criterio y al mismo volumen.'],
  ['l4-export', 'Exportación', 'Render en REAPER: formatos y opciones.'],
  ['l4-plataformas', 'Plataformas digitales', 'Normalización y entrega.'],
]);

export const LESSONS: Lesson[] = [...LEVEL1, ...LEVEL2, ...LEVEL3, ...LEVEL4];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function lessonsOfLevel(level: number): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}

export const PASS_THRESHOLD = 0.7;
