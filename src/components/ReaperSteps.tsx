import { ChevronRight, Lightbulb } from 'lucide-react';
import type { ReaperStep } from '../content/types';
import { Kbd, VerificationBadge } from './ui';

/** Lista numerada de instrucciones de REAPER con ruta de menú (EN + ES), atajo y nivel de verificación. */
export function ReaperSteps({ steps }: { steps: ReaperStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={i} className="panel-inset flex gap-3 p-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet/15 text-xs font-bold text-violet-soft">{i + 1}</span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm leading-relaxed text-fog-100">{s.text}</p>
              <VerificationBadge level={s.level} />
            </div>
            {(s.menu || s.shortcut) && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {s.menu && (
                  <span className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-ink-600 bg-ink-800 px-2 py-1 font-mono text-fog-200" title="Ruta en el menú original de REAPER (inglés)">
                    {s.menu.en.map((m, j) => (
                      <span key={j} className="inline-flex items-center gap-1">
                        {j > 0 && <ChevronRight size={12} className="text-fog-400" />}
                        {m}
                      </span>
                    ))}
                  </span>
                )}
                {s.menu?.es && <span className="text-fog-400">≈ {s.menu.es.join(' › ')}</span>}
                {s.shortcut && (
                  <span className="inline-flex items-center gap-1 text-fog-400">
                    Atajo: <Kbd>{s.shortcut}</Kbd>
                  </span>
                )}
              </div>
            )}
            {s.tip && (
              <p className="flex gap-1.5 text-xs text-fog-300">
                <Lightbulb size={14} className="mt-px shrink-0 text-amber" />
                {s.tip}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function LangPackNote() {
  return (
    <p className="text-xs text-fog-400">
      Las rutas de menú se muestran con el texto original de REAPER (inglés) y una traducción aproximada (≈). REAPER no incluye español de serie: si usas un paquete de idioma de la comunidad, los textos pueden ser distintos. Los atajos de teclado son los predeterminados.
    </p>
  );
}
