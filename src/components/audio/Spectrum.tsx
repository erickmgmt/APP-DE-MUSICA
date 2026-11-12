import { useEffect, useRef } from 'react';
import { getAnalyser } from '../../core/audio/engine';

/**
 * Visualizador de espectro REAL de lo que suena en la app (AnalyserNode del master).
 * Ahorro de CPU: ~30 fps mientras hay sonido; si hay silencio, baja a ~4 fps.
 * No analiza nada que no suene dentro de la app.
 */
export function Spectrum({ height = 96, bars = 48, className }: { height?: number; bars?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const g = canvas.getContext('2d')!;
    let raf = 0;
    let timer = 0;
    let silentFrames = 0;
    let data: Uint8Array<ArrayBuffer> | null = null;
    const peaks = new Float32Array(bars);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = height * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const grad = () => {
      const gr = g.createLinearGradient(0, height, 0, 0);
      gr.addColorStop(0, '#8b5cf6');
      gr.addColorStop(0.6, '#3b82f6');
      gr.addColorStop(1, '#2dd4bf');
      return gr;
    };

    const draw = () => {
      const w = canvas.clientWidth;
      g.clearRect(0, 0, w, height);
      const an = getAnalyser();
      const gap = 2;
      const bw = (w - gap * (bars - 1)) / bars;
      let energy = 0;
      if (an) {
        if (!data || data.length !== an.frequencyBinCount) data = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(data);
        const nyq = an.context.sampleRate / 2;
        for (let i = 0; i < bars; i++) {
          // bandas logarítmicas de 30 Hz a 16 kHz
          const f0 = 30 * Math.pow(16000 / 30, i / bars);
          const f1 = 30 * Math.pow(16000 / 30, (i + 1) / bars);
          const b0 = Math.floor((f0 / nyq) * data.length);
          const b1 = Math.max(b0 + 1, Math.floor((f1 / nyq) * data.length));
          let max = 0;
          for (let b = b0; b < b1 && b < data.length; b++) max = Math.max(max, data[b]);
          const v = max / 255;
          energy += v;
          peaks[i] = Math.max(v, peaks[i] * 0.92);
        }
      } else peaks.fill(0);
      g.fillStyle = grad();
      for (let i = 0; i < bars; i++) {
        const h = Math.max(2, peaks[i] * (height - 4));
        const x = i * (bw + gap);
        g.globalAlpha = 0.35 + peaks[i] * 0.65;
        g.beginPath();
        g.roundRect(x, height - h, bw, h, 2);
        g.fill();
      }
      g.globalAlpha = 1;
      silentFrames = energy < 0.01 ? silentFrames + 1 : 0;
      schedule();
    };

    const schedule = () => {
      if (document.hidden) {
        timer = window.setTimeout(schedule, 500);
        return;
      }
      if (silentFrames > 30) timer = window.setTimeout(() => (raf = requestAnimationFrame(draw)), 250);
      else timer = window.setTimeout(() => (raf = requestAnimationFrame(draw)), 33);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', resize);
    };
  }, [height, bars]);

  return <canvas ref={ref} className={className} style={{ width: '100%', height }} aria-label="Visualizador de espectro del audio de la app" role="img" />;
}
