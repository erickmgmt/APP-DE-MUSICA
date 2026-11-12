import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CircleCheck, Eye, FlaskConical, ListChecks, Lock, MonitorPlay, Notebook, ShieldAlert, Sparkles, Target, TriangleAlert, Trophy } from 'lucide-react';
import { LESSONS, PASS_THRESHOLD, getLesson } from '../../content/academy';
import { useLive } from '../../core/db/hooks';
import { emptyProgress, listProgress, logActivity, updateProgress } from '../../core/db/repo';
import { isComplete, isUnlocked, scoreQuiz } from '../../core/academyLogic';
import { LessonVisual } from '../../components/audio/LessonVisual';
import { LangPackNote, ReaperSteps } from '../../components/ReaperSteps';
import { Callout, Check, Collapsible, PageHeader, Panel, ProgressBar, VerificationLegend, cx } from '../../components/ui';
import { toast } from '../../components/ui/toast';

function Section({ n, title, icon, children }: { n: number; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Panel
      className="animate-fade-up"
      title={
        <span className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-ink-600 text-[11px] text-fog-200">{n}</span>
          {icon}
          {title}
        </span>
      }
    >
      {children}
    </Panel>
  );
}

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const progressMap = useLive(listProgress, ['progress']);
  const progress = progressMap?.[lessonId] ?? emptyProgress(lessonId);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);

  useEffect(() => {
    setAnswers(lesson?.quiz?.map(() => null) ?? []);
    setSubmitted(false);
    setNotes(null);
  }, [lessonId, lesson]);

  useEffect(() => {
    if (lesson?.ready && progressMap && !progressMap[lessonId]?.started) void updateProgress(lessonId, { started: true });
  }, [lesson, lessonId, progressMap]);

  const idx = LESSONS.findIndex((l) => l.id === lessonId);
  const nextL = useMemo(() => LESSONS.slice(idx + 1).find((l) => l.ready), [idx]);

  if (!lesson) return <Callout tone="warn">Lección no encontrada. <Link to="/academia" className="underline">Volver a la Academia</Link></Callout>;
  if (!progressMap) return null;

  const back = (
    <Link to="/academia" className="btn-ghost btn-sm">
      <ArrowLeft size={14} /> Academia
    </Link>
  );

  if (!lesson.ready) {
    return (
      <>
        <PageHeader eyebrow={`Nivel ${lesson.level}`} title={lesson.title} subtitle={lesson.summary} actions={back} />
        <Callout tone="info">El contenido de esta lección está en preparación y llegará en una próxima versión de la app. Puedes registrar qué te gustaría aprender aquí en <Link to="/ideas" className="underline">Ideas y mejoras</Link>.</Callout>
      </>
    );
  }

  if (!isUnlocked(lesson, progressMap)) {
    const required = LESSONS.slice(0, idx).filter((l) => l.ready && !isComplete(progressMap[l.id]));
    return (
      <>
        <PageHeader eyebrow={`Nivel ${lesson.level}`} title={lesson.title} subtitle={lesson.summary} actions={back} />
        <Panel>
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 text-fog-400" />
            <div>
              <p className="font-semibold">Lección bloqueada</p>
              <p className="mt-1 text-sm text-fog-300">Para que la base quede sólida, primero completa:</p>
              <ul className="mt-2 space-y-1 text-sm">
                {required.map((r) => (
                  <li key={r.id}>
                    <Link to={`/academia/${r.id}`} className="text-violet-soft underline">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  const ex = lesson.exercise!;
  const quiz = lesson.quiz ?? [];
  const complete = isComplete(progress);
  const allChecked = ex.check.every((_, i) => progress.checks?.[i]);

  const toggleCheck = async (i: number) => {
    const checks: Record<string, boolean> = { ...(progress.checks ?? {}), [i]: !progress.checks?.[i] };
    const exerciseDone = ex.check.every((_, j) => checks[j]);
    const nowComplete = exerciseDone && progress.quizBest >= PASS_THRESHOLD && !progress.completedAt;
    await updateProgress(lessonId, { checks, exerciseDone, ...(nowComplete ? { completedAt: Date.now() } : {}) });
    if (nowComplete) {
      await logActivity('lesson', `Lección completada: ${lesson.title}`);
      toast('¡Lección completada!');
    } else if (exerciseDone && !progress.exerciseDone) toast('Ejercicio completado');
  };

  const submitQuiz = async () => {
    const score = scoreQuiz(answers, lesson);
    setSubmitted(true);
    const best = Math.max(progress.quizBest, score);
    const nowComplete = progress.exerciseDone && best >= PASS_THRESHOLD;
    await updateProgress(lessonId, { quizBest: best, quizAttempts: progress.quizAttempts + 1, completedAt: nowComplete && !progress.completedAt ? Date.now() : progress.completedAt });
    if (nowComplete && !progress.completedAt) {
      await logActivity('lesson', `Lección completada: ${lesson.title} (${Math.round(score * 100)} %)`);
      toast('¡Lección completada!');
    }
  };

  const score = submitted ? scoreQuiz(answers, lesson) : null;

  return (
    <>
      <PageHeader
        eyebrow={`Nivel ${lesson.level} · Lección ${LESSONS.filter((l) => l.level === lesson.level).indexOf(lesson) + 1}`}
        title={lesson.title}
        subtitle={lesson.summary}
        actions={back}
      />

      <div className="mb-5 flex flex-wrap gap-2 text-xs">
        <span className={cx('chip', progress.exerciseDone && 'border-teal/50 text-teal')}>{progress.exerciseDone ? '✓' : '○'} Ejercicio</span>
        <span className={cx('chip', progress.quizBest >= PASS_THRESHOLD && 'border-teal/50 text-teal')}>
          {progress.quizBest >= PASS_THRESHOLD ? '✓' : '○'} Evaluación {progress.quizAttempts ? `(mejor ${Math.round(progress.quizBest * 100)} %)` : ''}
        </span>
        {complete && <span className="chip border-teal/50 bg-teal/10 text-teal">Lección completada</span>}
      </div>

      <div className="space-y-4">
        <Section n={1} title="Explicación sencilla" icon={<BookOpen size={16} className="text-teal" />}>
          <div className="space-y-3 text-[15px] leading-relaxed text-fog-200">
            {lesson.explanation.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {lesson.keyPoints && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {lesson.keyPoints.map((k) => (
                <li key={k} className="panel-inset flex gap-2 p-2.5 text-sm">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-violet-soft" />
                  {k}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {lesson.visual && (
          <Section n={2} title="Representación visual" icon={<Eye size={16} className="text-teal" />}>
            <p className="mb-3 text-sm text-fog-400">{lesson.visual.caption}</p>
            <LessonVisual kind={lesson.visual.kind} preset={lesson.visual.preset} />
          </Section>
        )}

        {lesson.example && (
          <Section n={3} title="Ejemplo práctico" icon={<MonitorPlay size={16} className="text-teal" />}>
            <p className="font-semibold">{lesson.example.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-fog-300">{lesson.example.text}</p>
          </Section>
        )}

        <Section n={4} title="Instrucciones en REAPER 7" icon={<ListChecks size={16} className="text-teal" />}>
          <ReaperSteps steps={lesson.reaper ?? []} />
          <div className="mt-3 space-y-3">
            <LangPackNote />
            <Collapsible title="¿Qué significan las etiquetas?">
              <VerificationLegend />
            </Collapsible>
          </div>
        </Section>

        <Section n={5} title="Ejercicio" icon={<Target size={16} className="text-teal" />}>
          <p className="mb-3 font-semibold">{ex.goal}</p>
          <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-fog-200">
            {ex.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="label">Marca lo que ya hiciste</p>
          <div className="space-y-2">
            {ex.check.map((c, i) => (
              <label key={c} className={cx('flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition', progress.checks?.[i] ? 'border-teal/40 bg-teal/5' : 'border-ink-600 bg-ink-850 hover:border-ink-500')}>
                <Check checked={!!progress.checks?.[i]} onToggle={() => toggleCheck(i)} />
                {c}
              </label>
            ))}
          </div>
          {allChecked && <p className="mt-3 flex items-center gap-1.5 text-sm text-teal"><CircleCheck size={16} /> Ejercicio completado.</p>}
        </Section>

        <Section n={6} title="Errores comunes" icon={<ShieldAlert size={16} className="text-teal" />}>
          <div className="grid gap-2">
            {lesson.mistakes?.map((m) => (
              <div key={m.error} className="panel-inset p-3 text-sm">
                <p className="flex gap-2 text-rose"><TriangleAlert size={15} className="mt-0.5 shrink-0" /> {m.error}</p>
                <p className="mt-1 pl-6 text-fog-200">{m.fix}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section n={7} title="Evaluación de comprensión" icon={<FlaskConical size={16} className="text-teal" />}>
          <div className="space-y-4">
            {quiz.map((q, qi) => (
              <fieldset key={q.q} className="space-y-2">
                <legend className="mb-1 text-sm font-semibold">
                  {qi + 1}. {q.q}
                </legend>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {q.options.map((o, oi) => {
                    const chosen = answers[qi] === oi;
                    const correct = submitted && oi === q.answer;
                    const wrong = submitted && chosen && oi !== q.answer;
                    return (
                      <button
                        key={o}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))}
                        className={cx(
                          'rounded-xl border px-3 py-2 text-left text-sm transition',
                          correct ? 'border-teal bg-teal/15 text-teal' : wrong ? 'border-rose bg-rose/10 text-rose' : chosen ? 'border-violet bg-violet/15' : 'border-ink-600 bg-ink-850 hover:border-ink-500',
                        )}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                {submitted && <p className={cx('text-xs', answers[qi] === q.answer ? 'text-teal' : 'text-fog-300')}>{answers[qi] === q.answer ? '✓ ' : '✗ '}{q.why}</p>}
              </fieldset>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!submitted ? (
              <button className="btn-primary" disabled={answers.some((a) => a === null)} onClick={submitQuiz}>
                Comprobar respuestas
              </button>
            ) : (
              <>
                <span className={cx('text-lg font-semibold', score! >= PASS_THRESHOLD ? 'text-teal' : 'text-amber')}>{Math.round(score! * 100)} %</span>
                <span className="text-sm text-fog-300">{score! >= PASS_THRESHOLD ? '¡Aprobado!' : `Necesitas ${Math.round(PASS_THRESHOLD * 100)} %. Repasa la explicación y vuelve a intentarlo.`}</span>
                <button className="btn-ghost" onClick={() => { setSubmitted(false); setAnswers(quiz.map(() => null)); }}>
                  Repetir
                </button>
              </>
            )}
          </div>
        </Section>

        <Section n={8} title="Tu progreso" icon={<Notebook size={16} className="text-teal" />}>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="panel-inset p-3">
              <p className="label">Estado</p>
              <ProgressBar value={(Number(progress.exerciseDone) + Number(progress.quizBest >= PASS_THRESHOLD)) / 2} />
              <p className="mt-2 text-sm text-fog-300">
                {complete ? 'Completada' : !progress.exerciseDone ? 'Falta marcar el ejercicio' : 'Falta aprobar la evaluación'}
                {progress.quizAttempts ? ` · ${progress.quizAttempts} intento(s)` : ''}
              </p>
            </div>
            <div className="panel-inset flex items-center gap-3 p-3">
              <Trophy className={complete ? 'text-amber' : 'text-fog-400'} />
              {complete && nextL ? (
                <button className="btn-primary" onClick={() => navigate(`/academia/${nextL.id}`)}>
                  Siguiente: {nextL.title}
                </button>
              ) : (
                <p className="text-sm text-fog-400">{complete ? 'Has completado todas las lecciones disponibles.' : 'Completa ejercicio y evaluación para desbloquear la siguiente lección.'}</p>
              )}
            </div>
          </div>
          <label className="label" htmlFor="lesson-notes">Mis notas de esta lección</label>
          <textarea
            id="lesson-notes"
            className="input min-h-24"
            placeholder="Dudas, descubrimientos, ajustes que te funcionaron…"
            value={notes ?? progress.notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== null && notes !== progress.notes && updateProgress(lessonId, { notes }).then(() => toast('Notas guardadas'))}
          />
        </Section>
      </div>
    </>
  );
}
