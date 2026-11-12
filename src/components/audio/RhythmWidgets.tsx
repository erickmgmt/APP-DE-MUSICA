import { useEffect, useRef, useState } from 'react';
import { Hand, Minus, Play, Plus, Square } from 'lucide-react';
import { StepScheduler, playClick, playHat, playKick } from '../../core/audio/engine';
import { cx } from '../ui';

function useScheduler() {
  const ref = useRef<StepScheduler | null>(null);
  useEffect(() => () => ref.current?.stop(), []);
  return ref;
}

/** Metrónomo con tap tempo. */
export function Metronome() {
  const [bpm, setBpm] = useState(122);
  const [beat, setBeat] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const taps = useRef<number[]>([]);
  const sched = useScheduler();

  useEffect(() => {
    if (sched.current) sched.current.opts.bpm = bpm;
  }, [bpm, sched]);

  const toggle = () => {
    if (playing) {
      sched.current?.stop();
      setPlaying(false);
      return;
    }
    sched.current = new StepScheduler({ bpm, stepsPerBeat: 1, totalSteps: 4, onUiStep: setBeat, onStep: (s, t) => playClick(t, s === 0) });
    sched.current.start();
    setPlaying(true);
  };

  const tap = () => {
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < 3000), now].slice(-8);
    if (taps.current.length >= 2) {
      const intervals = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBpm(Math.max(40, Math.min(220, Math.round(60000 / avg))));
    }
  };

  const ms = 60000 / bpm;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="btn-ghost btn-sm" onClick={() => setBpm((b) => Math.max(40, b - 1))} aria-label="Bajar BPM">
            <Minus size={14} />
          </button>
          <div className="min-w-24 text-center">
            <div className="font-mono text-4xl font-semibold text-gradient">{bpm}</div>
            <div className="text-[10px] uppercase tracking-widest text-fog-400">BPM</div>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => setBpm((b) => Math.min(220, b + 1))} aria-label="Subir BPM">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cx('h-4 w-4 rounded-full border transition', beat === i ? (i === 0 ? 'border-teal bg-teal shadow-[0_0_14px_#2dd4bf]' : 'border-violet bg-violet shadow-[0_0_14px_#8b5cf6]') : 'border-ink-500 bg-ink-700')} />
          ))}
        </div>
      </div>
      <input type="range" min={40} max={200} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full" aria-label="BPM" />
      <div className="flex flex-wrap gap-2">
        <button className={playing ? 'btn-ghost' : 'btn-primary'} onClick={toggle}>
          {playing ? <Square size={16} /> : <Play size={16} />} {playing ? 'Detener' : 'Reproducir'}
        </button>
        <button className="btn-ghost" onClick={tap}>
          <Hand size={16} /> TAP
        </button>
        {[100, 122, 128].map((b) => (
          <button key={b} className="btn-ghost btn-sm" onClick={() => setBpm(b)}>
            {b}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="panel-inset p-2">
          <div className="font-mono text-base text-fog-100">{ms.toFixed(0)} ms</div>
          <div className="text-fog-400">1 pulso (negra)</div>
        </div>
        <div className="panel-inset p-2">
          <div className="font-mono text-base text-fog-100">{((ms * 4) / 1000).toFixed(2)} s</div>
          <div className="text-fog-400">1 compás 4/4</div>
        </div>
        <div className="panel-inset p-2">
          <div className="font-mono text-base text-fog-100">{((ms * 64) / 1000).toFixed(1)} s</div>
          <div className="text-fog-400">16 compases</div>
        </div>
      </div>
    </div>
  );
}

/** Rejilla de un compás 4/4 con cursor. */
export function BarGrid() {
  const [bpm, setBpm] = useState(96);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [hats, setHats] = useState(true);
  const hatsRef = useRef(hats);
  hatsRef.current = hats;
  const sched = useScheduler();

  useEffect(() => {
    if (sched.current) sched.current.opts.bpm = bpm;
  }, [bpm, sched]);

  const toggle = () => {
    if (playing) {
      sched.current?.stop();
      setPlaying(false);
      return;
    }
    sched.current = new StepScheduler({
      bpm,
      totalSteps: 16,
      onUiStep: setStep,
      onStep: (s, t) => {
        if (s % 4 === 0) playKick(t, { gain: 0.7 });
        if (hatsRef.current) playHat(t, false, s % 2 === 0 ? 0.12 : 0.06);
      },
    });
    sched.current.start();
    setPlaying(true);
  };

  const labels = ['1', 'e', 'y', 'a', '2', 'e', 'y', 'a', '3', 'e', 'y', 'a', '4', 'e', 'y', 'a'];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((beat) => (
          <div key={beat} className={cx('rounded-xl border p-2', Math.floor(step / 4) === beat ? 'border-violet/60 bg-violet/10' : 'border-ink-600 bg-ink-850')}>
            <div className="mb-2 text-center text-xs font-semibold text-fog-300">Pulso {beat + 1}</div>
            <div className="grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((sub) => {
                const i = beat * 4 + sub;
                return (
                  <div key={sub} className={cx('grid aspect-square place-items-center rounded-md text-[10px] font-mono transition', step === i ? 'bg-teal text-ink-900' : sub === 0 ? 'bg-ink-600 text-fog-100' : 'bg-ink-700 text-fog-400')}>
                    {labels[i]}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className={playing ? 'btn-ghost' : 'btn-primary'} onClick={toggle}>
          {playing ? <Square size={16} /> : <Play size={16} />} {playing ? 'Detener' : 'Reproducir'}
        </button>
        <label className="flex items-center gap-2 text-sm text-fog-300">
          <input type="checkbox" checked={hats} onChange={(e) => setHats(e.target.checked)} /> Semicorcheas (hat)
        </label>
        <label className="flex-1 text-xs text-fog-300">
          BPM {bpm}
          <input type="range" min={60} max={130} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full" />
        </label>
      </div>
      <p className="text-xs text-fog-400">Kick en cada pulso, hat en cada semicorchea. Cuenta en voz alta: "1 e y a, 2 e y a…". Empieza lento.</p>
    </div>
  );
}
