import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Compass, Download, Minus, Play, Plus, Repeat, Square, Undo2, ListMusic, Check as CheckIcon } from 'lucide-react';
import { getInstrument } from '../../core/studio/instruments';
import { newTrack, STEPS_PER_BAR, setLoopBars, type StudioTrack } from '../../core/studio/song';
import { currentStage } from '../../core/producerAdvisor';
import { getGenre } from '../../content/producer/genres';
import { Callout, Panel, Tabs, cx } from '../../components/ui';
import { useStudio } from './useStudio';
import { TrackEditor } from './TrackEditor';
import { MixerView } from './MixerView';
import { ArrangementView } from './ArrangementView';
import { ExportModal } from './ExportModal';
import { SoundPicker, type Pick } from './SoundPicker';
import { Knob, fmtPct } from './controls';

type Tab = 'pistas' | 'mezcla' | 'estructura';

export default function StudioPage() {
  const { projectId = '' } = useParams();
  const api = useStudio(projectId);
  const { project, loading, song, setSong, undo, canUndo, saved, pos, playing, mode, play, stop, setBpm } = api;
  const [params, setParams] = useSearchParams();
  const tab = (params.get('vista') as Tab) || 'pistas';
  const setTab = (t: Tab) => setParams((p) => { p.set('vista', t); return p; }, { replace: true });
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [changing, setChanging] = useState<StudioTrack | null>(null);
  const [exporting, setExporting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const pickTrack = (id: string) => {
    setSelected(id);
    // En el teléfono el editor queda debajo de la lista: lo llevamos a la vista
    if (window.innerWidth < 1024) window.setTimeout(() => void editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  useEffect(() => {
    if (song && (!selected || !song.tracks.some((t) => t.id === selected))) setSelected(song.tracks[0]?.id ?? null);
  }, [song, selected]);

  // Barra espaciadora = reproducir / detener (en ordenador)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.code !== 'Space' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      e.preventDefault();
      if (playing) stop();
      else play(mode);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, play, stop, mode]);

  if (loading) return null;
  if (!project) return <Callout tone="warn">Este proyecto no existe. <Link className="underline" to="/estudio">Volver</Link></Callout>;
  if (!song) return null;

  const track = song.tracks.find((t) => t.id === selected);
  const stage = currentStage(project);
  const position = pos ? `${pos.bar + 1}.${Math.floor((pos.loopStep % STEPS_PER_BAR) / 4) + 1}` : '1.1';

  const onPick = (p: Pick) => {
    if (changing) {
      const id = changing.id;
      setSong((s) => ({
        ...s,
        tracks: s.tracks.map((t) => {
          if (t.id !== id) return t;
          if (p.type === 'sample') return { ...t, kind: 'sample', sampleId: p.sampleId, name: t.kind === 'sample' ? p.name : t.name };
          const kind = p.instrument.kind;
          return { ...t, kind, instrument: p.instrument.id, sampleId: undefined };
        }),
      }));
      setChanging(null);
      return;
    }
    let t: StudioTrack;
    if (p.type === 'sample') t = newTrack(song, { kind: 'sample', instrument: '', sampleId: p.sampleId, name: p.name });
    else t = newTrack(song, { kind: p.instrument.kind, instrument: p.instrument.id });
    // la pista nueva suena en todas las partes; ajústalo en Estructura
    setSong((s) => ({ ...s, tracks: [...s.tracks, t], sections: s.sections.map((sec) => ({ ...sec, tracks: [...sec.tracks, t.id] })) }));
    setSelected(t.id);
    setAdding(false);
  };

  return (
    <>
      {/* Cabecera */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link to="/estudio" className="btn-ghost btn-sm" aria-label="Mis canciones"><ArrowLeft size={14} /></Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{project.name}</h1>
          <p className="text-xs text-fog-400">{getGenre(project.genreId).name}{project.key ? ` · ${project.key.tonic} ${project.key.mode}` : ' · tonalidad sin definir'} · {saved ? 'Guardado' : 'Guardando…'}</p>
        </div>
        <Link to={`/proyectos/${project.id}?etapa=${stage.id}`} className="btn-ghost btn-sm" title="Guía paso a paso">
          <Compass size={14} /> <span className="hidden sm:inline">Guía:</span> {stage.order}. {stage.title}
        </Link>
      </div>

      {/* Transporte */}
      <div className="panel sticky top-[61px] z-20 mb-4 flex flex-wrap items-center gap-2 p-2 lg:top-3">
        <button className={playing ? 'btn-ghost' : 'btn-primary'} onClick={() => (playing ? stop() : play(mode))} aria-label={playing ? 'Detener' : 'Reproducir'}>
          {playing ? <Square size={16} /> : <Play size={16} />}
        </button>
        <div className="flex rounded-xl border border-ink-600 p-0.5 text-xs">
          <button className={cx('flex items-center gap-1 rounded-lg px-2 py-1.5', mode === 'loop' ? 'bg-ink-600 text-fog-100' : 'text-fog-400')} onClick={() => (playing ? play('loop') : api.setMode('loop'))} aria-pressed={mode === 'loop'}><Repeat size={13} /> Loop</button>
          <button className={cx('flex items-center gap-1 rounded-lg px-2 py-1.5', mode === 'cancion' ? 'bg-ink-600 text-fog-100' : 'text-fog-400')} onClick={() => (playing ? play('cancion') : api.setMode('cancion'))} aria-pressed={mode === 'cancion'}><ListMusic size={13} /> Canción</button>
        </div>
        <span className="min-w-14 rounded-lg bg-ink-950 px-2 py-1.5 text-center font-mono text-sm text-teal" aria-label="Posición (compás.pulso)">{position}</span>
        <div className="flex items-center gap-1">
          <button className="btn-ghost btn-sm" onClick={() => setBpm(Math.max(60, project.bpm - 1))} aria-label="Bajar BPM"><Minus size={12} /></button>
          <span className="w-16 text-center font-mono text-sm">{project.bpm} <span className="text-[10px] text-fog-400">BPM</span></span>
          <button className="btn-ghost btn-sm" onClick={() => setBpm(Math.min(200, project.bpm + 1))} aria-label="Subir BPM"><Plus size={12} /></button>
        </div>
        <div className="ml-auto flex gap-1">
          <button className="btn-ghost btn-sm" onClick={undo} disabled={!canUndo} title="Deshacer" aria-label="Deshacer"><Undo2 size={14} /></button>
          <button className="btn-ghost btn-sm" onClick={() => { stop(); setExporting(true); }}><Download size={14} /> <span className="hidden sm:inline">Exportar</span></button>
        </div>
      </div>

      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: 'pistas', label: 'Pistas' }, { id: 'mezcla', label: 'Mezcla' }, { id: 'estructura', label: 'Estructura' }]} />

      {tab === 'pistas' && (
        <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
          <div className="space-y-2">
            {song.tracks.map((t) => {
              const inst = getInstrument(t.instrument);
              const sounding = pos && pos.active.has(t.id);
              return (
                <div key={t.id} className={cx('panel flex items-center gap-2 p-2 transition', selected === t.id && 'border-violet/70 bg-violet/5')}>
                  <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => pickTrack(t.id)}>
                    <span className={cx('h-8 w-1.5 shrink-0 rounded-full', sounding && 'shadow-[0_0_10px_currentColor]')} style={{ background: t.color, color: t.color }} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{t.name}</span>
                      <span className="block truncate text-[11px] text-fog-400">{t.kind === 'sample' ? 'Sample propio' : inst?.name}</span>
                    </span>
                  </button>
                  <button className={cx('h-7 w-7 rounded-md border text-xs font-bold', t.mute ? 'border-amber bg-amber/20 text-amber' : 'border-ink-500 text-fog-400')} onClick={() => setSong((s) => ({ ...s, tracks: s.tracks.map((x) => (x.id === t.id ? { ...x, mute: !x.mute } : x)) }))} aria-pressed={t.mute} title="Silenciar">M</button>
                  <button className={cx('h-7 w-7 rounded-md border text-xs font-bold', t.solo ? 'border-teal bg-teal/20 text-teal' : 'border-ink-500 text-fog-400')} onClick={() => setSong((s) => ({ ...s, tracks: s.tracks.map((x) => (x.id === t.id ? { ...x, solo: !x.solo } : x)) }))} aria-pressed={t.solo} title="Solo">S</button>
                </div>
              );
            })}
            <button className="btn-primary w-full" onClick={() => setAdding(true)}><Plus size={16} /> Añadir pista</button>
            <Panel className="!p-3" title="Ajustes del loop">
              <div className="mb-3 flex gap-1">
                {([1, 2, 4] as const).map((b) => (
                  <button key={b} onClick={() => b !== song.loopBars && setSong((s) => setLoopBars(s, b))} className={cx('flex-1 rounded-lg border px-2 py-1.5 text-xs', song.loopBars === b ? 'border-violet bg-violet/15 text-fog-100' : 'border-ink-600 text-fog-400')}>
                    {song.loopBars === b && <CheckIcon size={12} className="mr-1 inline" />}{b} {b === 1 ? 'compás' : 'compases'}
                  </button>
                ))}
              </div>
              <Knob label="Swing" value={song.swing} min={0} max={0.4} step={0.01} format={fmtPct} onChange={(swing) => setSong((s) => ({ ...s, swing }), 'swing')} hint="Retrasa un poco las semicorcheas pares: groove más humano (típico del Deep House)." />
            </Panel>
          </div>
          <div ref={editorRef} className="panel scroll-mt-40 p-3 sm:p-4">
            {track ? <TrackEditor key={track.id} api={api} track={track} onChangeSound={() => setChanging(track)} /> : <p className="text-sm text-fog-400">Añade una pista para empezar.</p>}
          </div>
        </div>
      )}
      {tab === 'mezcla' && <MixerView api={api} />}
      {tab === 'estructura' && <ArrangementView api={api} bpm={project.bpm} />}

      <SoundPicker open={adding} onClose={() => setAdding(false)} onPick={onPick} title="Añadir pista" />
      <SoundPicker open={!!changing} onClose={() => setChanging(null)} onPick={onPick} kinds={changing?.kind === 'synth' ? ['synth'] : ['drum', 'sample']} title="Cambiar sonido" key={changing?.id ?? 'x'} />
      <ExportModal open={exporting} onClose={() => setExporting(false)} song={song} bpm={project.bpm} name={project.name} />
    </>
  );
}
