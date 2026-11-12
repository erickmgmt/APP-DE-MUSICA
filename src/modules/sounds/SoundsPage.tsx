import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Search, Sparkles } from 'lucide-react';
import { SOUNDS, SOUND_CATEGORIES, type PreviewKind, type SoundEntry } from '../../content/sounds/library';
import { searchSounds } from '../../core/search/soundSearch';
import { playBass, playClap, playHat, playKeys, playKick, playPad, playPluck, playRim, playRiser, playShaker, playTone } from '../../core/audio/engine';
import { midiToFreq } from '../../core/music/theory';
import { FreqBar } from '../../components/audio/Diagrams';
import { Modal, PageHeader, Panel, cx } from '../../components/ui';

export function previewSound(kind: PreviewKind): void {
  const a = midiToFreq(57); // A3
  switch (kind) {
    case 'kick': return playKick();
    case 'clap': return playClap();
    case 'hat': return playHat(undefined, false);
    case 'ohat': return playHat(undefined, true);
    case 'shaker': return playShaker(undefined, 0.15);
    case 'rim': return playRim();
    case 'bass': return playBass(midiToFreq(33), 0.6);
    case 'pad': return playPad([a, midiToFreq(60), midiToFreq(64), midiToFreq(67)], 2);
    case 'pluck': [57, 60, 64, 67].forEach((m, i) => window.setTimeout(() => playPluck(midiToFreq(m + 12)), i * 160)); return;
    case 'keys': [57, 60, 64, 67].forEach((m) => playKeys(midiToFreq(m), 0.9, undefined, 0.09)); return;
    case 'riser': return playRiser(2);
    case 'lead': return playTone(midiToFreq(69), 0.5, undefined, { type: 'sawtooth', gain: 0.12, cutoff: 3000 });
  }
}

function SoundCard({ s, onOpen, reasons }: { s: SoundEntry; onOpen: () => void; reasons?: string[] }) {
  const cat = SOUND_CATEGORIES.find((c) => c.id === s.category)!;
  return (
    <div className="panel flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-teal">{cat.name}</p>
          <p className="font-semibold">{s.name}</p>
        </div>
        {s.preview && (
          <button className="btn-ghost btn-sm" onClick={() => previewSound(s.preview!)} aria-label={`Escuchar ${s.name}`} title="Escuchar aproximación sintetizada">
            <Play size={14} />
          </button>
        )}
      </div>
      <p className="text-sm text-fog-300">{s.purpose}</p>
      <FreqBar low={s.freq.low} high={s.freq.high} compact />
      {reasons && reasons.length > 0 && <p className="text-[11px] text-violet-soft">{reasons.join(' · ')}</p>}
      <button className="btn-ghost btn-sm mt-auto self-start" onClick={onOpen}>Ver ficha completa</button>
    </div>
  );
}

function Detail({ s }: { s: SoundEntry }) {
  const rows: [string, React.ReactNode][] = [
    ['Qué es', s.what],
    ['Para qué sirve', s.purpose],
    ['Géneros', s.genres.join(', ')],
    ['Parte de la canción', s.sections.join(', ')],
    ['Combina con', s.combines.join(' · ')],
  ];
  return (
    <div className="space-y-4">
      {s.preview && (
        <button className="btn-primary" onClick={() => previewSound(s.preview!)}>
          <Play size={16} /> Escuchar aproximación
        </button>
      )}
      <dl className="grid gap-3">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="label">{k}</dt>
            <dd className="text-sm text-fog-200">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="label">Frecuencias que suele ocupar</p>
        <FreqBar low={s.freq.low} high={s.freq.high} />
        <p className="mt-1 text-xs text-fog-300">{s.freq.focus}. Zonas orientativas: cada sample es distinto; compruébalo con un analizador.</p>
      </div>
      <div>
        <p className="label">Cómo procesarlo</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-fog-200">
          {s.processing.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
      {s.deepHouse && (
        <div className="rounded-xl border border-violet/30 bg-violet/5 p-3 text-sm">
          <b className="text-violet-soft">En Deep House:</b> {s.deepHouse}
        </div>
      )}
      {s.preview && <p className="text-xs text-fog-400">El ejemplo es una síntesis aproximada generada por la app para que reconozcas el tipo de sonido; no representa la calidad de un sample profesional.</p>}
    </div>
  );
}

const EXAMPLES = ['Necesito un sonido atmosférico para el fondo de mi canción', 'Algo con groove orgánico', 'Tensión antes del drop', 'Acordes cálidos tipo jazz', 'Peso grave para deep house'];

export default function SoundsPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const cat = params.get('cat');
  const [open, setOpen] = useState<SoundEntry | null>(null);
  const outcome = useMemo(() => (q.trim() ? searchSounds(q) : null), [q]);

  const setCat = (id: string | null) => setParams((p) => { if (id) p.set('cat', id); else p.delete('cat'); return p; }, { replace: true });
  const groups = [...new Set(SOUND_CATEGORIES.map((c) => c.group))];
  const list = cat ? SOUNDS.filter((s) => s.category === cat) : SOUNDS;

  return (
    <>
      <PageHeader eyebrow="Biblioteca inteligente" title="Sonidos" subtitle="Qué es cada tipo de sonido, para qué sirve, dónde se usa, qué frecuencias ocupa y cómo procesarlo." />

      <Panel className="mb-5">
        <label className="label" htmlFor="sound-q">Describe lo que necesitas</label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fog-400" />
          <input id="sound-q" className="input pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: necesito un sonido atmosférico para el fondo de mi canción" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button key={e} className="chip hover:border-violet hover:text-fog-100" onClick={() => setQ(e)}>{e}</button>
          ))}
        </div>
        {outcome && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Sparkles size={16} className="text-violet-soft" />
            {outcome.detected.length || outcome.genre ? (
              <>
                <span className="text-fog-300">Entendí que buscas:</span>
                {outcome.detected.map((d) => <span key={d} className="chip border-violet/50 text-violet-soft">{d}</span>)}
                {outcome.genre && <span className="chip border-teal/50 text-teal">{outcome.genre}</span>}
              </>
            ) : (
              <span className="text-fog-300">No reconocí una intención concreta; busco por palabras.</span>
            )}
          </div>
        )}
      </Panel>

      {outcome ? (
        <>
          <h2 className="mb-3 text-sm font-semibold text-fog-300">{outcome.results.length ? `Alternativas recomendadas (${outcome.results.length})` : 'Sin resultados. Prueba a describirlo de otra forma o explora por categorías.'}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {outcome.results.map((r) => <SoundCard key={r.sound.id} s={r.sound} reasons={r.reasons} onOpen={() => setOpen(r.sound)} />)}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 space-y-2">
            <button className={cx('chip', !cat && 'border-violet text-fog-100')} onClick={() => setCat(null)}>Todos</button>
            {groups.map((g) => (
              <div key={g} className="flex flex-wrap items-center gap-1.5">
                <span className="w-36 text-[11px] uppercase tracking-wider text-fog-400">{g}</span>
                {SOUND_CATEGORIES.filter((c) => c.group === g).map((c) => (
                  <button key={c.id} className={cx('chip', cat === c.id && 'border-violet bg-violet/15 text-fog-100')} onClick={() => setCat(c.id)}>
                    {c.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => <SoundCard key={s.id} s={s} onOpen={() => setOpen(s)} />)}
          </div>
        </>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''} wide>
        {open && <Detail s={open} />}
      </Modal>
    </>
  );
}
