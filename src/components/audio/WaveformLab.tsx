import { useEffect, useRef, useState } from 'react';
import { Play, Square, TriangleAlert } from 'lucide-react';
import { getAudio } from '../../core/audio/engine';
import { NOTES_EN } from '../../core/music/theory';

function nearestNote(freq: number): string {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  return `${NOTES_EN[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

/** Generador de tonos + osciloscopio (dibuja la onda real que suena). */
export function WaveformLab() {
  const [freq, setFreq] = useState(110);
  const [type, setType] = useState<OscillatorType>('sine');
  const [vol, setVol] = useState(0.08);
  const [on, setOn] = useState(false);
  const nodes = useRef<{ osc: OscillatorNode; gain: GainNode; an: AnalyserNode } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const stop = () => {
    const n = nodes.current;
    if (n) {
      const t = n.gain.context.currentTime;
      n.gain.gain.setTargetAtTime(0, t, 0.02);
      n.osc.stop(t + 0.1);
      nodes.current = null;
    }
    setOn(false);
  };

  useEffect(() => () => stop(), []);

  useEffect(() => {
    const n = nodes.current;
    if (!n) return;
    n.osc.frequency.setTargetAtTime(freq, n.osc.context.currentTime, 0.02);
    n.osc.type = type;
    n.gain.gain.setTargetAtTime(vol, n.gain.context.currentTime, 0.02);
  }, [freq, type, vol]);

  const start = () => {
    const { ctx, master } = getAudio();
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(vol, ctx.currentTime, 0.03);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    osc.connect(gain).connect(an);
    gain.connect(master);
    osc.start();
    nodes.current = { osc, gain, an };
    setOn(true);
  };

  useEffect(() => {
    if (!on) return;
    const c = canvas.current!;
    const g = c.getContext('2d')!;
    const buf = new Float32Array(2048);
    let alive = true;
    let timer = 0;
    const draw = () => {
      if (!alive) return;
      const n = nodes.current;
      const w = (c.width = c.clientWidth);
      const h = (c.height = 140);
      g.clearRect(0, 0, w, h);
      g.strokeStyle = '#2a2a40';
      g.beginPath();
      g.moveTo(0, h / 2);
      g.lineTo(w, h / 2);
      g.stroke();
      if (n) {
        n.an.getFloatTimeDomainData(buf);
        // sincroniza en un cruce por cero ascendente para que la onda quede quieta
        let startIdx = 0;
        for (let i = 1; i < 1024; i++) if (buf[i - 1] < 0 && buf[i] >= 0) { startIdx = i; break; }
        g.strokeStyle = '#2dd4bf';
        g.lineWidth = 2;
        g.beginPath();
        const len = 1024;
        for (let i = 0; i < len; i++) {
          const x = (i / len) * w;
          const y = h / 2 - (buf[startIdx + i] / Math.max(vol, 0.02)) * (h * 0.4);
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
      timer = window.setTimeout(draw, 40);
    };
    draw();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [on, vol]);

  const logMin = Math.log(30), logMax = Math.log(12000);
  const sliderVal = ((Math.log(freq) - logMin) / (logMax - logMin)) * 1000;
  const zone = freq < 60 ? 'Sub-graves' : freq < 250 ? 'Graves' : freq < 2000 ? 'Medios' : freq < 6000 ? 'Medios-agudos' : 'Agudos';

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-xs text-amber"><TriangleAlert size={14} /> Empieza con volumen bajo, sobre todo con auriculares.</p>
      <canvas ref={canvas} className="h-[140px] w-full rounded-xl border border-ink-600 bg-ink-950" aria-label="Osciloscopio" role="img" />
      <div className="flex flex-wrap items-center gap-2">
        <button className={on ? 'btn-ghost' : 'btn-primary'} onClick={on ? stop : start}>
          {on ? <Square size={16} /> : <Play size={16} />} {on ? 'Detener tono' : 'Generar tono'}
        </button>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value as OscillatorType)} aria-label="Forma de onda">
          <option value="sine">Senoidal (pura)</option>
          <option value="triangle">Triangular</option>
          <option value="square">Cuadrada</option>
          <option value="sawtooth">Diente de sierra</option>
        </select>
        {[50, 200, 1000, 8000].map((f) => (
          <button key={f} className="btn-ghost btn-sm" onClick={() => setFreq(f)}>{f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`}</button>
        ))}
      </div>
      <label className="block text-xs text-fog-300">
        Frecuencia: <b className="font-mono text-fog-100">{freq.toFixed(0)} Hz</b> · nota más cercana {nearestNote(freq)} · zona: <b className="text-teal">{zone}</b>
        <input type="range" min={0} max={1000} value={sliderVal} onChange={(e) => setFreq(Math.exp(logMin + (+e.target.value / 1000) * (logMax - logMin)))} className="w-full" />
      </label>
      <label className="block text-xs text-fog-300">
        Nivel: <b className="font-mono text-fog-100">{(20 * Math.log10(vol)).toFixed(1)} dB</b> (relativo)
        <input type="range" min={0.005} max={0.25} step={0.005} value={vol} onChange={(e) => setVol(+e.target.value)} className="w-full" />
      </label>
    </div>
  );
}
