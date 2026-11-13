import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { getAnalyser } from '../../core/audio/engine';
import type { StudioTrack } from '../../core/studio/song';
import { Spectrum } from '../../components/audio/Spectrum';
import { Panel, cx } from '../../components/ui';
import { Knob, cutoffToSlider, fmtDb, fmtHz, fmtPan, fmtPct, sliderToCutoff } from './controls';
import type { StudioApi } from './useStudio';

/** Medidor de pico REAL de la salida de la app (lo que estás oyendo ahora). */
function PeakMeter() {
  const [db, setDb] = useState(-Infinity);
  const [hold, setHold] = useState(-Infinity);
  const holdRef = useRef(-Infinity);
  useEffect(() => {
    const buf = new Float32Array(2048);
    let timer = 0;
    const tick = () => {
      const an = getAnalyser();
      if (an) {
        an.getFloatTimeDomainData(buf);
        let p = 0;
        for (let i = 0; i < buf.length; i++) p = Math.max(p, Math.abs(buf[i]));
        const v = p > 0 ? 20 * Math.log10(p) : -Infinity;
        setDb(v);
        if (v > holdRef.current) {
          holdRef.current = v;
          setHold(v);
        }
      }
      timer = window.setTimeout(tick, 80);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  const pct = (v: number) => (v === -Infinity ? 0 : Math.max(0, Math.min(100, ((v + 48) / 48) * 100)));
  return (
    <div>
      <div className="relative h-3 overflow-hidden rounded-full bg-ink-700">
        <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75" style={{ width: `${pct(db)}%`, background: 'linear-gradient(90deg,#2dd4bf 0%,#a3e635 70%,#fbbf24 88%,#fb7185 100%)' }} />
        <div className="absolute inset-y-0 w-0.5 bg-fog-100" style={{ left: `${pct(hold)}%` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-fog-400">
        <span>-48</span>
        <span className={cx(hold > -0.3 ? 'text-rose' : 'text-fog-200')}>Pico: {hold === -Infinity ? '—' : `${hold.toFixed(1)} dBFS`}</span>
        <button className="underline" onClick={() => { holdRef.current = -Infinity; setHold(-Infinity); }}>reiniciar</button>
        <span>0</span>
      </div>
    </div>
  );
}

function Channel({ api, t }: { api: StudioApi; t: StudioTrack }) {
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<StudioTrack>, key: string) => api.setSong((s) => ({ ...s, tracks: s.tracks.map((x) => (x.id === t.id ? { ...x, ...patch } : x)) }), `${t.id}:${key}`);
  return (
    <div className="panel p-3">
      <div className="flex items-center gap-2">
        <span className="h-6 w-1.5 shrink-0 rounded-full" style={{ background: t.color }} />
        <p className="w-24 truncate text-sm font-semibold sm:w-32">{t.name}</p>
        <button className={cx('h-7 w-7 rounded-md border text-xs font-bold', t.mute ? 'border-amber bg-amber/20 text-amber' : 'border-ink-500 text-fog-400')} onClick={() => set({ mute: !t.mute }, 'mute')} aria-pressed={t.mute} title="Silenciar (Mute)">M</button>
        <button className={cx('h-7 w-7 rounded-md border text-xs font-bold', t.solo ? 'border-teal bg-teal/20 text-teal' : 'border-ink-500 text-fog-400')} onClick={() => set({ solo: !t.solo }, 'solo')} aria-pressed={t.solo} title="Escuchar solo esta pista (Solo)">S</button>
        <Knob className="min-w-0 flex-1" label="Volumen" value={t.volume} min={-40} max={6} step={0.5} format={fmtDb} onChange={(volume) => set({ volume }, 'vol')} />
        <button className="btn-ghost btn-sm" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Más ajustes"><ChevronDown size={14} className={cx('transition', open && 'rotate-180')} /></button>
      </div>
      {open && (
        <div className="mt-3 grid gap-3 border-t border-ink-600/60 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <Knob label="Paneo" value={t.pan} min={-1} max={1} step={0.05} format={fmtPan} onChange={(pan) => set({ pan }, 'pan')} hint="Izquierda ↔ derecha. Kick y bajo, al centro." />
          <Knob label="Graves (150 Hz)" value={t.eqLow} min={-15} max={9} step={0.5} format={fmtDb} onChange={(eqLow) => set({ eqLow }, 'low')} hint="Quita graves a lo que no los necesita (pads, acordes) para limpiar." />
          <Knob label="Medios (1 kHz)" value={t.eqMid} min={-12} max={9} step={0.5} format={fmtDb} onChange={(eqMid) => set({ eqMid }, 'mid')} hint="Cuerpo y presencia." />
          <Knob label="Agudos (6 kHz)" value={t.eqHigh} min={-12} max={9} step={0.5} format={fmtDb} onChange={(eqHigh) => set({ eqHigh }, 'high')} hint="Brillo. Si algo suena chillón, bájalo." />
          <Knob label="Filtro" value={cutoffToSlider(t.cutoff)} min={0} max={1000} format={() => fmtHz(t.cutoff)} onChange={(v) => set({ cutoff: v >= 999 ? 20000 : sliderToCutoff(v) }, 'cut')} hint="Paso bajo: más a la izquierda = más oscuro y lejano." />
          <Knob label="Reverb" value={t.reverb} min={0} max={1} step={0.01} format={fmtPct} onChange={(reverb) => set({ reverb }, 'rev')} hint="Espacio y profundidad. Más reverb = más al fondo." />
          <Knob label="Delay" value={t.delay} min={0} max={1} step={0.01} format={fmtPct} onChange={(delay) => set({ delay }, 'del')} hint="Ecos a corchea con puntillo, sincronizados al BPM." />
          <Knob label="Sidechain (kick)" value={t.duck} min={0} max={1} step={0.01} format={fmtPct} onChange={(duck) => set({ duck }, 'duck')} hint="Baja esta pista cada vez que suena el kick: el bajo 'respira'." />
        </div>
      )}
    </div>
  );
}

export function MixerView({ api }: { api: StudioApi }) {
  const { song, setSong } = api;
  if (!song) return null;
  return (
    <div className="space-y-3">
      <Panel title="Master (salida final)">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <Knob label="Volumen master" value={song.masterVolume} min={-24} max={6} step={0.5} format={fmtDb} onChange={(masterVolume) => setSong((s) => ({ ...s, masterVolume }), 'master')} />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={song.limiter} onChange={(e) => setSong((s) => ({ ...s, limiter: e.target.checked }))} />
              <span>
                <span className="flex items-center gap-1.5 font-medium"><ShieldCheck size={14} className="text-teal" /> Limitador de protección</span>
                <span className="block text-[11px] text-fog-400">Frena los picos cerca de 0 dB para evitar distorsión. Es una protección, no un mastering completo.</span>
              </span>
            </label>
            <PeakMeter />
            <p className="text-[11px] text-fog-400">Medición real de lo que suena ahora (pico de muestra). Si el pico llega a 0 dBFS, baja volúmenes.</p>
          </div>
          <div className="panel-inset p-3">
            <p className="label">Espectro en vivo</p>
            <Spectrum height={90} />
            <p className="mt-1 text-[11px] text-fog-400">Izquierda = graves · derecha = agudos.</p>
          </div>
        </div>
      </Panel>
      {song.tracks.map((t) => <Channel key={t.id} api={api} t={t} />)}
      <p className="text-xs text-fog-400">Consejo: empieza solo con los volúmenes (primero el kick, luego el bajo). Usa EQ y efectos después. Doble toque en un deslizador lo devuelve a 0.</p>
    </div>
  );
}
