import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bot, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { getGenre } from '../../content/producer/genres';
import { advise, projectProgress } from '../../core/producerAdvisor';
import { Callout, PageHeader, Panel, ProgressRing, Tabs, cx } from '../../components/ui';
import { useProject } from './useProject';
import { StageRoute } from './StageRoute';
import { ProjectSheet } from './ProjectSheet';
import { ProblemsVersions } from './ProblemsVersions';
import { ProjectHistory } from './ProjectHistory';

type Tab = 'ruta' | 'ficha' | 'problemas' | 'historial';

export function ProjectWorkspace() {
  const { projectId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'ruta';
  const setTab = (t: Tab) => setParams((p) => { p.set('tab', t); return p; }, { replace: true });
  const { project, update, loading } = useProject(projectId);
  const [showAll, setShowAll] = useState(false);

  if (loading) return null;
  if (!project)
    return (
      <Callout tone="warn">
        Este proyecto no existe o fue eliminado. Si lo borraste, puedes recuperarlo en <Link to="/sistema" className="underline">Sistema › Proyectos eliminados</Link>.
      </Callout>
    );

  const genre = getGenre(project.genreId);
  const prog = projectProgress(project);
  const notes = advise(project);
  const visible = showAll ? notes : notes.slice(0, 2);
  const pending = project.problems.filter((p) => !p.resolved).length;

  return (
    <>
      <PageHeader
        eyebrow={`${genre.name} · ${project.bpm} BPM${project.key ? ` · ${project.key.tonic} ${project.key.mode}` : ''}`}
        title={project.name}
        actions={<Link to="/proyectos" className="btn-ghost btn-sm"><ArrowLeft size={14} /> Proyectos</Link>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-[auto_1fr]">
        <Panel className="flex items-center gap-4">
          <ProgressRing value={prog.pct} size={72} />
          <div>
            <p className="text-sm text-fog-300">Etapas completadas</p>
            <p className="text-2xl font-semibold">{prog.done}<span className="text-fog-400">/{prog.total}</span></p>
          </div>
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><Bot size={16} className="text-violet-soft" /> Tu productor dice</span>} actions={notes.length > 2 && <button className="text-xs text-fog-400 underline" onClick={() => setShowAll(!showAll)}>{showAll ? 'Ver menos' : `Ver ${notes.length - 2} más`}</button>}>
          <ul className="space-y-2">
            {visible.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm text-fog-200">
                {n.tone === 'warn' ? <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber" /> : n.tone === 'ok' ? <CircleCheck size={16} className="mt-0.5 shrink-0 text-teal" /> : <Info size={16} className="mt-0.5 shrink-0 text-electric" />}
                <span>{n.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'ruta', label: 'Ruta de producción' },
          { id: 'ficha', label: 'Ficha del proyecto' },
          { id: 'problemas', label: <span className="flex items-center gap-1.5">Problemas y versiones {pending > 0 && <span className={cx('rounded-full bg-amber/20 px-1.5 text-[10px] text-amber')}>{pending}</span>}</span> },
          { id: 'historial', label: 'Historial' },
        ]}
      />

      {tab === 'ruta' && <StageRoute project={project} update={update} />}
      {tab === 'ficha' && <ProjectSheet project={project} update={update} />}
      {tab === 'problemas' && <ProblemsVersions project={project} update={update} />}
      {tab === 'historial' && <ProjectHistory project={project} />}
    </>
  );
}
