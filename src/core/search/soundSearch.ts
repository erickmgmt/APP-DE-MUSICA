import { normalize } from '../id';
import { SOUNDS, type SoundEntry } from '../../content/sounds/library';

/**
 * Buscador por intención (sin IA, funciona offline).
 * Convierte frases como "necesito un sonido atmosférico para el fondo" en categorías y rasgos.
 */
interface Intent {
  terms: string[]; // términos normalizados que activan la intención
  label: string; // explicación para el usuario
  categories: Record<string, number>; // peso por categoría
}

const INTENTS: Intent[] = [
  { terms: ['atmosfer', 'ambient', 'etere', 'espacio', 'profund', 'colchon'], label: 'ambiente / atmósfera', categories: { pad: 3, texture: 3, fx: 1 } },
  { terms: ['fondo', 'background', 'detras', 'relleno'], label: 'capa de fondo', categories: { pad: 2, texture: 3 } },
  { terms: ['grave', 'peso', 'sub', 'bajo', 'bass', 'low'], label: 'graves', categories: { bass: 3, kick: 2 } },
  { terms: ['golpe', 'pegada', 'pulso', 'bombo', 'kick'], label: 'golpe / pulso', categories: { kick: 3, clap: 1, fx: 1 } },
  { terms: ['ritmo', 'groove', 'movimiento', 'balanceo', 'bailable'], label: 'ritmo / groove', categories: { hihat: 2, perc: 3, bass: 1 } },
  { terms: ['brillo', 'agudo', 'brillante', 'chispa', 'aire'], label: 'brillo / agudos', categories: { hihat: 3, perc: 2, texture: 1 } },
  { terms: ['organic', 'humano', 'natural', 'real', 'tribal', 'africa'], label: 'orgánico / humano', categories: { perc: 3, vocal: 2, texture: 2 } },
  { terms: ['melodi', 'tararear', 'hook', 'pegadiz', 'tema'], label: 'melodía', categories: { lead: 3, pluck: 3, vocal: 1 } },
  { terms: ['acorde', 'armoni', 'emocion', 'jazz', 'soul'], label: 'armonía / acordes', categories: { synth: 3, pad: 2 } },
  { terms: ['calid', 'suave', 'redond', 'vintage', 'retro'], label: 'calidez', categories: { synth: 2, pad: 2, bass: 1, texture: 2 } },
  { terms: ['tension', 'subida', 'transicion', 'build', 'antes del drop', 'barrido', 'sweep'], label: 'transición / tensión', categories: { fx: 4 } },
  { terms: ['voz', 'vocal', 'cantante', 'canto', 'frase'], label: 'voz', categories: { vocal: 4 } },
  { terms: ['backbeat', 'palmada', 'clap', 'caja', 'snare'], label: 'backbeat', categories: { clap: 3, snare: 3 } },
  { terms: ['oscur', 'misterio', 'noche', 'nocturn', 'melancol'], label: 'oscuro / nocturno', categories: { pad: 2, texture: 2, synth: 1 } },
];

const GENRE_TERMS: Record<string, string> = {
  'deep house': 'Deep House',
  'tech house': 'Tech House',
  'afro house': 'Afro House',
  house: 'House',
  reggaeton: 'Reggaetón',
  trap: 'Trap',
  pop: 'Pop',
  edm: 'EDM',
  urban: 'Música urbana',
};

const STOP = new Set(['un', 'una', 'el', 'la', 'los', 'las', 'de', 'del', 'para', 'por', 'mi', 'que', 'y', 'o', 'en', 'con', 'necesito', 'quiero', 'busco', 'sonido', 'sonidos', 'algo', 'cancion', 'tema', 'me', 'se', 'lo', 'al', 'a']);

export interface SoundResult {
  sound: SoundEntry;
  score: number;
  reasons: string[];
}

export interface SearchOutcome {
  detected: string[]; // intenciones detectadas
  genre?: string;
  results: SoundResult[];
}

export function searchSounds(query: string, limit = 8): SearchOutcome {
  const q = normalize(query);
  if (!q) return { detected: [], results: [] };
  const words = q.split(' ').filter((w) => w.length > 1 && !STOP.has(w));

  // 1. Intenciones
  const catWeight: Record<string, number> = {};
  const detected: string[] = [];
  for (const intent of INTENTS) {
    if (intent.terms.some((t) => q.includes(t))) {
      detected.push(intent.label);
      for (const [c, w] of Object.entries(intent.categories)) catWeight[c] = (catWeight[c] ?? 0) + w;
    }
  }

  // 2. Género mencionado
  let genre: string | undefined;
  for (const [term, name] of Object.entries(GENRE_TERMS)) {
    if (q.includes(term)) {
      genre = name;
      break;
    }
  }

  // 3. Puntuación por sonido
  const results: SoundResult[] = SOUNDS.map((sound) => {
    let score = 0;
    const reasons: string[] = [];
    const cw = catWeight[sound.category] ?? 0;
    if (cw) {
      score += cw * 2;
      reasons.push(`encaja con: ${detected.filter((d) => INTENTS.find((i) => i.label === d)?.categories[sound.category]).join(', ')}`);
    }
    const haystack = normalize([sound.name, sound.what, sound.purpose, ...sound.keywords].join(' '));
    const kwHits = words.filter((w) => w.length > 2 && haystack.includes(w.slice(0, Math.max(4, w.length - 2))));
    if (kwHits.length) {
      score += kwHits.length * 2;
      reasons.push(`palabras: ${kwHits.join(', ')}`);
    }
    if (genre) {
      if (sound.genres.includes(genre) || sound.genres.includes('Todos')) {
        score += 2;
        reasons.push(`usado en ${genre}`);
      } else score -= 2;
    }
    return { sound, score, reasons };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { detected, genre, results };
}
