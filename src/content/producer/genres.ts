/**
 * Perfiles de género. Los rangos de BPM son ORIENTATIVOS (lo habitual, no una regla).
 * `route: 'completa'` = el productor paso a paso tiene recomendaciones específicas para cada etapa.
 * `route: 'basica'` = solo perfil general; la ruta usa recomendaciones genéricas. (Ampliable: ver CLAUDE.md)
 */
export interface Genre {
  id: string;
  name: string;
  bpm: [number, number];
  defaultBpm: number;
  route: 'completa' | 'basica';
  description: string;
  traits: string[];
  defaultKey?: { tonic: string; mode: 'mayor' | 'menor' };
}

export const GENRES: Genre[] = [
  {
    id: 'deep-house',
    name: 'Deep House',
    bpm: [118, 125],
    defaultBpm: 122,
    route: 'completa',
    description:
      'House relajado y profundo: groove con swing, bajos cálidos, acordes de séptima y novena, pads atmosféricos y una mezcla suave en los agudos.',
    traits: [
      'Kick redondo y controlado, sin distorsión agresiva',
      'Bajo cálido que dialoga con el kick (sidechain suave)',
      'Hats y shakers con swing; percusión orgánica',
      'Acordes menores con 7ª/9ª (pianos eléctricos, órganos, pads)',
      'Atmósfera: reverb y delay con gusto, texturas de fondo',
      'Arreglo largo y progresivo, pensado para DJ',
    ],
    defaultKey: { tonic: 'A', mode: 'menor' },
  },
  { id: 'house', name: 'House', bpm: [120, 128], defaultBpm: 124, route: 'basica', description: 'Groove four-on-the-floor, claps en 2 y 4, pianos, órganos y vocales con energía.', traits: ['Four-on-the-floor', 'Pianos y órganos', 'Vocales'] },
  { id: 'tech-house', name: 'Tech House', bpm: [124, 128], defaultBpm: 126, route: 'basica', description: 'Groove minimalista y percusivo, bajos rítmicos protagonistas, pocos acordes.', traits: ['Bajo protagonista', 'Percusión seca', 'Vocal chops'] },
  { id: 'afro-house', name: 'Afro House', bpm: [118, 124], defaultBpm: 122, route: 'basica', description: 'Percusión de raíz africana (congas, shakers, tambores), atmósferas amplias y cantos.', traits: ['Percusión polirrítmica', 'Atmósferas', 'Voces y cantos'] },
  { id: 'reggaeton', name: 'Reggaetón', bpm: [88, 100], defaultBpm: 94, route: 'basica', description: 'Patrón de dembow, bajos 808 o sintéticos, voces protagonistas.', traits: ['Dembow', 'Bajo 808', 'Voz al frente'] },
  { id: 'trap', name: 'Trap', bpm: [130, 150], defaultBpm: 140, route: 'basica', description: 'Se siente a medio tiempo; hi-hats rápidos con redobles, 808 largos y oscuros.', traits: ['Hi-hats con rolls', '808 con glide', 'Sensación half-time'] },
  { id: 'pop', name: 'Pop', bpm: [90, 130], defaultBpm: 110, route: 'basica', description: 'Estructura verso-estribillo, voz al centro de todo, producción limpia.', traits: ['Estribillo pegadizo', 'Voz principal', 'Arreglo claro'] },
  { id: 'edm', name: 'EDM', bpm: [124, 130], defaultBpm: 128, route: 'basica', description: 'Builds y drops enérgicos, leads brillantes, gran contraste de dinámica.', traits: ['Build-ups', 'Drops potentes', 'Leads anchos'] },
  { id: 'urbana', name: 'Música urbana', bpm: [80, 110], defaultBpm: 95, route: 'basica', description: 'Familia amplia (R&B, hip hop, latin urbano): groove, bajo y voz.', traits: ['Groove', 'Bajo', 'Voz'] },
];

export function getGenre(id: string): Genre {
  return GENRES.find((g) => g.id === id) ?? GENRES[0];
}
