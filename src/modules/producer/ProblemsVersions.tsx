import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Flag, Plus, Trash2 } from 'lucide-react';
import { uid, formatDate } from '../../core/id';
import type { Project } from '../../core/types';
import { Check, Field, Panel, cx } from '../../components/ui';

type Update = (fn: (p: Project) => Project, reason?: string, snap?: 'auto' | 'force' | 'none') => Promise<void>;

export function ProblemsVersions({ project, update }: { project: Project; update: Update }) {
  const [problem, setProblem] = useState('');
  const [label, setLabel] = useState('');
  const [obs, setObs] = useState('');

  const addProblem = () => {
    if (!problem.trim()) return;
    void update((p) => ({ ...p, problems: [{ id: uid('pb'), text: problem.trim(), resolved: false, createdAt: Date.now() }, ...p.problems] }), 'Problemas');
    setProblem('');
  };
  const addMilestone = () => {
    if (!label.trim()) return;
    void update((p) => ({ ...p, milestones: [{ id: uid('ms'), label: label.trim(), observation: obs.trim(), createdAt: Date.now() }, ...p.milestones] }), `Versión: ${label.trim()}`, 'force');
    setLabel('');
    setObs('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Problemas pendientes">
        <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addProblem(); }}>
          <input className="input" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Ej.: el kick y el bajo se pelean" />
          <button className="btn-primary" type="submit" aria-label="Añadir problema"><Plus size={16} /></button>
        </form>
        {project.problems.length === 0 && <p className="text-sm text-fog-400">Sin problemas registrados.</p>}
        <ul className="space-y-2">
          {project.problems.map((pb) => (
            <li key={pb.id} className={cx('panel-inset flex items-start gap-3 p-3', pb.resolved && 'opacity-60')}>
              <Check
                className="mt-1"
                checked={pb.resolved}
                onToggle={() => update((p) => ({ ...p, problems: p.problems.map((x) => (x.id === pb.id ? { ...x, resolved: !x.resolved } : x)) }), 'Problemas')}
                label="Resuelto"
              />
              <div className="min-w-0 flex-1">
                <p className={cx('text-sm', pb.resolved && 'line-through')}>{pb.text}</p>
                <p className="text-[11px] text-fog-400">{formatDate(pb.createdAt)}</p>
              </div>
              {!pb.resolved && (
                <Link to={`/profesor?q=${encodeURIComponent(pb.text)}`} className="btn-ghost btn-sm" title="Preguntar al profesor">
                  <Bot size={14} />
                </Link>
              )}
              <button className="btn-ghost btn-sm" onClick={() => update((p) => ({ ...p, problems: p.problems.filter((x) => x.id !== pb.id) }), 'Problemas')} aria-label="Eliminar">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Versiones y observaciones">
        <p className="mb-3 text-xs text-fog-400">Registra hitos de tu canción (p. ej. "v1 groove listo", "mezcla 2"). Cada versión guarda también una instantánea de los datos, recuperable desde Historial.</p>
        <div className="mb-3 grid gap-2">
          <Field label="Nombre de la versión">
            <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="v1 — groove + bajo" />
          </Field>
          <Field label="Observaciones">
            <textarea className="input min-h-16" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Qué suena bien, qué falta, qué cambiar" />
          </Field>
          <button className="btn-primary justify-self-start" onClick={addMilestone} disabled={!label.trim()}>
            <Flag size={16} /> Registrar versión
          </button>
        </div>
        <ul className="space-y-2">
          {project.milestones.map((m) => (
            <li key={m.id} className="panel-inset p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{m.label}</p>
                <span className="text-[11px] text-fog-400">{formatDate(m.createdAt)}</span>
              </div>
              {m.observation && <p className="mt-1 whitespace-pre-wrap text-sm text-fog-300">{m.observation}</p>}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
