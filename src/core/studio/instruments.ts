import { getNoise, playBass, playClap, playHat, playKick, playRim, playShaker, playTone } from '../audio/engine';
import { midiToFreq } from '../music/theory';

/**
 * INSTRUMENTOS INCLUIDOS EN LA APP.
 * Todos se sintetizan en tiempo real con Web Audio (no hay samples descargados), así funcionan
 * sin conexión y pesan muy poco. Son sonidos propios de la app, pensados para aprender.
 * Cada `play` recibe el nodo destino (la pista), así el mismo código sirve en vivo y al exportar.
 */
export type InstrumentKind = 'drum' | 'synth';

export interface PlayArgs {
  dest: AudioNode;
  time: number;
  midi: number; // nota (en baterías: 60 = afinación original)
  duration: number; // segundos
  velocity: number; // 0..1
}

export interface Instrument {
  id: string;
  name: string;
  kind: InstrumentKind;
  group: string;
  description: string;
  range?: [number, number]; // notas MIDI recomendadas (sintes)
  sidechainSource?: boolean; // los kicks controlan el sidechain
  play: (a: PlayArgs) => void;
}

const semis = (midi: number) => Math.pow(2, (midi - 60) / 12);

function fmKeys({ dest, time, midi, duration, velocity }: PlayArgs, bright = 1) {
  // Piano eléctrico por FM: un modulador senoidal da el timbre "campanoso"
  const c = dest.context;
  const f = midiToFreq(midi);
  const car = c.createOscillator();
  const mod = c.createOscillator();
  const modGain = c.createGain();
  const amp = c.createGain();
  car.frequency.value = f;
  mod.frequency.value = f * 1;
  modGain.gain.setValueAtTime(f * 1.6 * bright, time);
  modGain.gain.exponentialRampToValueAtTime(f * 0.15 + 1, time + 0.6);
  mod.connect(modGain).connect(car.frequency);
  const g = 0.18 * velocity;
  const rel = Math.max(0.25, duration * 0.6);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.linearRampToValueAtTime(g, time + 0.004);
  amp.gain.exponentialRampToValueAtTime(g * 0.4, time + Math.min(duration, 0.8));
  amp.gain.exponentialRampToValueAtTime(0.0001, time + duration + rel);
  car.connect(amp).connect(dest);
  const end = time + duration + rel + 0.05;
  car.start(time);
  mod.start(time);
  car.stop(end);
  mod.stop(end);
}

function organ({ dest, time, midi, duration, velocity }: PlayArgs) {
  const f = midiToFreq(midi);
  [1, 2, 3, 4].forEach((h, i) => playTone(f * h, duration, time, { type: 'sine', gain: (0.09 / (i + 1)) * velocity, attack: 0.005, release: 0.08 }, dest));
}

function superPad({ dest, time, midi, duration, velocity }: PlayArgs, cutoff: number) {
  const f = midiToFreq(midi);
  [-10, 0, 10].forEach((det) => playTone(f, duration, time, { type: 'sawtooth', gain: 0.035 * velocity, attack: 0.45, release: 1.1, cutoff, detune: det }, dest));
}

function conga(a: PlayArgs, base: number) {
  const c = a.dest.context;
  const osc = c.createOscillator();
  const g = c.createGain();
  const f = base * semis(a.midi);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(f * 1.5, a.time);
  osc.frequency.exponentialRampToValueAtTime(f, a.time + 0.03);
  g.gain.setValueAtTime(0.0001, a.time);
  g.gain.exponentialRampToValueAtTime(0.5 * a.velocity, a.time + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, a.time + 0.28);
  osc.connect(g).connect(a.dest);
  osc.start(a.time);
  osc.stop(a.time + 0.32);
}

function snare(a: PlayArgs) {
  const c = a.dest.context;
  playTone(190 * semis(a.midi), 0.02, a.time, { type: 'triangle', gain: 0.3 * a.velocity, attack: 0.001, release: 0.1 }, a.dest);
  const n = c.createBufferSource();
  n.buffer = getNoise(c);
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const g = c.createGain();
  g.gain.setValueAtTime(0.4 * a.velocity, a.time);
  g.gain.exponentialRampToValueAtTime(0.0001, a.time + 0.18);
  n.connect(hp).connect(g).connect(a.dest);
  n.start(a.time);
  n.stop(a.time + 0.2);
}

export const INSTRUMENTS: Instrument[] = [
  // ------------------------------ Baterías
  { id: 'kick-deep', name: 'Kick Deep', kind: 'drum', group: 'Kick', sidechainSource: true, description: 'Redondo y cálido, cola media. Ideal para Deep House.', play: (a) => playKick(a.time, { startFreq: 130 * semis(a.midi), endFreq: 48 * semis(a.midi), decay: 0.42, click: 0.2, gain: 0.95 * a.velocity }, a.dest) },
  { id: 'kick-punch', name: 'Kick Punch', kind: 'drum', group: 'Kick', sidechainSource: true, description: 'Más ataque y corto: house y tech house.', play: (a) => playKick(a.time, { startFreq: 180 * semis(a.midi), endFreq: 52 * semis(a.midi), decay: 0.3, click: 0.55, gain: 0.95 * a.velocity }, a.dest) },
  { id: 'kick-long', name: 'Kick 808 largo', kind: 'drum', group: 'Kick', sidechainSource: true, description: 'Cola larga y grave, estilo trap/urbano. Compite con el bajo.', play: (a) => playKick(a.time, { startFreq: 110 * semis(a.midi), endFreq: 45 * semis(a.midi), decay: 1.1, click: 0.1, gain: 0.9 * a.velocity }, a.dest) },
  { id: 'clap', name: 'Clap', kind: 'drum', group: 'Clap / Snare', description: 'Palmada multicapa para los pulsos 2 y 4.', play: (a) => playClap(a.time, 0.55 * a.velocity, a.dest) },
  { id: 'snare', name: 'Snare', kind: 'drum', group: 'Clap / Snare', description: 'Caja con cuerpo y bordonera.', play: snare },
  { id: 'hat-closed', name: 'Hi-hat cerrado', kind: 'drum', group: 'Hi-hats', description: 'Corto y brillante.', play: (a) => playHat(a.time, false, 0.2 * a.velocity, a.dest) },
  { id: 'hat-open', name: 'Hi-hat abierto', kind: 'drum', group: 'Hi-hats', description: 'El "tss" en contratiempo del house.', play: (a) => playHat(a.time, true, 0.17 * a.velocity, a.dest) },
  { id: 'shaker', name: 'Shaker', kind: 'drum', group: 'Percusión', description: 'Movimiento suave en semicorcheas.', play: (a) => playShaker(a.time, 0.13 * a.velocity, a.dest) },
  { id: 'rim', name: 'Rim', kind: 'drum', group: 'Percusión', description: 'Golpe seco para acentos sincopados.', play: (a) => playRim(a.time, 0.3 * a.velocity, a.dest) },
  { id: 'conga-low', name: 'Conga grave', kind: 'drum', group: 'Percusión', description: 'Percusión orgánica.', play: (a) => conga(a, 190) },
  { id: 'conga-high', name: 'Conga aguda', kind: 'drum', group: 'Percusión', description: 'Responde a la conga grave.', play: (a) => conga(a, 300) },

  // ------------------------------ Bajos
  { id: 'bass-deep', name: 'Bajo Deep', kind: 'synth', group: 'Bajos', range: [28, 52], description: 'Cálido y redondo: seno + triángulo filtrado.', play: (a) => playBass(midiToFreq(a.midi), a.duration, a.time, 0.42 * a.velocity, a.dest) },
  { id: 'bass-sub', name: 'Sub bajo', kind: 'synth', group: 'Bajos', range: [24, 48], description: 'Onda senoidal pura: solo peso grave.', play: (a) => playTone(midiToFreq(a.midi), a.duration, a.time, { type: 'sine', gain: 0.5 * a.velocity, attack: 0.005, release: 0.06 }, a.dest) },
  { id: 'bass-organ', name: 'Bajo órgano', kind: 'synth', group: 'Bajos', range: [28, 52], description: 'Bajo clásico del house de los 90.', play: (a) => { organ({ ...a, velocity: a.velocity * 1.4 }); } },
  { id: 'bass-saw', name: 'Bajo filtrado', kind: 'synth', group: 'Bajos', range: [28, 52], description: 'Diente de sierra con filtro: más presencia.', play: (a) => playTone(midiToFreq(a.midi), a.duration, a.time, { type: 'sawtooth', gain: 0.2 * a.velocity, attack: 0.004, release: 0.08, cutoff: 650 }, a.dest) },

  // ------------------------------ Teclas y acordes
  { id: 'keys-rhodes', name: 'Piano eléctrico', kind: 'synth', group: 'Teclas', range: [48, 79], description: 'Timbre campanoso tipo Rhodes (síntesis FM).', play: (a) => fmKeys(a) },
  { id: 'keys-soft', name: 'Piano suave', kind: 'synth', group: 'Teclas', range: [48, 84], description: 'Más redondo y oscuro.', play: (a) => fmKeys(a, 0.45) },
  { id: 'organ-stab', name: 'Órgano', kind: 'synth', group: 'Teclas', range: [48, 79], description: 'Stabs de acorde de house.', play: organ },

  // ------------------------------ Pads
  { id: 'pad-warm', name: 'Pad cálido', kind: 'synth', group: 'Pads', range: [48, 79], description: 'Ataque lento, ideal para atmósfera.', play: (a) => superPad(a, 1600) },
  { id: 'pad-dark', name: 'Pad oscuro', kind: 'synth', group: 'Pads', range: [45, 76], description: 'Más filtrado: fondo nocturno.', play: (a) => superPad(a, 800) },

  // ------------------------------ Melodía
  { id: 'pluck', name: 'Pluck', kind: 'synth', group: 'Melodía', range: [57, 88], description: 'Ataque rápido y caída corta.', play: (a) => playTone(midiToFreq(a.midi), 0.02, a.time, { type: 'sawtooth', gain: 0.2 * a.velocity, attack: 0.002, release: Math.min(0.5, 0.15 + a.duration * 0.3), cutoff: 2600 }, a.dest) },
  { id: 'lead-soft', name: 'Lead suave', kind: 'synth', group: 'Melodía', range: [60, 88], description: 'Melodía principal discreta.', play: (a) => playTone(midiToFreq(a.midi), a.duration, a.time, { type: 'triangle', gain: 0.2 * a.velocity, attack: 0.01, release: 0.2, cutoff: 4000 }, a.dest) },
  { id: 'bell', name: 'Campana', kind: 'synth', group: 'Melodía', range: [64, 96], description: 'Brillante y etérea.', play: (a) => fmKeys({ ...a, duration: a.duration * 0.5 }, 2.2) },
];

export function getInstrument(id: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.id === id);
}
