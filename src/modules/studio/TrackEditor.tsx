import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Eraser, Play, Trash2, Music, CopyPlus } from 'lucide-react';
import { getInstrument } from '../../core/studio/instruments';
import { STEPS_PER_BAR, loopSteps, type Song, type StudioTrack } from '../../core/studio/song';
import { NOTES_EN, NOTES_ES, midiToName, scaleNotes } from '../../core/music/theory';
import { uid } from '../../core/id';
import type { MusicalKey } from '../../core/types';
import { cx } from '../../components/ui';
import { Knob } from './controls';
import type { StudioApi } from './useStudio';

type Update = (fn: (t: StudioTrack) => StudioTrack, key?: string) => void;

function BarTabs({ song, bar, setBar, playingBar }: { song: Song; bar: number; setBar: (b: number) => void; playingBar: number }) {
  if (song.loopBars === 1) return null;
  return (
    <div className="flex gap-1" role="tablist" aria-label="Compás del loop">
      {Array.from({ length: song.loopBars }, (_, b) => (
        <button key={b} role="tab" aria-selected={bar === b} onClick={() => setBar(b)} className={cx('relative flex-1 rounded-lg border px-2 py-1.5 text-xs transition', bar === b ? 'border-violet bg-violet/15 text-fog-100' : 'border-ink-600 text-fog-400')}>
          Compás {b + 1}
          {playingBar === b && <span className="led absolute right-1.5 top-1.5 h-1.5 w-1.5 text-teal" />}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Pasos (batería / samples)
function StepEditor({ track, song, update, playStep, onPreview }: { track: StudioTrack; song: Song; update: Update; playStep: number; onPreview: () => void }) {
  const [bar, setBar] = useState(0);
  const [accent, setAccent] = useState(false);
  const offset = bar * STEPS_PER_BAR;
  const setStep = (i: number) =>
    update((t) => {
      const steps = [...t.steps];
      const cur = steps[offset + i];
      steps[offset + i] = cur > 0 && (!accent || cur === 1) ? 0 : accent ? 1 : 0.8;
      return { ...t, steps };
    });
  return (
    <div className="space-y-3">
      <BarTabs song={song} bar={bar} setBar={setBar} playingBar={playStep >= 0 ? Math.floor(playStep / STEPS_PER_BAR) : -1} />
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-16">
        {Array.from({ length: STEPS_PER_BAR }, (_, i) => {
          const v = track.steps[offset + i] ?? 0;
          const isNow = playStep === offset + i;
          return (
            <button
              key={i}
              onClick={() => {
                setStep(i);
                if (!v) onPreview();
              }}
              aria-label={`Paso ${i + 1}${v ? ' activo' : ''}`}
              aria-pressed={v > 0}
              className={cx('relative aspect-square rounded-lg border text-[10px] transition', Math.floor(i / 4) % 2 ? 'bg-ink-700' : 'bg-ink-800', i % 4 === 0 ? 'border-ink-500' : 'border-ink-600', isNow && 'ring-2 ring-fog-100/70')}
              style={v ? { background: track.color, opacity: 0.45 + v * 0.55, borderColor: track.color, boxShadow: `0 0 12px ${track.color}55` } : undefined}
            >
              <span className={cx('absolute left-1 top-0.5', v ? 'text-ink-900' : 'text-fog-400')}>{i % 4 === 0 ? i / 4 + 1 : ''}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={cx('btn-ghost btn-sm', accent && 'border-amber text-amber')} onClick={() => setAccent(!accent)} aria-pressed={accent}>
          Acento {accent ? 'activado' : ''}
        </button>
        <button className="btn-ghost btn-sm" onClick={() => update((t) => ({ ...t, steps: t.steps.map((_, i) => t.steps[offset + (i % STEPS_PER_BAR)]) }))} disabled={song.loopBars === 1}>
          <Copy size={14} /> Copiar este compás a todos
        </button>
        <button className="btn-ghost btn-sm" onClick={() => update((t) => ({ ...t, steps: t.steps.map((v, i) => (i >= offset && i < offset + STEPS_PER_BAR ? 0 : v)) }))}>
          <Eraser size={14} /> Borrar compás
        </button>
      </div>
      <p className="text-[11px] text-fog-400">Toca un cuadro para encender o apagar el golpe. Con "Acento" los golpes suenan más fuertes. Los números marcan los pulsos 1, 2, 3 y 4.</p>
      <Knob label="Afinación" value={track.pitch} min={-12} max={12} onChange={(pitch) => update((t) => ({ ...t, pitch }), 'pitch')} format={(v) => `${v > 0 ? '+' : ''}${v} semitonos`} hint="Sube o baja el tono del sonido (útil para afinar el kick con la tonalidad)." />
    </div>
  );
}

// ---------------------------------------------------------------- Notas (sintes)
const LENGTHS = [
  { steps: 1, label: '1/16' },
  { steps: 2, label: '1/8' },
  { steps: 4, label: '1/4' },
  { steps: 8, label: '1/2' },
  { steps: 16, label: '1 compás' },
];

function NoteEditor({ track, song, update, playStep, musicKey, onPreview }: { track: StudioTrack; song: Song; update: Update; playStep: number; musicKey: MusicalKey | null; onPreview: (midi: number) => void }) {
  const inst = getInstrument(track.instrument);
  const [bar, setBar] = useState(0);
  const [len, setLen] = useState(2);
  const [chord, setChord] = useState(false);
  const [lock, setLock] = useState(!!musicKey);
  const [latin, setLatin] = useState(false);
  const defaultBase = inst?.range ? Math.floor(inst.range[0] / 12) * 12 + (inst.range[0] % 12 > 6 ? 12 : 0) : 48;
  const [base, setBase] = useState(defaultBase);
  const scalePcs = useMemo(() => (musicKey ? new Set(scaleNotes(musicKey.tonic, musicKey.mode)) : null), [musicKey]);
  const tonicPc = musicKey ? NOTES_EN.indexOf(musicKey.tonic as (typeof NOTES_EN)[number]) : -1;
  const rows = useMemo(() => {
    const all = Array.from({ length: 25 }, (_, i) => base + 24 - i);
    return lock && scalePcs ? all.filter((m) => scalePcs.has(m % 12)) : all;
  }, [base, lock, scalePcs]);
  const offset = bar * STEPS_PER_BAR;
  const ls = loopSteps(song);

  const chordFrom = (m: number): number[] => {
    if (!scalePcs) return [m];
    const up: number[] = [];
    for (let x = m + 1; up.length < 6; x++) if (scalePcs.has(x % 12)) up.push(x);
    return [m, up[1], up[3], up[5]]; // tónica, tercera, quinta y séptima de la escala
  };

  const toggle = (m: number, c: number) => {
    const gs = offset + c;
    const hit = track.notes.find((n) => n.pitch === m && gs >= n.step && gs < n.step + n.len);
    if (hit) {
      update((t) => ({ ...t, notes: t.notes.filter((n) => n.id !== hit.id) }));
      return;
    }
    const pitches = chord ? chordFrom(m) : [m];
    const l = Math.min(len, ls - gs);
    update((t) => ({ ...t, notes: [...t.notes.filter((n) => !(n.step === gs && pitches.includes(n.pitch))), ...pitches.map((p) => ({ id: uid('n'), step: gs, pitch: p, len: l, vel: 0.85 }))] }));
    pitches.forEach((p) => onPreview(p));
  };

  const noteAt = (m: number, gs: number) => track.notes.find((n) => n.pitch === m && gs >= n.step && gs < n.step + n.len);
  const label = (m: number) => `${latin ? NOTES_ES[m % 12] : NOTES_EN[m % 12]}${Math.floor(m / 12) - 1}`;

  return (
    <div className="space-y-3">
      <BarTabs song={song} bar={bar} setBar={setBar} playingBar={playStep >= 0 ? Math.floor(playStep / STEPS_PER_BAR) : -1} />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-fog-400">Duración:</span>
        {LENGTHS.map((l) => (
          <button key={l.steps} onClick={() => setLen(l.steps)} className={cx('rounded-lg border px-2 py-1', len === l.steps ? 'border-violet bg-violet/15 text-fog-100' : 'border-ink-600 text-fog-400')}>
            {l.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button onClick={() => setChord(false)} className={cx('rounded-lg border px-2 py-1', !chord ? 'border-teal bg-teal/15 text-teal' : 'border-ink-600 text-fog-400')}>Nota</button>
        <button onClick={() => musicKey && setChord(true)} disabled={!musicKey} title={musicKey ? '' : 'Define la tonalidad del proyecto para usar acordes'} className={cx('rounded-lg border px-2 py-1 disabled:opacity-40', chord ? 'border-teal bg-teal/15 text-teal' : 'border-ink-600 text-fog-400')}>Acorde</button>
        <label className={cx('ml-1 flex items-center gap-1.5', !musicKey && 'opacity-40')}>
          <input type="checkbox" checked={lock} disabled={!musicKey} onChange={(e) => setLock(e.target.checked)} /> Solo notas de {musicKey ? `${musicKey.tonic} ${musicKey.mode}` : 'la escala'}
        </label>
        <button className="rounded-lg border border-ink-600 px-2 py-1 text-fog-400" onClick={() => setLatin(!latin)}>{latin ? 'Do Re Mi' : 'C D E'}</button>
        <span className="ml-auto flex items-center gap-1">
          <button className="btn-ghost btn-sm" onClick={() => setBase((b) => Math.max(12, b - 12))} aria-label="Octava abajo"><ChevronDown size={14} /></button>
          <span className="w-16 text-center text-fog-300">Octava {Math.floor(base / 12) - 1}</span>
          <button className="btn-ghost btn-sm" onClick={() => setBase((b) => Math.min(96, b + 12))} aria-label="Octava arriba"><ChevronUp size={14} /></button>
        </span>
      </div>
      <div className="max-h-[420px] overflow-y-auto rounded-xl border border-ink-600 bg-ink-950 p-1">
        {rows.map((m) => (
          <div key={m} className="grid grid-cols-[34px_repeat(16,1fr)] gap-[2px] py-[1px]">
            <button className={cx('truncate rounded px-0.5 text-right font-mono text-[10px] leading-6', m % 12 === tonicPc ? 'text-teal' : m % 12 === 0 ? 'text-fog-200' : 'text-fog-400')} onClick={() => onPreview(m)} title={midiToName(m)}>
              {label(m)}
            </button>
            {Array.from({ length: STEPS_PER_BAR }, (_, c) => {
              const gs = offset + c;
              const n = noteAt(m, gs);
              const isStart = n && n.step === gs;
              return (
                <button
                  key={c}
                  onClick={() => toggle(m, c)}
                  aria-label={`${label(m)} paso ${c + 1}${n ? ' (nota)' : ''}`}
                  className={cx('h-6 transition', n ? (isStart ? 'rounded-l' : '') : cx('rounded-sm', c % 4 === 0 ? 'bg-ink-700' : 'bg-ink-800', m % 12 === tonicPc && 'bg-teal/10'), playStep === gs && 'outline outline-1 outline-fog-100/60')}
                  style={n ? { background: track.color, opacity: isStart ? 1 : 0.7 } : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-fog-400">Toca una casilla para poner una nota con la duración elegida; toca una nota para quitarla. Las filas en turquesa son la tónica. En modo "Acorde" se colocan 4 notas de la escala a la vez (acorde con séptima).</p>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost btn-sm" disabled={song.loopBars === 1} onClick={() => update((t) => {
          const src = t.notes.filter((n) => n.step >= offset && n.step < offset + STEPS_PER_BAR);
          const copies = Array.from({ length: song.loopBars }, (_, b) => b).filter((b) => b !== bar).flatMap((b) => src.map((n) => ({ ...n, id: uid('n'), step: n.step - offset + b * STEPS_PER_BAR })));
          return { ...t, notes: [...src, ...copies] };
        })}>
          <Copy size={14} /> Copiar este compás a todos
        </button>
        <button className="btn-ghost btn-sm" onClick={() => update((t) => ({ ...t, notes: t.notes.filter((n) => n.step < offset || n.step >= offset + STEPS_PER_BAR) }))}>
          <Eraser size={14} /> Borrar compás
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Editor de pista
export function TrackEditor({ api, track, onChangeSound }: { api: StudioApi; track: StudioTrack; onChangeSound: () => void }) {
  const { song, setSong, player, pos, project } = api;
  if (!song) return null;
  const update: Update = (fn, key) => setSong((s) => ({ ...s, tracks: s.tracks.map((t) => (t.id === track.id ? fn(t) : t)) }), key ? `${track.id}:${key}` : undefined);
  const playStep = pos && (pos.active.has(track.id) || pos.sectionIndex < 0) ? pos.loopStep : -1;
  const inst = getInstrument(track.instrument);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="h-8 w-1.5 rounded-full" style={{ background: track.color }} />
        <input className="input w-40 flex-1 font-semibold" value={track.name} onChange={(e) => update((t) => ({ ...t, name: e.target.value }), 'name')} aria-label="Nombre de la pista" />
        <button className="btn-ghost btn-sm" onClick={onChangeSound}>
          <Music size={14} /> {track.kind === 'sample' ? 'Sample' : inst?.name ?? 'Sonido'}
        </button>
        <button className="btn-ghost btn-sm" onClick={() => player.preview(track.id)} aria-label="Escuchar sonido"><Play size={14} /></button>
        <button className="btn-ghost btn-sm" title="Duplicar pista" aria-label="Duplicar pista" onClick={() => setSong((s) => {
          const copy = { ...structuredClone(track), id: uid('trk'), name: `${track.name} 2`, notes: track.notes.map((n) => ({ ...n, id: uid('n') })) };
          return { ...s, tracks: [...s.tracks, copy], sections: s.sections.map((sec) => (sec.tracks.includes(track.id) ? { ...sec, tracks: [...sec.tracks, copy.id] } : sec)) };
        })}><CopyPlus size={14} /></button>
        <button className="btn-ghost btn-sm" aria-label="Eliminar pista" onClick={() => confirm(`¿Eliminar la pista "${track.name}"? Puedes deshacerlo con el botón ↶.`) && setSong((s) => ({ ...s, tracks: s.tracks.filter((t) => t.id !== track.id), sections: s.sections.map((sec) => ({ ...sec, tracks: sec.tracks.filter((id) => id !== track.id) })) }))}>
          <Trash2 size={14} />
        </button>
      </div>
      {track.kind === 'synth' ? (
        <NoteEditor track={track} song={song} update={update} playStep={playStep} musicKey={project?.key ?? null} onPreview={(m) => player.preview(track.id, m)} />
      ) : (
        <StepEditor track={track} song={song} update={update} playStep={playStep} onPreview={() => player.preview(track.id)} />
      )}
    </div>
  );
}
