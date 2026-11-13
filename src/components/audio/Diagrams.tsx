import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cx } from '../ui';

// ---------------------------------------------------------------- Flujo de señal de un DAW
const DAW_BLOCKS = [
  { id: 'fuente', title: 'Fuente', sub: 'Audio o MIDI + instrumento', text: 'El origen del sonido: un archivo de audio (sample, grabación) o un ítem MIDI que toca un instrumento virtual.' },
  { id: 'pista', title: 'Pista', sub: 'Ítems en la línea de tiempo', text: 'Cada pista contiene ítems colocados en el tiempo. Una pista = normalmente un sonido (kick, bajo, pad...).' },
  { id: 'fx', title: 'FX', sub: 'EQ · compresor · reverb', text: 'La cadena de efectos de la pista transforma el sonido, en orden de arriba abajo.' },
  { id: 'fader', title: 'Fader y paneo', sub: 'Volumen y posición', text: 'Controla cuánto se oye la pista y dónde se sitúa entre izquierda y derecha.' },
  { id: 'master', title: 'Master', sub: 'Suma de todo', text: 'Todas las pistas suman aquí. En el master se hace el mastering y desde aquí se exporta.' },
  { id: 'salida', title: 'Salida', sub: 'Altavoces o archivo', text: 'Lo que escuchas por tus altavoces/auriculares, o el archivo WAV/MP3 que exportas con Render.' },
];

export function DawMap() {
  const [sel, setSel] = useState('fuente');
  const cur = DAW_BLOCKS.find((b) => b.id === sel)!;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-stretch gap-1.5">
        {DAW_BLOCKS.map((b, i) => (
          <div key={b.id} className="flex items-center gap-1.5">
            <button onClick={() => setSel(b.id)} className={cx('rounded-xl border px-3 py-2 text-left transition', sel === b.id ? 'border-violet bg-violet/15 shadow-[0_0_20px_-6px_#8b5cf6]' : 'border-ink-600 bg-ink-850 hover:border-ink-500')}>
              <div className="text-sm font-semibold">{b.title}</div>
              <div className="text-[11px] text-fog-400">{b.sub}</div>
            </button>
            {i < DAW_BLOCKS.length - 1 && <ArrowRight size={16} className="text-fog-400" />}
          </div>
        ))}
      </div>
      <div className="panel-inset p-3 text-sm text-fog-200 animate-fade-up" key={sel}>
        <b className="text-teal">{cur.title}:</b> {cur.text}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Mapa del Estudio de la app
const ZONES = [
  { id: 'transport', label: 'Transporte', text: 'Arriba: ▶/■ reproducir y detener, modo Loop o Canción, posición (compás.pulso), BPM con − y +, deshacer (↶) y Exportar a WAV.' },
  { id: 'tabs', label: 'Pestañas', text: 'Pistas (crear el patrón), Mezcla (volumen y efectos) y Estructura (las partes de la canción).' },
  { id: 'tracks', label: 'Lista de pistas', text: 'Cada pista con su color, su sonido y los botones M (silenciar) y S (solo). Debajo: "Añadir pista" y los Ajustes del loop (duración y swing).' },
  { id: 'editor', label: 'Editor de la pista', text: 'Batería: 16 casillas por compás. Instrumentos: editor de notas con duración, modo Acorde y "Solo notas de la escala". Aquí también cambias el sonido o duplicas la pista.' },
];

export function StudioMap() {
  const [sel, setSel] = useState('editor');
  const cur = ZONES.find((z) => z.id === sel)!;
  const zone = (id: string, cls: string) => (
    <button onClick={() => setSel(id)} className={cx('rounded-lg border px-1 text-[10px] font-semibold uppercase tracking-wide transition sm:text-xs', sel === id ? 'border-teal bg-teal/15 text-teal' : 'border-ink-500 bg-ink-800 text-fog-400 hover:bg-ink-700', cls)}>
      {ZONES.find((z) => z.id === id)!.label}
    </button>
  );
  return (
    <div className="space-y-3">
      <div className="grid aspect-[16/10] grid-cols-[32%_1fr] grid-rows-[14%_11%_1fr] gap-1.5 rounded-xl border border-ink-500 bg-ink-950 p-1.5" aria-label="Mapa simplificado del Estudio">
        {zone('transport', 'col-span-2')}
        {zone('tabs', 'col-span-2')}
        {zone('tracks', '')}
        {zone('editor', '')}
      </div>
      <div className="panel-inset p-3 text-sm text-fog-200 animate-fade-up" key={sel}>
        <b className="text-teal">{cur.label}:</b> {cur.text}
      </div>
      <p className="text-xs text-fog-400">En el teléfono el editor aparece debajo de la lista de pistas.</p>
    </div>
  );
}

// ---------------------------------------------------------------- Barra de frecuencias (escala logarítmica)
const BANDS = [
  { from: 20, to: 60, label: 'Sub' },
  { from: 60, to: 250, label: 'Graves' },
  { from: 250, to: 500, label: 'Medios-graves' },
  { from: 500, to: 2000, label: 'Medios' },
  { from: 2000, to: 6000, label: 'Medios-agudos' },
  { from: 6000, to: 20000, label: 'Agudos / aire' },
];
const pos = (f: number) => ((Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20))) * 100;
const fmt = (f: number) => (f >= 1000 ? `${+(f / 1000).toFixed(1)}k` : `${f}`);

export function FreqBar({ low, high, compact }: { low: number; high: number; compact?: boolean }) {
  return (
    <div className="w-full" aria-label={`Rango aproximado ${low}–${high} Hz`}>
      <div className="relative h-5 overflow-hidden rounded-md bg-ink-700">
        {BANDS.map((b, i) => (
          <div key={b.label} className={cx('absolute inset-y-0 border-r border-ink-900/60', i % 2 ? 'bg-ink-600/50' : 'bg-ink-700')} style={{ left: `${pos(b.from)}%`, width: `${pos(b.to) - pos(b.from)}%` }} />
        ))}
        <div className="absolute inset-y-0 rounded-md" style={{ left: `${pos(low)}%`, width: `${Math.max(1.5, pos(high) - pos(low))}%`, background: 'linear-gradient(90deg,#8b5cf6,#2dd4bf)', boxShadow: '0 0 12px #8b5cf688' }} />
      </div>
      {!compact && (
        <div className="relative mt-1 h-4 text-[9px] text-fog-400">
          {BANDS.map((b) => (
            <span key={b.label} className="absolute -translate-x-0 truncate" style={{ left: `${pos(b.from)}%`, width: `${pos(b.to) - pos(b.from)}%` }}>
              {b.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-between font-mono text-[10px] text-fog-400">
        <span>20 Hz</span>
        <span className="text-fog-200">≈ {fmt(low)}–{fmt(high)} Hz</span>
        <span>20 kHz</span>
      </div>
    </div>
  );
}
