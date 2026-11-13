import { cx } from '../../components/ui';

/** Deslizador con etiqueta, valor y explicación corta (para principiantes). */
export function Knob({ label, value, min, max, step = 1, onChange, format, hint, className }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string; hint?: string; className?: string }) {
  return (
    <label className={cx('block', className)}>
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-fog-200">{label}</span>
        <span className="font-mono text-fog-300">{format ? format(value) : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} onDoubleClick={() => onChange(min < 0 && max > 0 ? 0 : value)} className="w-full" aria-label={label} />
      {hint && <span className="block text-[11px] leading-tight text-fog-400">{hint}</span>}
    </label>
  );
}

export const fmtDb = (v: number) => (v <= -40 ? '-∞ dB' : `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`);
export const fmtPan = (v: number) => (Math.abs(v) < 0.02 ? 'Centro' : `${Math.round(Math.abs(v) * 100)} % ${v < 0 ? 'izq.' : 'der.'}`);
export const fmtPct = (v: number) => `${Math.round(v * 100)} %`;
export const fmtHz = (v: number) => (v >= 19999 ? 'Abierto' : v >= 1000 ? `${(v / 1000).toFixed(1)} kHz` : `${Math.round(v)} Hz`);

/** Filtro en escala logarítmica (80 Hz – 20 kHz) para un deslizador lineal 0..1000. */
export const cutoffToSlider = (hz: number) => (Math.log(hz / 80) / Math.log(20000 / 80)) * 1000;
export const sliderToCutoff = (v: number) => 80 * Math.pow(20000 / 80, v / 1000);
