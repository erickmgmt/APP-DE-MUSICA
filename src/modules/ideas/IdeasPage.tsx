import { useMemo, useState } from 'react';
import { ArrowUp, Copy, Lightbulb, Plus, Trash2, Wand2 } from 'lucide-react';
import { MODULES } from '../registry';
import { useLive } from '../../core/db/hooks';
import { deleteIdea, listIdeas, saveIdea } from '../../core/db/repo';
import type { Idea, IdeaPriority, IdeaStatus } from '../../core/types';
import { EmptyState, Field, Modal, PageHeader, Panel, cx } from '../../components/ui';
import { toast } from '../../components/ui/toast';
import { formatDate } from '../../core/id';

const STATUSES: { id: IdeaStatus; label: string; cls: string }[] = [
  { id: 'nueva', label: 'Nueva', cls: 'border-electric/50 text-[#93c5fd]' },
  { id: 'planificada', label: 'Planificada', cls: 'border-violet/50 text-violet-soft' },
  { id: 'en-desarrollo', label: 'En desarrollo', cls: 'border-amber/50 text-amber' },
  { id: 'hecha', label: 'Hecha', cls: 'border-teal/50 text-teal' },
  { id: 'descartada', label: 'Descartada', cls: 'text-fog-400' },
];
const PRIORITIES: { id: IdeaPriority; label: string; weight: number }[] = [
  { id: 'alta', label: 'Alta', weight: 3 },
  { id: 'media', label: 'Media', weight: 2 },
  { id: 'baja', label: 'Baja', weight: 1 },
];
const moduleName = (id: string) => (id === 'nuevo' ? 'Módulo nuevo' : MODULES.find((m) => m.id === id)?.title ?? id);

export function buildFeaturePrompt(i: Idea): string {
  return `Quiero añadir una funcionalidad a Reaper Academy.

Idea: ${i.title}
Descripción: ${i.description || '(sin descripción)'}
Módulo: ${moduleName(i.module)}
Prioridad: ${i.priority}

Instrucciones:
- Lee primero CLAUDE.md y respeta sus reglas (datos personales intactos, migraciones aditivas, niveles de verificación en instrucciones de REAPER, sin botones decorativos).
- Analiza cómo encaja con la arquitectura actual (src/modules/registry.ts) y propón el diseño antes de implementarlo si es grande.
- Implementa, añade pruebas, ejecuta "npm test" y "npm run build", y verifica en el navegador.
- Actualiza CHANGELOG.md, src/content/changelog.ts y la documentación.`;
}

export default function IdeasPage() {
  const ideas = useLive(listIdeas, ['ideas']);
  const [filter, setFilter] = useState<IdeaStatus | 'activas' | 'todas'>('activas');
  const [form, setForm] = useState({ title: '', description: '', module: 'nuevo', priority: 'media' as IdeaPriority });
  const [promptFor, setPromptFor] = useState<Idea | null>(null);

  const sorted = useMemo(() => {
    const list = (ideas ?? []).filter((i) => (filter === 'todas' ? true : filter === 'activas' ? !['hecha', 'descartada'].includes(i.status) : i.status === filter));
    const w = (p: IdeaPriority) => PRIORITIES.find((x) => x.id === p)!.weight;
    return list.sort((a, b) => w(b.priority) - w(a.priority) || b.votes - a.votes || b.createdAt - a.createdAt);
  }, [ideas, filter]);

  if (!ideas) return null;

  const add = async () => {
    if (!form.title.trim()) return;
    await saveIdea({ ...form, title: form.title.trim(), description: form.description.trim(), status: 'nueva', votes: 0 });
    setForm({ ...form, title: '', description: '' });
    toast('Idea registrada');
  };
  const patch = (i: Idea, p: Partial<Idea>) => saveIdea({ ...i, ...p });

  return (
    <>
      <PageHeader eyebrow="Sistema evolutivo" title="Ideas y mejoras" subtitle="Registra lo que quieres que la app aprenda a hacer, priorízalo y conviértelo en una instrucción lista para desarrollarla con Claude Code." />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Panel title="Nueva idea" className="h-fit lg:sticky lg:top-6">
          <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void add(); }}>
            <Field label="Idea *"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej.: módulo para crear bajos estilo Deep House" /></Field>
            <Field label="Descripción"><textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Qué problema resuelve, cómo te imaginas usarla…" /></Field>
            <Field label="Módulo">
              <select className="input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
                <option value="nuevo">Módulo nuevo</option>
                {MODULES.map((m) => <option key={m.id} value={m.id}>{m.title}{m.status === 'planeado' ? ' (planeado)' : ''}</option>)}
              </select>
            </Field>
            <div>
              <span className="label">Prioridad</span>
              <div className="flex gap-1 rounded-xl border border-ink-600 bg-ink-850 p-1">
                {PRIORITIES.map((p) => (
                  <button type="button" key={p.id} onClick={() => setForm({ ...form, priority: p.id })} className={cx('flex-1 rounded-lg py-1.5 text-sm', form.priority === p.id ? 'bg-ink-600 text-fog-100' : 'text-fog-400')}>{p.label}</button>
                ))}
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={!form.title.trim()}><Plus size={16} /> Guardar idea</button>
          </form>
        </Panel>

        <div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[{ id: 'activas', label: 'Activas' }, ...STATUSES, { id: 'todas', label: 'Todas' }].map((s) => (
              <button key={s.id} className={cx('chip', filter === s.id && 'border-violet bg-violet/15 text-fog-100')} onClick={() => setFilter(s.id as typeof filter)}>
                {s.label} ({s.id === 'todas' ? ideas.length : s.id === 'activas' ? ideas.filter((i) => !['hecha', 'descartada'].includes(i.status)).length : ideas.filter((i) => i.status === s.id).length})
              </button>
            ))}
          </div>
          {sorted.length === 0 ? (
            <EmptyState icon={<Lightbulb />} title="No hay ideas en esta vista" text="Escribe tu primera idea a la izquierda. Ejemplo: «Agrega un módulo para aprender a crear bajos estilo Deep House»." />
          ) : (
            <div className="space-y-2">
              {sorted.map((i) => {
                const st = STATUSES.find((s) => s.id === i.status)!;
                return (
                  <div key={i.id} className="panel p-4">
                    <div className="flex items-start gap-3">
                      <button className="flex flex-col items-center rounded-lg border border-ink-600 px-2 py-1 text-xs text-fog-300 hover:border-violet" onClick={() => patch(i, { votes: i.votes + 1 })} title="Votar (más importante)">
                        <ArrowUp size={14} />
                        {i.votes}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{i.title}</p>
                        {i.description && <p className="mt-0.5 whitespace-pre-wrap text-sm text-fog-300">{i.description}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className={cx('chip', st.cls)}>{st.label}</span>
                          <span className="chip">Prioridad {i.priority}</span>
                          <span className="chip">{moduleName(i.module)}</span>
                          <span className="text-fog-400">{formatDate(i.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-600/60 pt-3">
                      <select className="input w-auto py-1 text-xs" value={i.status} onChange={(e) => patch(i, { status: e.target.value as IdeaStatus })} aria-label="Estado">
                        {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <select className="input w-auto py-1 text-xs" value={i.priority} onChange={(e) => patch(i, { priority: e.target.value as IdeaPriority })} aria-label="Prioridad">
                        {PRIORITIES.map((p) => <option key={p.id} value={p.id}>Prioridad {p.label.toLowerCase()}</option>)}
                      </select>
                      <button className="btn-ghost btn-sm" onClick={() => { setPromptFor(i); if (i.status === 'nueva') void patch(i, { status: 'planificada' }); }}>
                        <Wand2 size={14} /> Convertir en funcionalidad
                      </button>
                      <button className="btn-ghost btn-sm ml-auto" onClick={() => confirm('¿Eliminar esta idea?') && deleteIdea(i.id)} aria-label="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal open={!!promptFor} onClose={() => setPromptFor(null)} title="Instrucción para Claude Code" wide>
        {promptFor && (
          <div className="space-y-3">
            <p className="text-sm text-fog-300">Copia este texto y pégalo en una sesión de Claude Code abierta sobre el repositorio de la app. Claude seguirá las reglas de CLAUDE.md para añadir la función sin romper las anteriores ni tus datos.</p>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-ink-600 bg-ink-950 p-3 font-mono text-xs text-fog-200">{buildFeaturePrompt(promptFor)}</pre>
            <button className="btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(buildFeaturePrompt(promptFor)); toast('Copiado al portapapeles'); } catch { toast('No se pudo copiar: selecciona el texto manualmente', 'error'); } }}>
              <Copy size={16} /> Copiar
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
