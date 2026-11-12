import { Link } from 'react-router-dom';
import { CircleCheck, Clock, Lock, Play, Hourglass } from 'lucide-react';
import { LEVELS, lessonsOfLevel } from '../../content/academy';
import { useLive } from '../../core/db/hooks';
import { listProgress } from '../../core/db/repo';
import { isComplete, isUnlocked, levelStats, nextLesson, overallStats } from '../../core/academyLogic';
import { PageHeader, Panel, ProgressBar, ProgressRing, cx } from '../../components/ui';

export function AcademyHome() {
  const progress = useLive(listProgress, ['progress']) ?? {};
  const next = nextLesson(progress);
  const overall = overallStats(progress);

  return (
    <>
      <PageHeader eyebrow="Academia" title="Ruta de aprendizaje" subtitle="Avanzas al aprobar cada lección (ejercicio + evaluación ≥ 70 %). Así no saltas a temas complejos sin dominar los fundamentos." />

      <Panel className="mb-6">
        <div className="flex flex-wrap items-center gap-5">
          <ProgressRing value={overall.pct} size={76} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-fog-300">
              {overall.done} de {overall.ready} lecciones disponibles completadas
            </p>
            {next ? (
              <p className="mt-1 text-lg font-semibold">
                Siguiente: <span className="text-gradient">{next.title}</span>
              </p>
            ) : (
              <p className="mt-1 text-lg font-semibold text-teal">¡Has completado todas las lecciones disponibles!</p>
            )}
          </div>
          {next && (
            <Link to={`/academia/${next.id}`} className="btn-primary">
              <Play size={16} /> Continuar
            </Link>
          )}
        </div>
      </Panel>

      <div className="relative space-y-8">
        {LEVELS.map((level) => {
          const stats = levelStats(level.id, progress);
          const lessons = lessonsOfLevel(level.id);
          return (
            <section key={level.id} className="animate-fade-up">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: level.color }}>
                    Nivel {level.id}
                  </p>
                  <h2 className="text-xl font-semibold">{level.title}</h2>
                  <p className="text-sm text-fog-400">{level.subtitle}</p>
                </div>
                <div className="w-32 text-right text-xs text-fog-400">
                  {stats.ready ? `${stats.done}/${stats.ready}` : 'En preparación'}
                  <ProgressBar value={stats.ready ? stats.done / stats.ready : 0} color={level.color} className="mt-1" />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {lessons.map((l, i) => {
                  const done = isComplete(progress[l.id]);
                  const unlocked = l.ready && isUnlocked(l, progress);
                  const content = (
                    <div className={cx('panel flex h-full items-start gap-3 p-3.5 transition', unlocked ? 'hover:-translate-y-0.5 hover:border-ink-500' : 'opacity-55')}>
                      <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold', done ? 'bg-teal/20 text-teal' : unlocked ? 'bg-violet/20 text-violet-soft' : 'bg-ink-700 text-fog-400')}>
                        {done ? <CircleCheck size={16} /> : !l.ready ? <Hourglass size={14} /> : unlocked ? i + 1 : <Lock size={14} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug">{l.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-fog-400">{l.summary}</p>
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-fog-400">
                          {l.ready ? (
                            <>
                              <Clock size={11} /> {l.minutes} min {progress[l.id]?.quizBest ? `· mejor nota ${Math.round(progress[l.id].quizBest * 100)} %` : ''}
                            </>
                          ) : (
                            'Contenido en preparación'
                          )}
                        </p>
                      </div>
                    </div>
                  );
                  return unlocked ? (
                    <Link key={l.id} to={`/academia/${l.id}`} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={l.id} title={l.ready ? 'Completa la lección anterior para desbloquear' : 'Llegará en una próxima versión'}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
