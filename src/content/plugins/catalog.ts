/**
 * Catálogo de referencia de plugins.
 * - REAPER_STOCK: incluidos con REAPER (Cockos). Nombres tal como aparecen en el navegador de FX.
 * - FREE_ALTERNATIVES: plugins gratuitos conocidos. Descárgalos SIEMPRE desde la web oficial del
 *   desarrollador y comprueba la compatibilidad con tu sistema. Algunos requieren crear una cuenta.
 * No se listan versiones: cambian con frecuencia. Registra la tuya en "Mis plugins".
 * El peso de CPU es orientativo y depende de los ajustes y de tu equipo.
 */
export interface PluginCategory {
  id: string;
  name: string;
  need: string; // qué necesidad resuelve
}

export const PLUGIN_CATEGORIES: PluginCategory[] = [
  { id: 'eq', name: 'Ecualizador', need: 'Limpiar frecuencias, hacer espacio, cambiar el tono' },
  { id: 'comp', name: 'Compresor', need: 'Controlar dinámica, dar pegada, sidechain' },
  { id: 'limiter', name: 'Limitador', need: 'Controlar picos y dar volumen final (mastering)' },
  { id: 'reverb', name: 'Reverb', need: 'Espacio y profundidad' },
  { id: 'delay', name: 'Delay', need: 'Ecos rítmicos' },
  { id: 'saturation', name: 'Saturación', need: 'Armónicos, calidez, presencia' },
  { id: 'filter', name: 'Filtro', need: 'Barridos y recortes de frecuencia' },
  { id: 'stereo', name: 'Imagen estéreo', need: 'Ancho y comprobación mono' },
  { id: 'meter', name: 'Medidor / analizador', need: 'Ver LUFS, picos y espectro' },
  { id: 'synth', name: 'Sintetizador', need: 'Bajos, pads, leads, plucks' },
  { id: 'sampler', name: 'Sampler', need: 'Tocar samples (baterías, one-shots)' },
  { id: 'utility', name: 'Utilidad', need: 'Ganancia, MIDI, enrutado, afinación' },
];

export type Cpu = 'ligero' | 'medio' | 'pesado';

export interface ReferencePlugin {
  name: string;
  developer: string;
  categories: string[];
  cpu: Cpu;
  description: string;
  note?: string;
}

export const REAPER_STOCK: ReferencePlugin[] = [
  { name: 'ReaEQ', developer: 'Cockos', categories: ['eq', 'filter'], cpu: 'ligero', description: 'Ecualizador paramétrico con bandas configurables (shelf, band, low/high pass, notch...).' },
  { name: 'ReaComp', developer: 'Cockos', categories: ['comp'], cpu: 'ligero', description: 'Compresor con entrada de detector auxiliar para sidechain.' },
  { name: 'ReaXcomp', developer: 'Cockos', categories: ['comp'], cpu: 'ligero', description: 'Compresor multibanda.' },
  { name: 'ReaGate', developer: 'Cockos', categories: ['utility'], cpu: 'ligero', description: 'Puerta de ruido (gate).' },
  { name: 'ReaLimit', developer: 'Cockos', categories: ['limiter'], cpu: 'ligero', description: 'Limitador brickwall para el master.', note: 'Incluido en versiones recientes de REAPER; búscalo en el navegador de FX.' },
  { name: 'ReaDelay', developer: 'Cockos', categories: ['delay'], cpu: 'ligero', description: 'Delay multitap con longitud en tiempo o en valores musicales.' },
  { name: 'ReaVerbate', developer: 'Cockos', categories: ['reverb'], cpu: 'ligero', description: 'Reverb algorítmica sencilla y ligera.' },
  { name: 'ReaVerb', developer: 'Cockos', categories: ['reverb'], cpu: 'medio', description: 'Reverb por convolución (respuestas de impulso).' },
  { name: 'ReaFir', developer: 'Cockos', categories: ['eq', 'meter', 'utility'], cpu: 'medio', description: 'Procesador FFT: EQ, analizador, reducción de ruido.' },
  { name: 'ReaSynth', developer: 'Cockos', categories: ['synth'], cpu: 'ligero', description: 'Sintetizador sencillo: útil para bajos y pruebas.' },
  { name: 'ReaSamplOmatic5000', developer: 'Cockos', categories: ['sampler'], cpu: 'ligero', description: 'Sampler para one-shots y baterías (RS5k).' },
  { name: 'ReaTune', developer: 'Cockos', categories: ['utility'], cpu: 'ligero', description: 'Afinador y corrección de tono.' },
  { name: 'ReaPitch', developer: 'Cockos', categories: ['utility'], cpu: 'medio', description: 'Cambio de tono.' },
  { name: 'ReaControlMIDI', developer: 'Cockos', categories: ['utility'], cpu: 'ligero', description: 'Envío y control de mensajes MIDI.' },
  { name: 'JS: Loudness Meter Peak/RMS/LUFS', developer: 'Cockos (JSFX)', categories: ['meter'], cpu: 'ligero', description: 'Medidor de loudness con LUFS y picos.', note: 'Escribe "loudness" en el navegador de FX; el nombre exacto puede variar.' },
];

export const FREE_ALTERNATIVES: ReferencePlugin[] = [
  { name: 'TDR Nova', developer: 'Tokyo Dawn Records', categories: ['eq', 'comp'], cpu: 'ligero', description: 'EQ paramétrico dinámico gratuito.' },
  { name: 'TDR Kotelnikov', developer: 'Tokyo Dawn Records', categories: ['comp'], cpu: 'medio', description: 'Compresor de bus/mastering transparente.' },
  { name: 'Klanghelm DC1A', developer: 'Klanghelm', categories: ['comp'], cpu: 'ligero', description: 'Compresor sencillo de dos controles con carácter.' },
  { name: 'LoudMax', developer: 'Thomas Mundt', categories: ['limiter'], cpu: 'ligero', description: 'Limitador/maximizador sencillo.' },
  { name: 'Limiter No6', developer: 'vladg/sound', categories: ['limiter', 'comp'], cpu: 'medio', description: 'Limitador por etapas para mastering.' },
  { name: 'Valhalla Supermassive', developer: 'Valhalla DSP', categories: ['reverb', 'delay'], cpu: 'medio', description: 'Reverbs y delays enormes y atmosféricos.' },
  { name: 'OrilRiver', developer: 'Denis Tihanov', categories: ['reverb'], cpu: 'ligero', description: 'Reverb algorítmica gratuita.' },
  { name: 'Softube Saturation Knob', developer: 'Softube', categories: ['saturation'], cpu: 'ligero', description: 'Saturación de un solo control.', note: 'Requiere cuenta de Softube.' },
  { name: 'Airwindows (colección)', developer: 'Airwindows', categories: ['saturation', 'eq', 'comp', 'utility'], cpu: 'ligero', description: 'Cientos de plugins sencillos y muy ligeros (interfaz mínima).' },
  { name: 'Kilohearts Essentials', developer: 'Kilohearts', categories: ['filter', 'delay', 'saturation', 'stereo', 'utility'], cpu: 'ligero', description: 'Colección de efectos básicos.', note: 'Requiere cuenta.' },
  { name: 'Xfer OTT', developer: 'Xfer Records', categories: ['comp'], cpu: 'ligero', description: 'Compresión multibanda agresiva (usar con moderación).' },
  { name: 'Wider', developer: 'Polyverse / Infected Mushroom', categories: ['stereo'], cpu: 'ligero', description: 'Ensanchador estéreo compatible con mono.' },
  { name: 'Youlean Loudness Meter 2 (Free)', developer: 'Youlean', categories: ['meter'], cpu: 'ligero', description: 'Medidor de LUFS, True Peak y rango dinámico.' },
  { name: 'Voxengo SPAN', developer: 'Voxengo', categories: ['meter'], cpu: 'ligero', description: 'Analizador de espectro.' },
  { name: 'MeldaProduction MFreeFxBundle', developer: 'MeldaProduction', categories: ['eq', 'comp', 'meter', 'stereo', 'utility'], cpu: 'medio', description: 'Gran colección de efectos gratuitos.' },
  { name: 'Surge XT', developer: 'Surge Synth Team', categories: ['synth'], cpu: 'medio', description: 'Sintetizador completo y de código abierto.' },
  { name: 'Vital (versión gratuita)', developer: 'Matt Tytel', categories: ['synth'], cpu: 'pesado', description: 'Sintetizador de wavetable muy versátil.', note: 'Puede exigir bastante a un Celeron: congela la pista cuando termines.' },
  { name: 'TAL-NoiseMaker', developer: 'TAL Software', categories: ['synth'], cpu: 'ligero', description: 'Sintetizador analógico virtual sencillo; bueno para bajos y pads.' },
  { name: 'u-he Podolski', developer: 'u-he', categories: ['synth'], cpu: 'ligero', description: 'Sintetizador virtual analógico sencillo.' },
  { name: 'u-he Tyrell N6', developer: 'u-he', categories: ['synth'], cpu: 'medio', description: 'Sintetizador de estilo analógico clásico.' },
  { name: 'Dexed', developer: 'Digital Suburban', categories: ['synth'], cpu: 'ligero', description: 'Sintetizador FM (pianos eléctricos, bajos FM).' },
  { name: 'Decent Sampler', developer: 'Decent Samples', categories: ['sampler'], cpu: 'ligero', description: 'Reproductor de librerías de samples gratuitas.' },
  { name: 'Spitfire LABS', developer: 'Spitfire Audio', categories: ['sampler'], cpu: 'medio', description: 'Instrumentos sampleados gratuitos (pianos, pads, texturas).', note: 'Las librerías ocupan espacio en disco.' },
];

/** Para el asesor: qué categoría de plugin pide cada tipo de tarea. */
export const TASK_TO_CATEGORY: Record<string, string> = {
  eq: 'eq',
  sidechain: 'comp',
  comp: 'comp',
  limiter: 'limiter',
  reverb: 'reverb',
  delay: 'delay',
  saturation: 'saturation',
  meter: 'meter',
  synth: 'synth',
  sampler: 'sampler',
};
