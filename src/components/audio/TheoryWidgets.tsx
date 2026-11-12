import { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { StepScheduler, playBass, playKeys, playPad } from '../../core/audio/engine';
import { NOTES_EN, NOTES_ES, SCALES, isBlackKey, midiToFreq, midiToName, relativeKey, scaleNotes } from '../../core/music/theory';
import { cx } from '../ui';

// ---------------------------------------------------------------- Piano
export function Piano({
  start = 48,
  octaves = 2,
  highlight,
  root,
  latin,
  onNote,
}: {
  start?: number;
  octaves?: number;
  highlight?: number[]; // clases de altura (0-11)
  root?: number;
  latin?: boolean;
  onNote?: (midi: number) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const keys = Array.from({ length: octaves * 12 + 1 }, (_, i) => start + i);
  const whites = keys.filter((k) => !isBlackKey(k));
  const ww = 100 / whites.length;

  const press = (m: number) => {
    setActive(m);
    window.setTimeout(() => setActive((a) => (a === m ? null : a)), 220);
    (onNote ?? ((x: number) => playKeys(midiToFreq(x), 0.5)))(m);
  };

  return (
    <div className="relative h-36 w-full select-none overflow-hidden rounded-xl border border-ink-500 bg-ink-950 sm:h-44" role="group" aria-label="Teclado de piano">
      {whites.map((m, i) => {
        const pc = m % 12;
        const hl = highlight?.includes(pc);
        return (
          <button
            key={m}
            onPointerDown={() => press(m)}
            aria-label={midiToName(m, latin)}
            className={cx('absolute top-0 h-full rounded-b-md border-r border-ink-600 transition-colors', active === m ? 'bg-violet-soft' : hl ? (pc === root ? 'bg-teal/70' : 'bg-violet/35') : 'bg-fog-100 hover:bg-white')}
            style={{ left: `${i * ww}%`, width: `${ww}%` }}
          >
            <span className={cx('absolute inset-x-0 bottom-1.5 text-center text-[9px] font-semibold sm:text-[10px]', hl || active === m ? 'text-ink-900' : 'text-ink-500')}>
              {latin ? NOTES_ES[pc] : NOTES_EN[pc]}
              {pc === 0 && <sub>{Math.floor(m / 12) - 1}</sub>}
            </span>
          </button>
        );
      })}
      {keys.filter(isBlackKey).map((m) => {
        const whiteIdx = whites.filter((w) => w < m).length;
        const pc = m % 12;
        const hl = highlight?.includes(pc);
        return (
          <button
            key={m}
            onPointerDown={() => press(m)}
            aria-label={midiToName(m, latin)}
            className={cx('absolute top-0 z-10 h-[60%] rounded-b-md border border-ink-950 transition-colors', active === m ? 'bg-violet-soft' : hl ? (pc === root ? 'bg-teal' : 'bg-violet') : 'bg-ink-800 hover:bg-ink-700')}
            style={{ left: `${whiteIdx * ww - ww * 0.3}%`, width: `${ww * 0.6}%` }}
          />
        );
      })}
    </div>
  );
}

export function PianoLesson() {
  const [latin, setLatin] = useState(false);
  const [last, setLast] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border border-ink-600 p-1 text-xs">
          <button className={cx('rounded-md px-2 py-1', !latin && 'bg-ink-600')} onClick={() => setLatin(false)}>C D E (REAPER)</button>
          <button className={cx('rounded-md px-2 py-1', latin && 'bg-ink-600')} onClick={() => setLatin(true)}>Do Re Mi</button>
        </div>
        {last !== null && (
          <p className="font-mono text-sm text-fog-200">
            {midiToName(last)} · {midiToName(last, true)} · MIDI {last} · {midiToFreq(last).toFixed(1)} Hz
          </p>
        )}
      </div>
      <Piano latin={latin} onNote={(m) => { setLast(m); playKeys(midiToFreq(m), 0.5); }} />
    </div>
  );
}

// ---------------------------------------------------------------- Selector de tónica
function TonicSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="input w-auto" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Tónica">
      {NOTES_EN.map((n, i) => (
        <option key={n} value={n}>
          {n} ({NOTES_ES[i]})
        </option>
      ))}
    </select>
  );
}

function usePlayer() {
  const timers = useRef<number[]>([]);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = (events: { at: number; fn: () => void }[], total: number) => {
    timers.current.forEach(clearTimeout);
    setPlaying(true);
    timers.current = events.map((e) => window.setTimeout(e.fn, e.at));
    timers.current.push(window.setTimeout(() => setPlaying(false), total));
  };
  return { run, playing };
}

// ---------------------------------------------------------------- Escalas
export function ScalePlayer() {
  const [tonic, setTonic] = useState('A');
  const [scaleId, setScaleId] = useState('menor');
  const [current, setCurrent] = useState<number | null>(null);
  const { run, playing } = usePlayer();
  const scale = SCALES.find((s) => s.id === scaleId)!;
  const pcs = scaleNotes(tonic, scaleId);
  const rootPc = NOTES_EN.indexOf(tonic as (typeof NOTES_EN)[number]);
  const rootMidi = 57 + ((rootPc - 9 + 12) % 12); // tónica entre A3 y G#4

  const play = () => {
    const seq = [...scale.intervals.map((i) => rootMidi + i), rootMidi + 12];
    run(
      seq.map((m, i) => ({ at: i * 330, fn: () => { setCurrent(m % 12); playKeys(midiToFreq(m), 0.3); } })),
      seq.length * 330 + 300,
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <TonicSelect value={tonic} onChange={setTonic} />
        <select className="input w-auto" value={scaleId} onChange={(e) => setScaleId(e.target.value)} aria-label="Escala">
          {SCALES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={play} disabled={playing}>
          <Play size={16} /> Escuchar escala
        </button>
      </div>
      <Piano start={48} highlight={pcs} root={rootPc} />
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="panel-inset p-3 sm:col-span-2">
          <p className="label">Notas</p>
          <div className="flex flex-wrap gap-1.5">
            {pcs.map((pc) => (
              <span key={pc} className={cx('rounded-lg border px-2 py-1 font-mono text-sm', current === pc ? 'border-teal bg-teal/20' : pc === rootPc ? 'border-teal/50 text-teal' : 'border-ink-500 text-fog-200')}>
                {NOTES_EN[pc]} <span className="text-fog-400">{NOTES_ES[pc]}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="panel-inset p-3">
          <p className="label">Patrón</p>
          <p className="font-mono text-sm text-fog-100">{scale.pattern}</p>
          <p className="mt-1 text-xs text-fog-400">{scale.mood}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Tonalidades
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function diatonicChords(tonic: string, mode: 'mayor' | 'menor') {
  const pcs = scaleNotes(tonic, mode);
  return pcs.map((_, i) => {
    const notes = [0, 2, 4, 6].map((o) => pcs[(i + o) % 7]);
    const iv = (a: number, b: number) => (b - a + 12) % 12;
    const third = iv(notes[0], notes[1]);
    const fifth = iv(notes[0], notes[2]);
    const seventh = iv(notes[0], notes[3]);
    let symbol = '';
    let roman = ROMAN[i];
    if (third === 3 && fifth === 7) { roman = roman.toLowerCase(); symbol = seventh === 10 ? 'm7' : 'm(maj7)'; }
    else if (third === 4 && fifth === 7) symbol = seventh === 11 ? 'maj7' : '7';
    else if (third === 3 && fifth === 6) { roman = roman.toLowerCase() + '°'; symbol = 'm7♭5'; }
    return { roman, name: NOTES_EN[notes[0]] + symbol, notes };
  });
}

export function KeyExplorer() {
  const [tonic, setTonic] = useState('A');
  const [mode, setMode] = useState<'mayor' | 'menor'>('menor');
  const pcs = scaleNotes(tonic, mode);
  const rel = relativeKey(tonic, mode);
  const rootPc = NOTES_EN.indexOf(tonic as (typeof NOTES_EN)[number]);
  const chords = diatonicChords(tonic, mode);
  const bassMidi = 33 + ((rootPc - 9 + 12) % 12); // tónica del bajo entre A1 y G#2

  const playChord = (notes: number[]) => {
    // voicing cerrado: raíz entre A3 y G#4, cada nota por encima de la anterior
    const midi: number[] = [];
    notes.forEach((pc, i) => {
      if (i === 0) midi.push(57 + ((pc - 9 + 12) % 12));
      else {
        const prev = midi[i - 1];
        midi.push(prev + ((pc - (prev % 12) + 12) % 12 || 12));
      }
    });
    playPad(midi.map(midiToFreq), 1.4, undefined, 0.05);
    playKeys(midiToFreq(midi[0]), 1.2, undefined, 0.08);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <TonicSelect value={tonic} onChange={setTonic} />
        <select className="input w-auto" value={mode} onChange={(e) => setMode(e.target.value as 'mayor' | 'menor')} aria-label="Modo">
          <option value="menor">menor</option>
          <option value="mayor">mayor</option>
        </select>
        <button className="btn-primary" onClick={() => { playChord(chords[0].notes.slice(0, 3)); playBass(midiToFreq(bassMidi), 1.2); }}>
          <Play size={16} /> Acorde de tónica
        </button>
      </div>
      <Piano start={48} highlight={pcs} root={rootPc} />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="panel-inset p-3 text-sm">
          <p className="label">Tonalidad</p>
          <p className="text-fog-100">
            <b>{tonic} {mode}</b> ({NOTES_ES[rootPc]} {mode})
          </p>
          <p className="mt-1 text-fog-300">
            Relativa: <b>{rel.tonic} {rel.mode}</b> — mismas notas.
          </p>
          <p className="mt-1 text-fog-300">
            Tónica del bajo: {midiToName(bassMidi)} ≈ {midiToFreq(bassMidi).toFixed(1)} Hz
          </p>
        </div>
        <div className="panel-inset p-3">
          <p className="label">Acordes de la tonalidad (con séptima)</p>
          <div className="flex flex-wrap gap-1.5">
            {chords.map((c) => (
              <button key={c.roman} className="rounded-lg border border-ink-500 px-2 py-1 text-xs hover:border-violet hover:bg-violet/10" onClick={() => playChord(c.notes)} title={c.notes.map((n) => NOTES_EN[n]).join(' ')}>
                <span className="text-fog-400">{c.roman}</span> <b className="font-mono">{c.name}</b>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Mini piano roll
const ROLL_NOTES = [74, 72, 69, 67, 64, 62, 60, 57]; // D5 C5 A4 G4 E4 D4 C4 A3 — La menor pentatónica

export function PianoRoll() {
  const [grid, setGrid] = useState<boolean[][]>(() => ROLL_NOTES.map((_, r) => Array.from({ length: 16 }, (_, c) => (r === 7 && c === 0) || (r === 6 && c === 4) || (r === 4 && c === 8) || (r === 7 && c === 12))));
  const [sound, setSound] = useState<'keys' | 'bass'>('keys');
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const ref = useRef({ grid, sound });
  ref.current = { grid, sound };
  const sched = useRef<StepScheduler | null>(null);
  useEffect(() => () => sched.current?.stop(), []);

  const toggle = () => {
    if (playing) { sched.current?.stop(); setPlaying(false); return; }
    sched.current = new StepScheduler({
      bpm: 110,
      totalSteps: 16,
      onUiStep: setStep,
      onStep: (s, t) => {
        ref.current.grid.forEach((row, r) => {
          if (!row[s]) return;
          const m = ROLL_NOTES[r];
          if (ref.current.sound === 'bass') playBass(midiToFreq(m - 24), 0.2, t);
          else playKeys(midiToFreq(m), 0.25, t, 0.14);
        });
      },
    });
    sched.current.start();
    setPlaying(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={playing ? 'btn-ghost' : 'btn-primary'} onClick={toggle}>
          {playing ? <Square size={16} /> : <Play size={16} />} {playing ? 'Detener' : 'Reproducir'}
        </button>
        <select className="input w-auto" value={sound} onChange={(e) => setSound(e.target.value as 'keys' | 'bass')} aria-label="Instrumento">
          <option value="keys">Instrumento: piano eléctrico</option>
          <option value="bass">Instrumento: bajo (2 octavas abajo)</option>
        </select>
        <button className="btn-ghost" onClick={() => setGrid(ROLL_NOTES.map(() => Array(16).fill(false)))}>Vaciar</button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[480px] space-y-1">
          {ROLL_NOTES.map((m, r) => (
            <div key={m} className="grid grid-cols-[44px_repeat(16,1fr)] gap-1">
              <span className="pr-1 text-right font-mono text-[11px] leading-6 text-fog-400">{midiToName(sound === 'bass' ? m - 24 : m)}</span>
              {grid[r].map((on, c) => (
                <button
                  key={c}
                  aria-label={`${midiToName(m)} paso ${c + 1}`}
                  aria-pressed={on}
                  onClick={() => setGrid(grid.map((row, rr) => (rr === r ? row.map((v, cc) => (cc === c ? !v : v)) : row)))}
                  className={cx('h-6 rounded border', on ? 'border-teal bg-teal/80' : c % 4 === 0 ? 'border-ink-500 bg-ink-700' : 'border-ink-600 bg-ink-800', step === c && 'ring-1 ring-fog-100/60')}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-fog-400">Filas = altura (notas de La menor pentatónica). Columnas = tiempo (semicorcheas de 1 compás). Cambia el instrumento: el MIDI es el mismo, el sonido cambia.</p>
    </div>
  );
}
