import { Link } from 'react-router-dom';
import { ExternalLink, Lightbulb } from 'lucide-react';
import type { StudioStep, StudioView } from '../content/types';

const VIEW_LABEL: Record<StudioView, string> = { pistas: 'Pistas', mezcla: 'Mezcla', estructura: 'Estructura', exportar: 'Exportar' };

/**
 * Pasos numerados para hacer algo en el estudio de la app.
 * Con `projectId`, los pasos que indican una pestaña muestran un botón que la abre directamente.
 */
export function StudioSteps({ steps, projectId }: { steps: StudioStep[]; projectId?: string }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={i} className="panel-inset flex gap-3 p-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet/15 text-xs font-bold text-violet-soft">{i + 1}</span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm leading-relaxed text-fog-100">{s.text}</p>
            {s.tip && (
              <p className="flex gap-1.5 text-xs text-fog-300">
                <Lightbulb size={14} className="mt-px shrink-0 text-amber" />
                {s.tip}
              </p>
            )}
            {s.view && (
              <Link to={projectId ? `/estudio/${projectId}?vista=${s.view === 'exportar' ? 'pistas' : s.view}` : '/estudio'} className="inline-flex items-center gap-1 text-xs text-teal hover:underline">
                <ExternalLink size={12} /> Abrir en el estudio{s.view ? ` › ${VIEW_LABEL[s.view]}` : ''}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
