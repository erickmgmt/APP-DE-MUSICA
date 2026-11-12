import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Bot, Disc3, Ear, Lightbulb, Send, Sparkles, Stethoscope, Trash2, User, Wrench, SlidersHorizontal, ListChecks, TriangleAlert } from 'lucide-react';
import { TUTOR_KB, type TutorAnswer } from '../../content/tutor/knowledge';
import { getLesson } from '../../content/academy';
import { getStage } from '../../content/producer/stages';
import { getGenre } from '../../content/producer/genres';
import { matchQuestion, SUGGESTED_QUESTIONS } from '../../core/ai/tutorEngine';
import { TUTOR_SYSTEM_PROMPT, createProvider, type AiMessage } from '../../core/ai/providers';
import { useLive } from '../../core/db/hooks';
import { addChatMessage, clearChat, getSettings, listChat, listPlugins, listProjects } from '../../core/db/repo';
import { suggestPlugins } from '../../core/pluginAdvisor';
import type { ChatMessage } from '../../core/types';
import { ReaperSteps } from '../../components/ReaperSteps';
import { Callout, PageHeader, cx } from '../../components/ui';

function Part({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal">{icon}{title}</p>
      {children}
    </div>
  );
}

function OfflineAnswer({ a }: { a: TutorAnswer }) {
  const plugins = useLive(listPlugins, ['plugins']) ?? [];
  const settings = useLive(getSettings, ['settings']);
  const sugg = a.pluginCategory ? suggestPlugins(a.pluginCategory, plugins, settings?.includeReaperStock ?? true).slice(0, 3) : [];
  return (
    <div className="space-y-4">
      <p className="text-base font-semibold">{a.title}</p>
      <Part icon={<Stethoscope size={14} />} title="1 · Diagnóstico probable"><p className="text-sm text-fog-200">{a.diagnosis}</p></Part>
      <Part icon={<Lightbulb size={14} />} title="2 · Explicación sencilla"><p className="text-sm text-fog-200">{a.explanation}</p></Part>
      <Part icon={<Wrench size={14} />} title="3 · Solución recomendada">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-fog-200">{a.solution.map((s) => <li key={s}>{s}</li>)}</ol>
      </Part>
      {a.steps.length > 0 && <Part icon={<ListChecks size={14} />} title="4 · Pasos en REAPER"><ReaperSteps steps={a.steps} /></Part>}
      {a.params.length > 0 && (
        <Part icon={<SlidersHorizontal size={14} />} title="5 · Parámetros iniciales orientativos">
          <ul className="space-y-1 text-sm">
            {a.params.map((p) => (
              <li key={p.name} className="flex flex-wrap gap-x-2"><span className="text-fog-400">{p.name}:</span><b className="font-mono font-medium">{p.value}</b>{p.note && <span className="text-xs text-fog-400">({p.note})</span>}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-fog-400">Puntos de partida, no reglas: ajusta escuchando.</p>
        </Part>
      )}
      <Part icon={<Ear size={14} />} title="6 · Cómo comprobar si funcionó">
        <ul className="list-disc space-y-1 pl-5 text-sm text-fog-200">{a.verify.map((v) => <li key={v}>{v}</li>)}</ul>
      </Part>
      {sugg.length > 0 && (
        <div className="panel-inset p-3 text-sm">
          <p className="label">Plugins sugeridos (priorizando los tuyos)</p>
          <p>{sugg.map((s) => `${s.name}${s.source === 'tuyo' ? ' (tuyo)' : s.source === 'reaper' ? ' (REAPER)' : ' (gratis)'}`).join(' · ')}</p>
        </div>
      )}
      {(a.lessons?.length || a.stages?.length) ? (
        <div className="flex flex-wrap gap-2">
          {a.lessons?.map((id) => { const l = getLesson(id); return l && <Link key={id} to={`/academia/${id}`} className="btn-ghost btn-sm"><BookOpen size={14} /> {l.title}</Link>; })}
          {a.stages?.map((id) => { const s = getStage(id); return s && <span key={id} className="chip"><Disc3 size={12} /> Etapa {s.order}: {s.title}</span>; })}
        </div>
      ) : null}
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user';
  const kb = m.answerId ? TUTOR_KB.find((a) => a.id === m.answerId) : undefined;
  return (
    <div className={cx('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-xl', isUser ? 'bg-ink-600' : 'bg-gradient-to-br from-violet to-electric')}>{isUser ? <User size={16} /> : <Bot size={16} />}</div>
      <div className={cx('min-w-0 max-w-[92%] rounded-2xl p-4 sm:max-w-[85%]', isUser ? 'bg-ink-600/80' : 'panel')}>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{m.text}</p>
        ) : kb ? (
          <>
            <p className="mb-3 text-[11px] uppercase tracking-wider text-fog-400">Base de conocimiento offline</p>
            <OfflineAnswer a={kb} />
          </>
        ) : (
          <>
            {m.source === 'ia' && <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber"><TriangleAlert size={12} /> Respuesta generada por IA — no verificada. Comprueba rutas de menú en tu REAPER.</p>}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fog-200">{m.text}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TutorPage() {
  const messages = useLive(listChat, ['chats']) ?? [];
  const settings = useLive(getSettings, ['settings']);
  const projects = useLive(listProjects, ['projects']) ?? [];
  const plugins = useLive(listPlugins, ['plugins']) ?? [];
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const provider = settings ? createProvider(settings.ai) : null;

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q) return;
    setText('');
    setAiError(null);
    await addChatMessage({ role: 'user', text: q });
    const { best, alternatives } = matchQuestion(q);
    if (best) {
      await addChatMessage({ role: 'tutor', text: best.answer.title, answerId: best.answer.id, source: 'offline' });
    } else {
      await addChatMessage({
        role: 'tutor',
        source: 'offline',
        text: `No tengo una respuesta verificada para esa pregunta en la base offline${alternatives.length ? '. ¿Quizá te refieres a alguno de estos temas?\n• ' + alternatives.map((a) => a.answer.title).join('\n• ') : '.'}\n\nPrueba a describir el síntoma (qué escuchas) y en qué parte de la canción ocurre.${provider ? '\nTambién puedes pulsar "Preguntar a la IA".' : ''}`,
      });
    }
  };

  const askAi = async () => {
    if (!provider || !settings) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setBusy(true);
    setAiError(null);
    try {
      const ctx: string[] = [];
      if (settings.ai.shareContext) {
        const p = projects[0];
        if (p) ctx.push(`Proyecto actual: ${getGenre(p.genreId).name}, ${p.bpm} BPM${p.key ? `, ${p.key.tonic} ${p.key.mode}` : ''}.`);
        if (plugins.length) ctx.push(`Plugins instalados del alumno: ${plugins.map((x) => x.name).join(', ')}.`);
      }
      const msgs: AiMessage[] = [
        { role: 'system', content: TUTOR_SYSTEM_PROMPT + (ctx.length ? `\n\nContexto del alumno:\n${ctx.join('\n')}` : '') },
        { role: 'user', content: lastUser.text },
      ];
      const reply = await provider.chat(msgs);
      await addChatMessage({ role: 'tutor', text: reply, source: 'ia' });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const q = params.get('q');
    if (q && settings) {
      setParams({}, { replace: true });
      void ask(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, settings]);

  useEffect(() => {
    // (en navegadores recientes scrollIntoView devuelve una promesa: no debe ser el retorno del efecto)
    void endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  return (
    <>
      <PageHeader
        eyebrow="Profesor inteligente"
        title="Pregúntame lo que quieras"
        subtitle="Describe tu problema con tus palabras. Respondo con diagnóstico, explicación, solución, pasos en REAPER, parámetros orientativos y cómo comprobarlo."
        actions={messages.length > 0 && <button className="btn-ghost btn-sm" onClick={() => confirm('¿Borrar la conversación?') && clearChat()}><Trash2 size={14} /> Borrar chat</button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="chip border-teal/50 text-teal"><span className="led text-teal" /> Modo offline activo</span>
        <span className={cx('chip', provider ? 'border-violet/50 text-violet-soft' : '')}>{provider ? `IA conectada: ${settings!.ai.model}` : 'IA sin conectar'}</span>
        {!provider && <Link to="/sistema?tab=ia" className="text-fog-400 underline">Configurar IA (opcional)</Link>}
      </div>

      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="panel p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="text-violet-soft" /> Prueba con una de estas preguntas</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => <button key={q} className="chip hover:border-violet hover:text-fog-100" onClick={() => ask(q)}>{q}</button>)}
            </div>
          </div>
        )}
        {messages.map((m) => <Bubble key={m.id} m={m} />)}
        {aiError && <Callout tone="warn">No se pudo conectar con la IA: {aiError}. El modo offline sigue funcionando.</Callout>}
        <div ref={endRef} />
      </div>

      <form className="sticky bottom-20 z-20 mt-6 lg:bottom-4" onSubmit={(e) => { e.preventDefault(); void ask(text); }}>
        <div className="panel flex items-end gap-2 p-2">
          <textarea
            className="input min-h-11 flex-1 resize-none border-0 bg-transparent focus:ring-0"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(text); } }}
            placeholder="Ej.: mi kick y mi bajo se están peleando"
            aria-label="Tu pregunta"
          />
          {provider && messages.length > 0 && (
            <button type="button" className="btn-ghost" onClick={askAi} disabled={busy} title="Envía tu última pregunta a tu proveedor de IA">
              <Bot size={16} /> {busy ? 'Pensando…' : 'Preguntar a la IA'}
            </button>
          )}
          <button className="btn-primary" type="submit" disabled={!text.trim()} aria-label="Enviar"><Send size={16} /></button>
        </div>
      </form>
    </>
  );
}
