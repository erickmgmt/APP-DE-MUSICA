import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { GENRES } from '../../content/producer/genres';
import { NOTES_EN, NOTES_ES } from '../../core/music/theory';
import { useLive } from '../../core/db/hooks';
import { listPlugins } from '../../core/db/repo';
import { uid } from '../../core/id';
import type { FxChain, Instrument, Project, Reference } from '../../core/types';
import { Field, Panel } from '../../components/ui';
import { SaveInput, SaveTextarea } from '../../components/SaveFields';

type Update = (fn: (p: Project) => Project, reason?: string) => Promise<void>;

function RowDelete({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn-ghost btn-sm shrink-0" onClick={onClick} aria-label="Eliminar">
      <Trash2 size={14} />
    </button>
  );
}

export function ProjectSheet({ project, update }: { project: Project; update: Update }) {
  const userPlugins = useLive(listPlugins, ['plugins']) ?? [];
  const [pluginDraft, setPluginDraft] = useState('');

  const set = <K extends keyof Project>(k: K, v: Project[K], reason = 'Ficha del proyecto') => update((p) => ({ ...p, [k]: v }), reason);

  const patchRef = (id: string, patch: Partial<Reference>) => set('references', project.references.map((r) => (r.id === id ? { ...r, ...patch } : r)), 'Referencias');
  const patchInst = (id: string, patch: Partial<Instrument>) => set('instruments', project.instruments.map((r) => (r.id === id ? { ...r, ...patch } : r)), 'Instrumentos');
  const patchChain = (id: string, patch: Partial<FxChain>) => set('fxChains', project.fxChains.map((r) => (r.id === id ? { ...r, ...patch } : r)), 'Cadenas de efectos');

  const addPluginUsed = (name: string) => {
    const n = name.trim();
    if (!n || project.pluginsUsed.includes(n)) return;
    set('pluginsUsed', [...project.pluginsUsed, n], 'Plugins usados');
    setPluginDraft('');
  };

  return (
    <div className="space-y-4">
      <Panel title="Datos básicos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre">
            <SaveInput value={project.name} onSave={(v) => set('name', v.trim() || 'Mi canción', 'Renombrar')} />
          </Field>
          <Field label="Género">
            <select className="input" value={project.genreId} onChange={(e) => set('genreId', e.target.value, 'Cambio de género')}>
              {GENRES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label="BPM">
            <SaveInput type="number" min={40} max={240} value={String(project.bpm)} onSave={(v) => { const n = Math.round(+v); if (n >= 40 && n <= 240) set('bpm', n, 'Cambio de BPM'); }} />
          </Field>
          <Field label="Tonalidad">
            <div className="flex gap-2">
              <select className="input" value={project.key?.tonic ?? ''} onChange={(e) => set('key', e.target.value ? { tonic: e.target.value, mode: project.key?.mode ?? 'menor' } : null, 'Cambio de tonalidad')}>
                <option value="">Sin definir</option>
                {NOTES_EN.map((n, i) => <option key={n} value={n}>{n} ({NOTES_ES[i]})</option>)}
              </select>
              <select className="input" disabled={!project.key} value={project.key?.mode ?? 'menor'} onChange={(e) => project.key && set('key', { ...project.key, mode: e.target.value as 'mayor' | 'menor' }, 'Cambio de tonalidad')}>
                <option value="menor">menor</option>
                <option value="mayor">mayor</option>
              </select>
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Idea musical">
              <SaveTextarea value={project.idea} onSave={(v) => set('idea', v, 'Idea')} placeholder="La emoción o imagen de la canción" className="min-h-16" />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Referencias musicales" actions={<button className="btn-ghost btn-sm" onClick={() => set('references', [...project.references, { id: uid('ref'), title: '', artist: '', notes: '' }], 'Referencias')}><Plus size={14} /> Añadir</button>}>
        {project.references.length === 0 && <p className="text-sm text-fog-400">Añade canciones que quieras usar como modelo.</p>}
        <div className="space-y-2">
          {project.references.map((r) => (
            <div key={r.id} className="panel-inset grid gap-2 p-2.5 sm:grid-cols-[1fr_1fr_2fr_auto]">
              <SaveInput value={r.title} placeholder="Título" onSave={(title) => patchRef(r.id, { title })} />
              <SaveInput value={r.artist} placeholder="Artista" onSave={(artist) => patchRef(r.id, { artist })} />
              <SaveInput value={r.notes} placeholder="Qué te gusta de ella (kick, groove, mezcla…)" onSave={(notes) => patchRef(r.id, { notes })} />
              <RowDelete onClick={() => set('references', project.references.filter((x) => x.id !== r.id), 'Referencias')} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Instrumentos y sonidos seleccionados" actions={<button className="btn-ghost btn-sm" onClick={() => set('instruments', [...project.instruments, { id: uid('ins'), name: '', role: '', source: '', notes: '' }], 'Instrumentos')}><Plus size={14} /> Añadir</button>}>
        {project.instruments.length === 0 && <p className="text-sm text-fog-400">Registra cada sonido: su papel (kick, bajo, pad…) y de dónde sale (sample o plugin).</p>}
        <div className="space-y-2">
          {project.instruments.map((r) => (
            <div key={r.id} className="panel-inset grid gap-2 p-2.5 sm:grid-cols-[1fr_1fr_1fr_1.5fr_auto]">
              <SaveInput value={r.name} placeholder="Nombre de la pista" onSave={(name) => patchInst(r.id, { name })} />
              <SaveInput value={r.role} placeholder="Papel (kick, bajo…)" onSave={(role) => patchInst(r.id, { role })} />
              <SaveInput value={r.source} placeholder="Fuente (sample / plugin)" list="user-plugins" onSave={(source) => patchInst(r.id, { source })} />
              <SaveInput value={r.notes} placeholder="Notas (preset, afinación…)" onSave={(notes) => patchInst(r.id, { notes })} />
              <RowDelete onClick={() => set('instruments', project.instruments.filter((x) => x.id !== r.id), 'Instrumentos')} />
            </div>
          ))}
        </div>
      </Panel>

      <datalist id="user-plugins">
        {userPlugins.map((p) => <option key={p.id} value={p.name} />)}
        {['ReaEQ', 'ReaComp', 'ReaLimit', 'ReaDelay', 'ReaVerbate', 'ReaSynth', 'ReaSamplOmatic5000'].map((n) => <option key={n} value={n} />)}
      </datalist>

      <Panel title="Plugins utilizados">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.pluginsUsed.length === 0 && <span className="text-sm text-fog-400">Ninguno todavía.</span>}
          {project.pluginsUsed.map((n) => (
            <span key={n} className="chip">
              {n}
              <button onClick={() => set('pluginsUsed', project.pluginsUsed.filter((x) => x !== n), 'Plugins usados')} aria-label={`Quitar ${n}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addPluginUsed(pluginDraft); }}>
          <input className="input" list="user-plugins" value={pluginDraft} onChange={(e) => setPluginDraft(e.target.value)} placeholder="Escribe o elige uno de tus plugins" />
          <button className="btn-ghost" type="submit"><Plus size={16} /></button>
        </form>
      </Panel>

      <Panel title="Cadenas de efectos" actions={<button className="btn-ghost btn-sm" onClick={() => set('fxChains', [...project.fxChains, { id: uid('fx'), target: '', plugins: [], notes: '' }], 'Cadenas de efectos')}><Plus size={14} /> Nueva cadena</button>}>
        {project.fxChains.length === 0 && <p className="text-sm text-fog-400">Documenta el orden de los plugins de cada pista o bus (ej. Bajo: ReaEQ → ReaComp con sidechain).</p>}
        <div className="space-y-3">
          {project.fxChains.map((c) => (
            <FxChainEditor key={c.id} chain={c} onChange={(patch) => patchChain(c.id, patch)} onDelete={() => set('fxChains', project.fxChains.filter((x) => x.id !== c.id), 'Cadenas de efectos')} />
          ))}
        </div>
      </Panel>

      <Panel title="Notas personales">
        <SaveTextarea value={project.notes} onSave={(v) => set('notes', v, 'Notas')} placeholder="Todo lo que quieras recordar de esta canción" />
      </Panel>
    </div>
  );
}

function FxChainEditor({ chain, onChange, onDelete }: { chain: FxChain; onChange: (p: Partial<FxChain>) => void; onDelete: () => void }) {
  const [draft, setDraft] = useState('');
  const move = (i: number, d: -1 | 1) => {
    const arr = [...chain.plugins];
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange({ plugins: arr });
  };
  return (
    <div className="panel-inset space-y-2 p-3">
      <div className="flex gap-2">
        <SaveInput value={chain.target} placeholder="Pista o bus (ej. Bajo, Master)" onSave={(target) => onChange({ target })} />
        <RowDelete onClick={onDelete} />
      </div>
      <ol className="space-y-1">
        {chain.plugins.map((p, i) => (
          <li key={`${p}-${i}`} className="flex items-center gap-2 rounded-lg bg-ink-800 px-2.5 py-1.5 text-sm">
            <span className="w-5 text-xs text-fog-400">{i + 1}.</span>
            <span className="flex-1 truncate">{p}</span>
            <button className="p-1 text-fog-400 hover:text-fog-100" onClick={() => move(i, -1)} aria-label="Subir"><ArrowUp size={14} /></button>
            <button className="p-1 text-fog-400 hover:text-fog-100" onClick={() => move(i, 1)} aria-label="Bajar"><ArrowDown size={14} /></button>
            <button className="p-1 text-fog-400 hover:text-rose" onClick={() => onChange({ plugins: chain.plugins.filter((_, j) => j !== i) })} aria-label="Quitar"><X size={14} /></button>
          </li>
        ))}
      </ol>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { onChange({ plugins: [...chain.plugins, draft.trim()] }); setDraft(''); } }}>
        <input className="input" list="user-plugins" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Añadir plugin a la cadena" />
        <button className="btn-ghost" type="submit"><Plus size={16} /></button>
      </form>
      <SaveInput value={chain.notes} placeholder="Ajustes clave (ej. ratio 4:1, release 120 ms)" onSave={(notes) => onChange({ notes })} />
    </div>
  );
}
