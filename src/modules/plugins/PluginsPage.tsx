import { useState } from 'react';
import { Pencil, Plug, Plus, Star, Trash2 } from 'lucide-react';
import { FREE_ALTERNATIVES, PLUGIN_CATEGORIES, REAPER_STOCK, type ReferencePlugin } from '../../content/plugins/catalog';
import { useLive } from '../../core/db/hooks';
import { deletePlugin, getSettings, listPlugins, savePlugin, updateSettings } from '../../core/db/repo';
import { suggestPlugins } from '../../core/pluginAdvisor';
import type { CpuWeight, PluginFormat, UserPlugin } from '../../core/types';
import { Callout, EmptyState, Field, Modal, PageHeader, Panel, Tabs, cx } from '../../components/ui';
import { toast } from '../../components/ui/toast';

type Tab = 'mios' | 'recomendador' | 'reaper' | 'gratis';
type Draft = Omit<UserPlugin, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: number };

const EMPTY: Draft = { name: '', developer: '', version: '', format: 'VST3', categories: [], cpu: 'desconocido', notes: '', favorite: false };
const FORMATS: PluginFormat[] = ['VST3', 'VST2', 'CLAP', 'JS', 'AU', 'Otro'];
const CPUS: CpuWeight[] = ['ligero', 'medio', 'pesado', 'desconocido'];
const catName = (id: string) => PLUGIN_CATEGORIES.find((c) => c.id === id)?.name ?? id;

function CpuChip({ cpu }: { cpu: string }) {
  return <span className={cx('chip text-[10px]', cpu === 'ligero' ? 'border-teal/40 text-teal' : cpu === 'pesado' ? 'border-rose/40 text-rose' : cpu === 'medio' ? 'border-amber/40 text-amber' : '')}>CPU {cpu}</span>;
}

function RefList({ items, onAdd, mine }: { items: ReferencePlugin[]; onAdd: (p: ReferencePlugin) => void; mine: Set<string> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((p) => (
        <div key={p.name} className="panel p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-fog-400">{p.developer}</p>
            </div>
            <CpuChip cpu={p.cpu} />
          </div>
          <p className="mt-1.5 text-sm text-fog-300">{p.description}</p>
          {p.note && <p className="mt-1 text-xs text-amber">{p.note}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {p.categories.map((c) => <span key={c} className="chip text-[10px]">{catName(c)}</span>)}
            <button className="btn-ghost btn-sm ml-auto" disabled={mine.has(p.name.toLowerCase())} onClick={() => onAdd(p)}>
              {mine.has(p.name.toLowerCase()) ? 'Ya registrado' : <><Plus size={14} /> Lo tengo</>}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PluginsPage() {
  const plugins = useLive(listPlugins, ['plugins']);
  const settings = useLive(getSettings, ['settings']);
  const [tab, setTab] = useState<Tab>('mios');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [need, setNeed] = useState('eq');
  if (!plugins || !settings) return null;
  const mine = new Set(plugins.map((p) => p.name.toLowerCase()));

  const save = async () => {
    if (!draft?.name.trim()) return;
    await savePlugin({ ...draft, name: draft.name.trim() });
    toast(draft.id ? 'Plugin actualizado' : 'Plugin registrado');
    setDraft(null);
  };
  const fromRef = (p: ReferencePlugin) => setDraft({ ...EMPTY, name: p.name, developer: p.developer, categories: p.categories, cpu: p.cpu, format: p.developer.includes('JSFX') ? 'JS' : 'VST3' });

  return (
    <>
      <PageHeader eyebrow="Catálogo personal" title="Plugins" subtitle="Registra lo que tienes instalado. Las recomendaciones de toda la app priorizan tus plugins, después los nativos de REAPER y por último alternativas gratuitas y ligeras." actions={<button className="btn-primary" onClick={() => setDraft({ ...EMPTY })}><Plus size={16} /> Registrar plugin</button>} />

      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: 'mios', label: `Mis plugins (${plugins.length})` }, { id: 'recomendador', label: 'Recomendador' }, { id: 'reaper', label: 'Incluidos en REAPER' }, { id: 'gratis', label: 'Gratuitos' }]} />

      {tab === 'mios' && (
        plugins.length === 0 ? (
          <EmptyState icon={<Plug />} title="Todavía no registraste plugins" text='En REAPER abre el navegador de FX (botón FX de una pista) para ver qué tienes instalado. Puedes registrar los nativos o los gratuitos desde sus pestañas con "Lo tengo".' action={<button className="btn-primary" onClick={() => setDraft({ ...EMPTY })}><Plus size={16} /> Registrar el primero</button>} />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {plugins.map((p) => (
              <div key={p.id} className="panel p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-semibold">{p.favorite && <Star size={14} className="fill-amber text-amber" />}<span className="truncate">{p.name}</span></p>
                    <p className="text-xs text-fog-400">{[p.developer, p.version && `v${p.version}`, p.format].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="btn-ghost btn-sm" onClick={() => setDraft(p)} aria-label="Editar"><Pencil size={14} /></button>
                    <button className="btn-ghost btn-sm" onClick={async () => { if (confirm(`¿Eliminar ${p.name} de tu catálogo?`)) { await deletePlugin(p.id); toast('Plugin eliminado'); } }} aria-label="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <CpuChip cpu={p.cpu} />
                  {p.categories.map((c) => <span key={c} className="chip text-[10px]">{catName(c)}</span>)}
                </div>
                {p.notes && <p className="mt-2 text-sm text-fog-300">{p.notes}</p>}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'recomendador' && (
        <Panel>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm text-fog-300" htmlFor="need">Necesito…</label>
            <select id="need" className="input w-auto" value={need} onChange={(e) => setNeed(e.target.value)}>
              {PLUGIN_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.need}</option>)}
            </select>
            <label className="ml-auto flex items-center gap-2 text-sm text-fog-300">
              <input type="checkbox" checked={settings.includeReaperStock} onChange={(e) => updateSettings({ includeReaperStock: e.target.checked })} /> Incluir nativos de REAPER
            </label>
          </div>
          <ol className="space-y-2">
            {suggestPlugins(need, plugins, settings.includeReaperStock).map((s, i) => (
              <li key={s.name} className="panel-inset flex items-start gap-3 p-3">
                <span className="w-5 pt-0.5 text-right text-xs text-fog-400">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {s.name}
                    <span className={cx('chip text-[10px]', s.source === 'tuyo' ? 'border-teal/50 text-teal' : s.source === 'reaper' ? 'border-electric/50 text-[#93c5fd]' : '')}>{s.source === 'tuyo' ? 'Instalado' : s.source === 'reaper' ? 'Incluido en REAPER' : 'Gratuito — descargar'}</span>
                    <CpuChip cpu={s.cpu} />
                  </p>
                  <p className="text-xs text-fog-400">{s.detail}</p>
                  {s.note && <p className="text-xs text-amber">{s.note}</p>}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Callout tone="info">Para tu equipo (Celeron N4020, 8 GB) prioriza los marcados como "CPU ligero". Descarga los gratuitos solo desde la web oficial de cada desarrollador y comprueba que sean compatibles con tu sistema.</Callout>
          </div>
        </Panel>
      )}

      {tab === 'reaper' && <RefList items={REAPER_STOCK} onAdd={fromRef} mine={mine} />}
      {tab === 'gratis' && (
        <>
          <div className="mb-3"><Callout tone="info">Lista de plugins gratuitos conocidos (sin versión: cambian con frecuencia). No se descargan desde aquí: búscalos en la web oficial del desarrollador.</Callout></div>
          <RefList items={FREE_ALTERNATIVES} onAdd={fromRef} mine={mine} />
        </>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Editar plugin' : 'Registrar plugin'}>
        {draft && (
          <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void save(); }}>
            <Field label="Nombre *"><input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required autoFocus /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Desarrollador"><input className="input" value={draft.developer} onChange={(e) => setDraft({ ...draft, developer: e.target.value })} /></Field>
              <Field label="Versión"><input className="input" value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} placeholder="ej. 2.1.0" /></Field>
              <Field label="Formato">
                <select className="input" value={draft.format} onChange={(e) => setDraft({ ...draft, format: e.target.value as PluginFormat })}>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select>
              </Field>
              <Field label="Consumo de CPU">
                <select className="input" value={draft.cpu} onChange={(e) => setDraft({ ...draft, cpu: e.target.value as CpuWeight })}>{CPUS.map((c) => <option key={c}>{c}</option>)}</select>
              </Field>
            </div>
            <div>
              <span className="label">Categorías</span>
              <div className="flex flex-wrap gap-1.5">
                {PLUGIN_CATEGORIES.map((c) => {
                  const on = draft.categories.includes(c.id);
                  return (
                    <button type="button" key={c.id} className={cx('chip', on && 'border-violet bg-violet/15 text-fog-100')} onClick={() => setDraft({ ...draft, categories: on ? draft.categories.filter((x) => x !== c.id) : [...draft.categories, c.id] })}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Notas"><textarea className="input min-h-16" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Presets favoritos, para qué lo usas…" /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.favorite} onChange={(e) => setDraft({ ...draft, favorite: e.target.checked })} /> Favorito (se recomienda primero)</label>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setDraft(null)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={!draft.name.trim()}>Guardar</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
