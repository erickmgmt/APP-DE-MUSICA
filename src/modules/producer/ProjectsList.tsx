import { Link } from 'react-router-dom';
import { Disc3, Plus } from 'lucide-react';
import { useLive } from '../../core/db/hooks';
import { listProjects } from '../../core/db/repo';
import { getGenre } from '../../content/producer/genres';
import { currentStage, projectProgress } from '../../core/producerAdvisor';
import { EmptyState, PageHeader, ProgressBar } from '../../components/ui';
import { formatDate } from '../../core/id';

export function ProjectsList() {
  const projects = useLive(listProjects, ['projects']);
  if (!projects) return null;
  return (
    <>
      <PageHeader
        eyebrow="Productor paso a paso"
        title="Mis canciones"
        subtitle="Cada proyecto te guía por 15 etapas, desde la idea hasta la exportación, con recomendaciones del género."
        actions={
          <Link to="/proyectos/nuevo" className="btn-primary">
            <Plus size={16} /> Nueva canción
          </Link>
        }
      />
      {projects.length === 0 ? (
        <EmptyState icon={<Disc3 />} title="Aún no tienes canciones" text="Crea tu primer proyecto. Te recomendamos empezar con Deep House: tiene la ruta completa." action={<Link to="/proyectos/nuevo" className="btn-primary"><Plus size={16} /> Crear mi primera canción</Link>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const prog = projectProgress(p);
            const stage = currentStage(p);
            return (
              <Link key={p.id} to={`/proyectos/${p.id}`} className="panel block p-4 transition hover:-translate-y-0.5 hover:border-ink-500">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-xs text-fog-400">
                      {getGenre(p.genreId).name} · {p.bpm} BPM {p.key ? `· ${p.key.tonic} ${p.key.mode}` : ''}
                    </p>
                  </div>
                  <span className="chip">{prog.done}/{prog.total}</span>
                </div>
                <ProgressBar value={prog.pct} />
                <p className="mt-2 text-xs text-fog-300">
                  Etapa actual: <b className="text-fog-100">{stage.order}. {stage.title}</b>
                </p>
                <p className="mt-1 text-[11px] text-fog-400">Actualizado {formatDate(p.updatedAt)}</p>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
