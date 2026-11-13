import { Link, useSearchParams } from 'react-router-dom';
import { Ban, BookOpen, CircleCheck, Circle, CircleDot, Ear, Library, SlidersHorizontal, ThumbsUp, Play } from 'lucide-react';
import { STAGES, guideFor, type Advice, type Stage } from '../../content/producer/stages';
import { getGenre } from '../../content/producer/genres';
import { getLesson } from '../../content/academy';
import { SOUND_CATEGORIES } from '../../content/sounds/library';
import { checklistRatio, currentStage } from '../../core/producerAdvisor';
import { logActivity } from '../../core/db/repo';
import type { Project, StageStatus } from '../../core/types';
import { StudioSteps } from '../../components/StudioSteps';
import { Callout, Check, Panel, ProgressBar, VerificationBadge, cx } from '../../components/ui';
import { SaveTextarea } from '../../components/SaveFields';
import { toast } from '../../components/ui/toast';

type Update = (fn: (p: Project) => Project, reason?: string, snap?: 'auto' | 'force' | 'none') => Promise<void>;

const STATUS: { id: StageStatus; label: string }[] = [
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'en-curso', label: 'En curso' },
  { id: 'hecho', label: 'Hecho' },
];

function AdviceList({ items, tone }: { items: Advice[]; tone: 'do' | 'avoid' }) {
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.text} className="panel-inset p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className={cx('flex gap-2 text-sm font-medium', tone === 'avoid' ? 'text-rose' : 'text-fog-100')}>
              {tone === 'avoid' ? <Ban size={15} className="mt-0.5 shrink-0" /> : <ThumbsUp size={15} className="mt-0.5 shrink-0 text-teal" />}
              {a.text}
            </p>
            <VerificationBadge level={a.level} />
          </div>
          <p className="mt-1 pl-6 text-xs leading-relaxed text-fog-300">
            <b className="text-fog-200">Por qué:</b> {a.why}
          </p>
        </li>
      ))}
    </ul>
  );
}

function StageDetail({ project, stage, update }: { project: Project; stage: Stage; update: Update }) {
  const genre = getGenre(project.genreId);
  const { generic, genre: g } = guideFor(stage, project.genreId);
  const st = project.stages[stage.id] ?? { status: 'pendiente', checklist: {}, notes: '' };

  const setStatus = async (status: StageStatus) => {
    await update((p) => ({ ...p, stages: { ...p.stages, [stage.id]: { ...st, status } } }), status === 'hecho' ? `Etapa completada: ${stage.title}` : `Estado de etapa: ${stage.title}`, status === 'hecho' ? 'force' : 'auto');
    if (status === 'hecho') {
      await logActivity('project', `${project.name}: etapa "${stage.title}" completada`);
      toast(`Etapa "${stage.title}" completada`);
    }
  };

  const toggle = (id: string) =>
    update((p) => {
      const cur = p.stages[stage.id] ?? st;
      const checklist = { ...cur.checklist, [id]: !cur.checklist[id] };
      const status: StageStatus = cur.status === 'pendiente' ? 'en-curso' : cur.status;
      return { ...p, stages: { ...p.stages, [stage.id]: { ...cur, checklist, status } } };
    }, `Checklist: ${stage.title}`);

  const ratio = checklistRatio(project, stage);
  const studioSteps = [...(g?.steps ?? []), ...(generic.steps ?? [])];
  const params = [...(g?.params ?? []), ...(generic.params ?? [])];
  const checks = [...(g?.check ?? []), ...(generic.check ?? [])];

  return (
    <div className="space-y-4 animate-fade-up" key={stage.id}>
      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">Etapa {stage.order} de {STAGES.length}</p>
        <h2 className="mt-1 text-xl font-semibold">{stage.title}</h2>
        <p className="mt-1 text-sm text-fog-300">{stage.goal}</p>
        <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-ink-600 bg-ink-850 p-1">
          {STATUS.map((s) => (
            <button key={s.id} onClick={() => setStatus(s.id)} className={cx('flex-1 rounded-lg px-3 py-1.5 text-sm transition', st.status === s.id ? (s.id === 'hecho' ? 'bg-teal/20 text-teal' : s.id === 'en-curso' ? 'bg-violet/20 text-violet-soft' : 'bg-ink-600 text-fog-100') : 'text-fog-400 hover:text-fog-200')}>
              {s.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Checklist de la etapa" actions={<span className="text-xs text-fog-400">{Math.round(ratio * 100)} %</span>}>
        <ProgressBar value={ratio} color="var(--color-teal)" className="mb-3" />
        <div className="space-y-2">
          {stage.checklist.map((c) => (
            <label key={c.id} className={cx('flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition', st.checklist[c.id] ? 'border-teal/40 bg-teal/5' : 'border-ink-600 bg-ink-850 hover:border-ink-500')}>
              <Check checked={!!st.checklist[c.id]} onToggle={() => toggle(c.id)} />
              {c.text}
            </label>
          ))}
        </div>
        {ratio === 1 && st.status !== 'hecho' && (
          <button className="btn-primary mt-3" onClick={() => setStatus('hecho')}>
            <CircleCheck size={16} /> Marcar etapa como hecha
          </button>
        )}
      </Panel>

      {genre.route === 'basica' && <Callout tone="info">Ruta básica para {genre.name}: estás viendo recomendaciones generales. La guía específica de este género llegará en una próxima versión.</Callout>}

      <Panel title={`Recomendaciones${g ? ` para ${genre.name}` : ''}`}>
        <AdviceList items={[...(g?.recommendations ?? []), ...generic.recommendations]} tone="do" />
      </Panel>

      {!!(g?.avoid?.length || generic.avoid?.length) && (
        <Panel title="Qué evitar">
          <AdviceList items={[...(g?.avoid ?? []), ...(generic.avoid ?? [])]} tone="avoid" />
        </Panel>
      )}

      {params.length > 0 && (
        <Panel title={<span className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-teal" /> Parámetros iniciales orientativos</span>}>
          <div className="overflow-hidden rounded-xl border border-ink-600">
            <table className="w-full text-sm">
              <tbody>
                {params.map((p) => (
                  <tr key={p.name} className="border-b border-ink-600 last:border-0">
                    <td className="bg-ink-850 px-3 py-2 text-fog-300">{p.name}</td>
                    <td className="px-3 py-2 font-mono text-fog-100">{p.value}</td>
                    <td className="hidden px-3 py-2 text-xs text-fog-400 sm:table-cell">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-fog-400">Son puntos de partida. Ajusta siempre escuchando.</p>
        </Panel>
      )}

      {studioSteps.length > 0 && (
        <Panel title="Hazlo en el Estudio" actions={<Link to={`/estudio/${project.id}`} className="btn-primary btn-sm"><Play size={14} /> Abrir estudio</Link>}>
          <StudioSteps steps={studioSteps} projectId={project.id} />
        </Panel>
      )}

      {checks.length > 0 && (
        <Panel title={<span className="flex items-center gap-2"><Ear size={16} className="text-teal" /> Cómo comprobar que funciona</span>}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fog-200">
            {checks.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </Panel>
      )}

      {!!(stage.lessons?.length || stage.sounds?.length) && (
        <Panel title="Aprende más">
          <div className="flex flex-wrap gap-2">
            {stage.lessons?.map((id) => {
              const l = getLesson(id);
              return l ? <Link key={id} to={`/academia/${id}`} className="btn-ghost btn-sm"><BookOpen size={14} /> {l.title}</Link> : null;
            })}
            {stage.sounds?.map((id) => (
              <Link key={id} to={`/sonidos?cat=${id}`} className="btn-ghost btn-sm"><Library size={14} /> {SOUND_CATEGORIES.find((c) => c.id === id)?.name}</Link>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Mis notas de esta etapa">
        <SaveTextarea value={st.notes} placeholder="Qué probaste, qué funcionó, qué falta…" onSave={(notes) => update((p) => ({ ...p, stages: { ...p.stages, [stage.id]: { ...(p.stages[stage.id] ?? st), notes } } }), `Notas: ${stage.title}`).then(() => toast('Notas guardadas'))} />
      </Panel>
    </div>
  );
}

export function StageRoute({ project, update }: { project: Project; update: Update }) {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('etapa') ?? currentStage(project).id;
  const stage = STAGES.find((s) => s.id === selectedId) ?? STAGES[0];
  const select = (id: string) => {
    setParams((p) => { p.set('etapa', id); return p; }, { replace: true });
    if (window.innerWidth < 1024) window.scrollTo({ top: 260, behavior: 'smooth' });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <nav className="panel h-fit p-2 lg:sticky lg:top-6" aria-label="Etapas">
        <ol className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {STAGES.map((s) => {
            const status = project.stages[s.id]?.status ?? 'pendiente';
            return (
              <li key={s.id} className="shrink-0">
                <button onClick={() => select(s.id)} className={cx('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition', s.id === stage.id ? 'bg-ink-600 text-fog-100' : 'text-fog-300 hover:bg-ink-700/60')}>
                  {status === 'hecho' ? <CircleCheck size={16} className="shrink-0 text-teal" /> : status === 'en-curso' ? <CircleDot size={16} className="shrink-0 text-violet-soft" /> : <Circle size={16} className="shrink-0 text-fog-400" />}
                  <span className="whitespace-nowrap lg:whitespace-normal">
                    <span className="text-fog-400">{s.order}.</span> {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <StageDetail project={project} stage={stage} update={update} />
    </div>
  );
}
