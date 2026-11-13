import { ArrowDown, ArrowUp, LayoutTemplate, Play, Plus, Trash2 } from 'lucide-react';
import { getInstrument } from '../../core/studio/instruments';
import { sectionStartStep, totalBars, type Song, type StudioSection } from '../../core/studio/song';
import { uid } from '../../core/id';
import { Panel, cx } from '../../components/ui';
import type { StudioApi } from './useStudio';

const BAR_OPTIONS = [4, 8, 16, 32];

/** Estructura típica de Deep House construida a partir de TUS pistas (según su tipo de sonido). */
export function deepHouseStructure(song: Song): StudioSection[] {
  const group = (id: string) => getInstrument(song.tracks.find((t) => t.id === id)?.instrument ?? '')?.group ?? '';
  const ids = song.tracks.map((t) => t.id);
  const drumsNoClap = song.tracks.filter((t) => t.kind !== 'synth' && group(t.id) !== 'Clap / Snare').map((t) => t.id);
  const drums = song.tracks.filter((t) => t.kind !== 'synth').map((t) => t.id);
  const bass = song.tracks.filter((t) => group(t.id) === 'Bajos').map((t) => t.id);
  const harmony = song.tracks.filter((t) => t.kind === 'synth' && group(t.id) !== 'Bajos').map((t) => t.id);
  const kicks = new Set(song.tracks.filter((t) => getInstrument(t.instrument)?.sidechainSource).map((t) => t.id));
  return [
    { id: uid('sec'), name: 'Intro', bars: 16, tracks: drumsNoClap },
    { id: uid('sec'), name: 'Groove', bars: 16, tracks: [...drums, ...bass] },
    { id: uid('sec'), name: 'Break', bars: 16, tracks: [...drums.filter((id) => !kicks.has(id) && group(id) !== 'Clap / Snare'), ...harmony] },
    { id: uid('sec'), name: 'Drop', bars: 32, tracks: ids },
    { id: uid('sec'), name: 'Outro', bars: 16, tracks: drumsNoClap },
  ];
}

export function ArrangementView({ api, bpm }: { api: StudioApi; bpm: number }) {
  const { song, setSong, pos, play, playing, mode } = api;
  if (!song) return null;
  const bars = totalBars(song);
  const secs = (bars * 4 * 60) / bpm;
  const patch = (id: string, p: Partial<StudioSection>) => setSong((s) => ({ ...s, sections: s.sections.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const move = (i: number, d: -1 | 1) =>
    setSong((s) => {
      const arr = [...s.sections];
      const j = i + d;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, sections: arr };
    });

  return (
    <div className="space-y-3">
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-fog-300">
              {song.sections.length} partes · {bars} compases · <b className="text-fog-100">{Math.floor(secs / 60)}:{String(Math.round(secs % 60)).padStart(2, '0')}</b> a {bpm} BPM
            </p>
            <p className="text-[11px] text-fog-400">Cada parte repite tu loop; tú eliges qué pistas suenan en cada una. Así se pasa de un loop a una canción completa.</p>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => confirm('¿Reemplazar la estructura actual por la estructura típica de Deep House (Intro, Groove, Break, Drop, Outro)? Puedes deshacerlo.') && setSong((s) => ({ ...s, sections: deepHouseStructure(s) }))}>
            <LayoutTemplate size={14} /> Estructura Deep House
          </button>
        </div>
      </Panel>

      {song.sections.map((sec, i) => {
        const current = playing && mode === 'cancion' && pos?.sectionIndex === i;
        return (
          <div key={sec.id} className={cx('panel p-3 transition', current && 'border-teal/60 shadow-[0_0_24px_-10px_#2dd4bf]')}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="w-5 text-xs text-fog-400">{i + 1}.</span>
              <input className="input w-32 flex-1 py-1.5 font-semibold" value={sec.name} onChange={(e) => patch(sec.id, { name: e.target.value })} aria-label="Nombre de la parte" />
              <select className="input w-auto py-1.5" value={sec.bars} onChange={(e) => patch(sec.id, { bars: +e.target.value })} aria-label="Compases">
                {[...new Set([...BAR_OPTIONS, sec.bars])].sort((a, b) => a - b).map((b) => <option key={b} value={b}>{b} compases</option>)}
              </select>
              <button className="btn-ghost btn-sm" onClick={() => play('cancion', sectionStartStep(song, i))} title="Reproducir desde aquí" aria-label={`Reproducir desde ${sec.name}`}><Play size={14} /></button>
              <button className="btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir"><ArrowUp size={14} /></button>
              <button className="btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === song.sections.length - 1} aria-label="Bajar"><ArrowDown size={14} /></button>
              <button className="btn-ghost btn-sm" onClick={() => setSong((s) => ({ ...s, sections: s.sections.filter((x) => x.id !== sec.id) }))} aria-label="Eliminar parte"><Trash2 size={14} /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {song.tracks.map((t) => {
                const on = sec.tracks.includes(t.id);
                return (
                  <button key={t.id} onClick={() => patch(sec.id, { tracks: on ? sec.tracks.filter((x) => x !== t.id) : [...sec.tracks, t.id] })} aria-pressed={on} className={cx('rounded-full border px-2.5 py-1 text-xs transition', on ? 'text-ink-900' : 'border-ink-600 text-fog-400 line-through decoration-fog-400/50')} style={on ? { background: t.color, borderColor: t.color } : undefined}>
                    {t.name}
                  </button>
                );
              })}
            </div>
            {current && pos && <p className="mt-2 text-[11px] text-teal">Sonando · compás {pos.bar - sectionStartStep(song, i) / 16 + 1} de {sec.bars}</p>}
          </div>
        );
      })}
      <button className="btn-ghost w-full" onClick={() => setSong((s) => ({ ...s, sections: [...s.sections, { id: uid('sec'), name: `Parte ${s.sections.length + 1}`, bars: 8, tracks: s.tracks.map((t) => t.id) }] }))}>
        <Plus size={16} /> Añadir parte
      </button>
    </div>
  );
}
