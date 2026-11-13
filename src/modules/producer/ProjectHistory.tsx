import { useNavigate } from 'react-router-dom';
import { History, RotateCcw, Trash2 } from 'lucide-react';
import { useLive } from '../../core/db/hooks';
import { deleteProject, listSnapshots, restoreSnapshot } from '../../core/db/repo';
import { formatDate } from '../../core/id';
import { projectProgress } from '../../core/producerAdvisor';
import type { Project } from '../../core/types';
import { Panel } from '../../components/ui';
import { toast } from '../../components/ui/toast';

export function ProjectHistory({ project }: { project: Project }) {
  const navigate = useNavigate();
  const snaps = useLive(() => listSnapshots(project.id), ['snapshots'], [project.id]) ?? [];

  const restore = async (id: string, when: number) => {
    if (!confirm(`¿Restaurar los datos del proyecto tal como estaban el ${formatDate(when)}? La versión actual se guardará antes en el historial.`)) return;
    await restoreSnapshot(id);
    toast('Versión restaurada');
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar "${project.name}"? Podrás recuperarlo desde Sistema › Proyectos eliminados.`)) return;
    await deleteProject(project.id);
    toast('Proyecto eliminado (recuperable)');
    navigate('/proyectos');
  };

  return (
    <div className="space-y-4">
      <Panel title={<span className="flex items-center gap-2"><History size={16} className="text-teal" /> Historial de cambios</span>}>
        <p className="mb-3 text-xs text-fog-400">Cada cambio importante guarda la versión anterior de los datos del proyecto (se conservan las últimas 100), incluida tu canción del Estudio.</p>
        <ul className="divide-y divide-ink-600">
          {snaps.map((s) => {
            const prog = projectProgress(s.data);
            return (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{s.reason}</p>
                  <p className="text-[11px] text-fog-400">
                    {formatDate(s.createdAt)} · "{s.data.name}" · {s.data.bpm} BPM · {prog.done}/{prog.total} etapas
                  </p>
                </div>
                <button className="btn-ghost btn-sm" onClick={() => restore(s.id, s.createdAt)}>
                  <RotateCcw size={14} /> Restaurar
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel title="Zona de peligro">
        <button className="btn-danger" onClick={remove}>
          <Trash2 size={16} /> Eliminar proyecto
        </button>
      </Panel>
    </div>
  );
}
