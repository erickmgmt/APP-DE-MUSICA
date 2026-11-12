import { FREE_ALTERNATIVES, REAPER_STOCK, type ReferencePlugin } from '../content/plugins/catalog';
import type { UserPlugin } from './types';

export interface PluginSuggestion {
  name: string;
  source: 'tuyo' | 'reaper' | 'gratuito';
  cpu: string;
  detail: string;
  note?: string;
}

const CPU_ORDER: Record<string, number> = { ligero: 0, medio: 1, desconocido: 2, pesado: 3 };

/**
 * Recomienda plugins para una categoría con esta prioridad:
 * 1) los que TÚ tienes registrados (favoritos y ligeros primero),
 * 2) los nativos de REAPER (si los incluyes),
 * 3) alternativas gratuitas, de más ligera a más pesada.
 */
export function suggestPlugins(category: string, userPlugins: UserPlugin[], includeStock: boolean): PluginSuggestion[] {
  const mine = userPlugins
    .filter((p) => p.categories.includes(category))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || CPU_ORDER[a.cpu] - CPU_ORDER[b.cpu])
    .map<PluginSuggestion>((p) => ({
      name: p.name,
      source: 'tuyo',
      cpu: p.cpu,
      detail: [p.developer, p.version && `v${p.version}`, p.format].filter(Boolean).join(' · '),
      note: p.notes || undefined,
    }));
  const mineNames = new Set(mine.map((m) => m.name.toLowerCase()));
  const ref = (list: ReferencePlugin[], source: PluginSuggestion['source']) =>
    list
      .filter((p) => p.categories.includes(category) && !mineNames.has(p.name.toLowerCase()))
      .sort((a, b) => CPU_ORDER[a.cpu] - CPU_ORDER[b.cpu])
      .map<PluginSuggestion>((p) => ({ name: p.name, source, cpu: p.cpu, detail: `${p.developer} — ${p.description}`, note: p.note }));
  return [...mine, ...(includeStock ? ref(REAPER_STOCK, 'reaper') : []), ...ref(FREE_ALTERNATIVES, 'gratuito')];
}
