import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Disc3, GraduationCap, Library, Lightbulb, Plus, SlidersHorizontal, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useLive } from '../../core/db/hooks';
import { getSettings, listIdeas, listProgress, listProjects } from '../../core/db/repo';
import { nextLesson, overallStats, levelStats } from '../../core/academyLogic';
import { currentStage, projectProgress } from '../../core/producerAdvisor';
import { getGenre } from '../../content/producer/genres';
import { LEVELS } from '../../content/academy';
import { MODULES } from '../registry';
import { Spectrum } from '../../components/audio/Spectrum';
import { StepSequencer } from '../../components/audio/StepSequencer';
import { Panel, ProgressBar, ProgressRing } from '../../components/ui';

function greeting(): string {
  const h = new Date().getHours();
  return h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
}

export default function DashboardPage() {
  const progress = useLive(listProgress, ['progress']) ?? {};
  const projects = useLive(listProjects, ['projects']) ?? [];
  const ideas = useLive(listIdeas, ['ideas']) ?? [];
  const settings = useLive(getSettings, ['settings']);
  const [playing, setPlaying] = useState(false);

  const overall = overallStats(progress);
  const next = nextLesson(progress);
  const active = projects.filter((p) => !p.archived).slice(0, 3);
  const openIdeas = ideas.filter((i) => !['hecha', 'descartada'].includes(i.status)).length;
  const backupDays = settings?.lastBackupAt ? Math.floor((Date.now() - settings.lastBackupAt) / 86400000) : null;
  const hasData = projects.length > 0 || overall.done > 0;

  // Siguiente paso recomendado: equilibra aprender y producir
  const nextStep = !overall.done
    ? { title: 'Empieza por los fundamentos', text: 'La primera lección te explica qué es un estudio digital y abre tu primera canción en el Estudio.', to: '/academia/l1-daw', cta: 'Empezar lección 1' }
    : projects.length === 0 && overall.done >= 3
      ? { title: 'Crea tu primera canción', text: 'Ya conoces lo básico. Empieza un proyecto Deep House y aplica lo aprendido etapa a etapa.', to: '/proyectos/nuevo', cta: 'Nueva canción' }
      : next
        ? { title: `Continúa: ${next.title}`, text: next.summary, to: `/academia/${next.id}`, cta: 'Continuar lección' }
        : active[0]
          ? { title: `Sigue con "${active[0].name}"`, text: `Etapa actual: ${currentStage(active[0]).title}`, to: `/proyectos/${active[0].id}`, cta: 'Abrir proyecto' }
          : { title: 'Crea una canción', text: 'Aplica todo lo aprendido en un proyecto real.', to: '/proyectos/nuevo', cta: 'Nueva canción' };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="panel relative overflow-hidden p-5 sm:p-7 animate-fade-up">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-teal/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">{greeting()}{settings?.displayName ? `, ${settings.displayName}` : ''}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tu estudio para aprender a <span className="text-gradient">producir tu música</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-fog-300">Aprende haciendo canciones reales: lecciones interactivas, un productor que te guía etapa a etapa y un profesor que responde tus dudas con pasos exactos.</p>
            <div className="mt-5 rounded-2xl border border-violet/30 bg-ink-850/80 p-4">
              <p className="text-xs uppercase tracking-wider text-fog-400">Siguiente paso recomendado</p>
              <p className="mt-1 font-semibold">{nextStep.title}</p>
              <p className="text-sm text-fog-300">{nextStep.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={nextStep.to} className="btn-primary">{nextStep.cta} <ArrowRight size={16} /></Link>
                <Link to="/estudio" className="btn-ghost"><SlidersHorizontal size={16} /> Ir al Estudio</Link>
              </div>
            </div>
          </div>
          <div className="panel-inset p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-fog-300">Groove Deep House en vivo</p>
              <span className={playing ? 'led text-teal' : 'led text-ink-500'} />
            </div>
            <Spectrum height={84} />
            <div className="mt-3">
              <StepSequencer preset="deep-groove" compact onPlayingChange={setPlaying} />
            </div>
          </div>
        </div>
      </section>

      {backupDays !== null && backupDays > 14 && hasData && (
        <Link to="/sistema" className="flex items-center gap-2 rounded-xl border border-amber/30 bg-amber/5 px-4 py-3 text-sm text-fog-200">
          <TriangleAlert size={16} className="text-amber" /> Hace {backupDays} días que no descargas una copia de seguridad. Hazla desde Sistema.
        </Link>
      )}
      {backupDays === null && hasData && (
        <Link to="/sistema" className="flex items-center gap-2 rounded-xl border border-electric/30 bg-electric/5 px-4 py-3 text-sm text-fog-200">
          <ShieldCheck size={16} className="text-electric" /> Tus datos viven en este navegador. Descarga tu primera copia de seguridad desde Sistema.
        </Link>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={<span className="flex items-center gap-2"><GraduationCap size={16} className="text-teal" /> Academia</span>} actions={<Link to="/academia" className="text-xs text-fog-400 hover:text-fog-200">Ver ruta</Link>}>
          <div className="flex items-center gap-4">
            <ProgressRing value={overall.pct} size={70} />
            <div className="min-w-0 flex-1 space-y-2">
              {LEVELS.map((l) => {
                const s = levelStats(l.id, progress);
                return (
                  <div key={l.id}>
                    <div className="flex justify-between text-[11px] text-fog-400"><span>N{l.id} · {l.title}</span><span>{s.ready ? `${s.done}/${s.ready}` : 'pronto'}</span></div>
                    <ProgressBar value={s.ready ? s.done / s.ready : 0} color={l.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        <Panel className="lg:col-span-2" title={<span className="flex items-center gap-2"><Disc3 size={16} className="text-teal" /> Mis canciones</span>} actions={<Link to="/proyectos/nuevo" className="btn-ghost btn-sm"><Plus size={14} /> Nueva</Link>}>
          {active.length === 0 ? (
            <p className="text-sm text-fog-400">Aún no tienes proyectos. Cuando completes algunas lecciones, crea tu primera canción Deep House.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3">
              {active.map((p) => {
                const pr = projectProgress(p);
                return (
                  <Link key={p.id} to={`/proyectos/${p.id}`} className="panel-inset block p-3 transition hover:border-ink-500">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-[11px] text-fog-400">{getGenre(p.genreId).name} · {p.bpm} BPM</p>
                    <ProgressBar value={pr.pct} className="mt-2" />
                    <p className="mt-1.5 truncate text-[11px] text-fog-300">→ {currentStage(p).title}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/profesor', icon: Bot, title: 'Pregunta al profesor', text: '"Mi kick y mi bajo se pelean"' },
          { to: '/sonidos', icon: Library, title: 'Biblioteca de sonidos', text: 'Busca por intención: "atmósfera de fondo"' },
          { to: '/estudio', icon: SlidersHorizontal, title: 'Estudio', text: 'Produce tu canción: batería, bajo, acordes y mezcla' },
          { to: '/ideas', icon: Lightbulb, title: 'Ideas y mejoras', text: openIdeas ? `${openIdeas} ideas activas` : 'Haz crecer la app contigo' },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="panel group flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink-500">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-700 text-violet-soft group-hover:text-teal"><c.icon size={18} /></span>
            <span>
              <span className="block text-sm font-semibold">{c.title}</span>
              <span className="block text-xs text-fog-400">{c.text}</span>
            </span>
          </Link>
        ))}
      </div>

      <Panel title="Próximos módulos" actions={<Link to="/sistema?tab=modulos" className="text-xs text-fog-400 hover:text-fog-200">Mapa completo</Link>}>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODULES.filter((m) => m.status === 'planeado').map((m) => (
            <div key={m.id} className="flex items-start gap-3 rounded-xl border border-dashed border-ink-500 p-3">
              <m.icon size={18} className="mt-0.5 shrink-0 text-fog-400" />
              <div>
                <p className="text-sm font-semibold">{m.title}</p>
                <p className="text-xs text-fog-400">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
