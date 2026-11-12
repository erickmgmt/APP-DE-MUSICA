import { useEffect, useRef, useState } from 'react';
import { Play, Square, Eraser } from 'lucide-react';
import { StepScheduler, playBass, playClap, playHat, playKick, playRim, playShaker } from '../../core/audio/engine';
import { midiToFreq } from '../../core/music/theory';
import { cx } from '../ui';

export type RowId = 'kick' | 'clap' | 'ohat' | 'chat' | 'shaker' | 'rim' | 'bass';

const ROWS: { id: RowId; label: string; color: string }[] = [
  { id: 'kick', label: 'Kick', color: '#8b5cf6' },
  { id: 'clap', label: 'Clap', color: '#3b82f6' },
  { id: 'ohat', label: 'Hat abierto', color: '#2dd4bf' },
  { id: 'chat', label: 'Hat cerrado', color: '#22d3ee' },
  { id: 'shaker', label: 'Shaker', color: '#a3e635' },
  { id: 'rim', label: 'Rim', color: '#fbbf24' },
  { id: 'bass', label: 'Bajo (A1)', color: '#fb7185' },
];

type Pattern = Record<RowId, boolean[]>;

const steps = (idx: number[]): boolean[] => Array.from({ length: 16 }, (_, i) => idx.includes(i + 1));
const empty = (): Pattern => Object.fromEntries(ROWS.map((r) => [r.id, steps([])])) as Pattern;

export const PRESETS: Record<string, { name: string; swing: number; bpm: number; pattern: Pattern }> = {
  'four-floor': {
    name: 'Four-on-the-floor',
    swing: 0,
    bpm: 122,
    pattern: { ...empty(), kick: steps([1, 5, 9, 13]) },
  },
  'deep-basic': {
    name: 'Deep House básico',
    swing: 0.16,
    bpm: 122,
    pattern: {
      ...empty(),
      kick: steps([1, 5, 9, 13]),
      clap: steps([5, 13]),
      ohat: steps([3, 7, 11, 15]),
      shaker: steps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    },
  },
  'deep-groove': {
    name: 'Deep House con bajo',
    swing: 0.2,
    bpm: 122,
    pattern: {
      ...empty(),
      kick: steps([1, 5, 9, 13]),
      clap: steps([5, 13]),
      ohat: steps([3, 7, 11, 15]),
      chat: steps([2, 6, 10, 14]),
      shaker: steps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      rim: steps([8, 12]),
      bass: steps([3, 7, 8, 11, 15]),
    },
  },
};

/** Secuenciador de 16 pasos (1 compás de semicorcheas). */
export function StepSequencer({ preset = 'deep-basic', compact = false, onPlayingChange }: { preset?: string; compact?: boolean; onPlayingChange?: (p: boolean) => void }) {
  const initial = PRESETS[preset] ?? PRESETS['deep-basic'];
  const [pattern, setPattern] = useState<Pattern>(structuredClone(initial.pattern));
  const [bpm, setBpm] = useState(initial.bpm);
  const [swing, setSwing] = useState(initial.swing);
  const [muted, setMuted] = useState<Partial<Record<RowId, boolean>>>({});
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const state = useRef({ pattern, muted });
  state.current = { pattern, muted };
  const sched = useRef<StepScheduler | null>(null);

  useEffect(() => () => sched.current?.stop(), []);
  useEffect(() => {
    if (sched.current) {
      sched.current.opts.bpm = bpm;
      sched.current.opts.swing = swing;
    }
  }, [bpm, swing]);

  const toggle = () => {
    if (playing) {
      sched.current?.stop();
      setPlaying(false);
      onPlayingChange?.(false);
      return;
    }
    sched.current = new StepScheduler({
      bpm,
      swing,
      totalSteps: 16,
      onUiStep: setStep,
      onStep: (s, t) => {
        const { pattern: p, muted: m } = state.current;
        const on = (r: RowId) => p[r][s] && !m[r];
        if (on('kick')) playKick(t);
        if (on('clap')) playClap(t);
        if (on('ohat')) playHat(t, true, 0.16);
        if (on('chat')) playHat(t, false, 0.12);
        if (on('shaker')) playShaker(t, s % 2 === 0 ? 0.1 : 0.055); // velocity alterna
        if (on('rim')) playRim(t, 0.18);
        if (on('bass')) playBass(midiToFreq(33), 0.11, t, 0.35);
      },
    });
    sched.current.start();
    setPlaying(true);
    onPlayingChange?.(true);
  };

  const load = (id: string) => {
    const p = PRESETS[id];
    setPattern(structuredClone(p.pattern));
    setSwing(p.swing);
    setBpm(p.bpm);
  };

  const rows = compact ? ROWS.filter((r) => ['kick', 'clap', 'ohat', 'shaker', 'bass'].includes(r.id)) : ROWS;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className={playing ? 'btn-ghost' : 'btn-primary'} onClick={toggle} aria-label={playing ? 'Detener' : 'Reproducir'}>
          {playing ? <Square size={16} /> : <Play size={16} />} {playing ? 'Detener' : 'Reproducir'}
        </button>
        {!compact && (
          <>
            <select className="input w-auto" onChange={(e) => e.target.value && load(e.target.value)} defaultValue="" aria-label="Cargar patrón">
              <option value="" disabled>
                Cargar patrón…
              </option>
              {Object.entries(PRESETS).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="btn-ghost" onClick={() => setPattern(empty())}>
              <Eraser size={16} /> Vaciar
            </button>
          </>
        )}
      </div>
      <div className={cx('grid gap-3', !compact && 'sm:grid-cols-2')}>
        <label className="text-xs text-fog-300">
          BPM: <b className="text-fog-100">{bpm}</b>
          <input type="range" min={80} max={140} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full" />
        </label>
        {!compact && (
          <label className="text-xs text-fog-300">
            Swing: <b className="text-fog-100">{Math.round(swing * 100)} %</b>
            <input type="range" min={0} max={0.4} step={0.01} value={swing} onChange={(e) => setSwing(+e.target.value)} className="w-full" />
          </label>
        )}
      </div>
      <div className={cx('pb-1', !compact && 'overflow-x-auto')}>
        <div className={cx('space-y-1.5', compact ? 'min-w-0' : 'min-w-[520px]')}>
          <div className={cx('grid gap-1 text-center text-[10px] text-fog-400', compact ? 'grid-cols-[58px_repeat(16,1fr)] gap-[3px]' : 'grid-cols-[92px_repeat(16,1fr)]')}>
            <span />
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} className={cx(i % 4 === 0 && 'font-bold text-fog-200')}>
                {i % 4 === 0 ? i / 4 + 1 : ['e', 'y', 'a'][(i % 4) - 1]}
              </span>
            ))}
          </div>
          {rows.map((r) => (
            <div key={r.id} className={cx('grid items-center', compact ? 'grid-cols-[58px_repeat(16,1fr)] gap-[3px]' : 'grid-cols-[92px_repeat(16,1fr)] gap-1')}>
              <button
                className={cx('truncate rounded-md py-1 text-left', compact ? 'px-0.5 text-[11px]' : 'px-1.5 text-xs', muted[r.id] ? 'text-fog-400 line-through' : 'text-fog-200')}
                onClick={() => setMuted({ ...muted, [r.id]: !muted[r.id] })}
                title="Silenciar/activar fila"
              >
                {r.label}
              </button>
              {pattern[r.id].map((on, i) => (
                <button
                  key={i}
                  aria-label={`${r.label} paso ${i + 1}`}
                  aria-pressed={on}
                  onClick={() => setPattern({ ...pattern, [r.id]: pattern[r.id].map((v, j) => (j === i ? !v : v)) })}
                  className={cx('aspect-square border transition', compact ? 'rounded-[4px]' : 'rounded-md', i % 4 === 0 ? 'border-ink-500' : 'border-ink-600', step === i && 'ring-2 ring-fog-100/60', !on && (Math.floor(i / 4) % 2 ? 'bg-ink-700' : 'bg-ink-800'))}
                  style={on ? { background: r.color, boxShadow: `0 0 10px ${r.color}66`, borderColor: r.color } : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {!compact && <p className="text-xs text-fog-400">Toca el nombre de una fila para silenciarla. Los sonidos son sintetizados en tiempo real: aproximaciones didácticas, no samples.</p>}
    </div>
  );
}
