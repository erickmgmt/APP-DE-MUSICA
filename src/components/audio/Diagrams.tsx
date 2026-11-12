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

// ---------------------------------------------------------------- Mapa (simplificado) de REAPER
const ZONES = [
  { id: 'menu', label: 'Menú y barra de herramientas', text: 'Arriba: menús File, Edit, View, Insert, Item, Track, Options, Actions, Extensions, Help (según idioma) y la barra de herramientas con botones como el snap (imán) y la cuadrícula.' },
  { id: 'tcp', label: 'Panel de pistas (TCP)', text: 'A la izquierda: cada pista con su nombre, botones de grabar, mute (M), solo (S), FX, ruteo, volumen y paneo. Doble clic en el espacio vacío = pista nueva.' },
  { id: 'arrange', label: 'Área de arreglo + regla', text: 'El centro: la regla de tiempo arriba (compás.pulso) y los ítems de audio/MIDI de cada pista. El cursor de edición marca desde dónde se reproduce.' },
  { id: 'transport', label: 'Transporte', text: 'Reproducir, parar, grabar, repetir (loop), metrónomo, posición actual, BPM y métrica.' },
  { id: 'mcp', label: 'Mezclador (MCP)', text: 'Abajo (Ctrl+M para mostrar/ocultar): cada pista como un canal vertical con fader, medidor y botones FX, más el canal Master.' },
];

export function ReaperMap() {
  const [sel, setSel] = useState('tcp');
  const cur = ZONES.find((z) => z.id === sel)!;
  const zone = (id: string, cls: string, content?: React.ReactNode) => (
    <button onClick={() => setSel(id)} className={cx('relative rounded-lg border text-[10px] font-semibold uppercase tracking-wide transition sm:text-xs', sel === id ? 'border-teal bg-teal/15 text-teal' : 'border-ink-500 bg-ink-800 text-fog-400 hover:bg-ink-700', cls)}>
      {content ?? ZONES.find((z) => z.id === id)!.label}
    </button>
  );
  return (
    <div className="space-y-3">
      <div className="grid aspect-[16/10] grid-cols-[30%_1fr] grid-rows-[12%_1fr_12%_26%] gap-1.5 rounded-xl border border-ink-500 bg-ink-950 p-1.5" aria-label="Mapa simplificado de la ventana de REAPER">
        {zone('menu', 'col-span-2')}
        {zone('tcp', '')}
        {zone(
          'arrange',
          'overflow-hidden',
          <div className="absolute inset-0 p-2">
            <div className="mb-1 h-3 rounded bg-ink-600/80 text-left text-[8px] leading-3 text-fog-400">&nbsp;1 · 2 · 3 · 4 · 5</div>
            <div className="mb-1 ml-[5%] h-[18%] w-[40%] rounded bg-violet/40" />
            <div className="mb-1 ml-[20%] h-[18%] w-[55%] rounded bg-electric/40" />
            <div className="ml-[10%] h-[18%] w-[30%] rounded bg-teal/30" />
            <div className="absolute bottom-1 right-2">Área de arreglo</div>
          </div>,
        )}
        {zone('transport', 'col-span-2')}
        {zone('mcp', 'col-span-2')}
      </div>
      <div className="panel-inset p-3 text-sm text-fog-200 animate-fade-up" key={sel}>
        <b className="text-teal">{cur.label}:</b> {cur.text}
      </div>
      <p className="text-xs text-fog-400">Esquema simplificado: la posición exacta de cada elemento depende del tema y de tu configuración (por ejemplo, el transporte puede estar arriba o abajo).</p>
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
