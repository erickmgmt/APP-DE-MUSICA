import { useRef, useState } from 'react';
import { Play, Trash2, Upload } from 'lucide-react';
import { INSTRUMENTS, type Instrument } from '../../core/studio/instruments';
import { useLive } from '../../core/db/hooks';
import { deleteSample, getSample, listSamples, saveSample, MAX_SAMPLE_BYTES } from '../../core/db/repo';
import { decodeSample, sampleBuffers } from '../../core/studio/player';
import { getAudio } from '../../core/audio/engine';
import { Modal, Tabs, cx } from '../../components/ui';
import { toast } from '../../components/ui/toast';

export type Pick = { type: 'instrument'; instrument: Instrument } | { type: 'sample'; sampleId: string; name: string };

function previewInstrument(i: Instrument) {
  const { master } = getAudio();
  const base = i.range ? Math.round((i.range[0] + i.range[1]) / 2 / 12) * 12 - 3 : 60; // una La en su registro
  i.play({ dest: master, time: getAudio().ctx.currentTime + 0.01, midi: i.kind === 'drum' ? 60 : base, duration: i.group === 'Pads' ? 1.2 : 0.35, velocity: 0.9 });
}

async function previewSample(id: string) {
  const buf = sampleBuffers.get(id);
  if (!buf) return;
  const { ctx, master } = getAudio();
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(master);
  src.start();
  src.stop(ctx.currentTime + Math.min(buf.duration, 4));
}

/** Elegir un sonido: instrumentos incluidos (baterías y sintes) o tus samples. */
type Kind = 'drum' | 'synth' | 'sample';

export function SoundPicker({ open, onClose, onPick, kinds = ['drum', 'synth', 'sample'], title }: { open: boolean; onClose: () => void; onPick: (p: Pick) => void; kinds?: Kind[]; title: string }) {
  const [tab, setTab] = useState<Kind>(kinds[0]);
  const samples = useLive(listSamples, ['samples']) ?? [];
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of [...files]) {
      try {
        if (f.size > MAX_SAMPLE_BYTES) throw new Error(`${f.name}: supera 15 MB`);
        const data = await f.arrayBuffer();
        // Comprobamos que el navegador puede leer el audio antes de guardarlo
        const buf = await getAudio().ctx.decodeAudioData(data.slice(0));
        const s = await saveSample({ name: f.name.replace(/\.[^.]+$/, ''), mime: f.type || 'audio', size: f.size, duration: buf.duration, data });
        sampleBuffers.set(s.id, buf);
        toast(`Sample añadido: ${s.name}`);
      } catch (e) {
        toast(e instanceof Error && e.message.includes('15 MB') ? e.message : `${f.name}: formato de audio no compatible`, 'error');
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const groups = (kind: 'drum' | 'synth') => {
    const list = INSTRUMENTS.filter((i) => i.kind === kind);
    return [...new Set(list.map((i) => i.group))].map((g) => ({ g, items: list.filter((i) => i.group === g) }));
  };

  const LABELS: Record<Kind, string> = { drum: 'Batería', synth: 'Instrumentos', sample: 'Mis samples' };
  const tabs = kinds.map((k) => ({ id: k, label: LABELS[k] }));

  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      {tabs.length > 1 && <Tabs value={tab} onChange={setTab} tabs={tabs} />}
      {tab === 'drum' || tab === 'synth' ? (
        <div className="space-y-4">
          <p className="text-xs text-fog-400">Sonidos incluidos en la app: se generan en tu dispositivo (síntesis), funcionan sin internet y pesan muy poco. Toca ▶ para escuchar.</p>
          {groups(tab).map(({ g, items }) => (
            <div key={g}>
              <p className="label">{g}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((i) => (
                  <div key={i.id} className="panel-inset flex items-center gap-2 p-2.5">
                    <button className="btn-ghost btn-sm" onClick={() => previewInstrument(i)} aria-label={`Escuchar ${i.name}`}>
                      <Play size={14} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{i.name}</p>
                      <p className="truncate text-[11px] text-fog-400">{i.description}</p>
                    </div>
                    <button className="btn-primary btn-sm" onClick={() => onPick({ type: 'instrument', instrument: i })}>
                      Usar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-fog-400">Tus archivos de audio (kicks, voces, loops…). Se guardan solo en este dispositivo y se incluyen en la copia de seguridad descargada. Máximo 15 MB por archivo; formatos habituales: WAV, MP3, OGG, M4A (según el navegador).</p>
          <input ref={fileRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          <button className="btn-primary" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> {busy ? 'Cargando…' : 'Subir audio desde el dispositivo'}
          </button>
          {samples.length === 0 && <p className="text-sm text-fog-400">Aún no tienes samples.</p>}
          <div className="grid gap-2">
            {samples.map((s) => (
              <div key={s.id} className="panel-inset flex items-center gap-2 p-2.5">
                <button
                  className="btn-ghost btn-sm"
                  onClick={async () => {
                    if (!sampleBuffers.has(s.id)) {
                      const full = await getSample(s.id);
                      if (full) await decodeSample(s.id, full.data);
                    }
                    void previewSample(s.id);
                  }}
                  aria-label={`Escuchar ${s.name}`}
                >
                  <Play size={14} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="text-[11px] text-fog-400">{s.duration.toFixed(2)} s · {(s.size / 1024).toFixed(0)} KB</p>
                </div>
                <button className="btn-ghost btn-sm" onClick={() => confirm(`¿Eliminar el sample "${s.name}"? Las pistas que lo usen quedarán en silencio.`) && deleteSample(s.id)} aria-label="Eliminar sample">
                  <Trash2 size={14} />
                </button>
                <button className="btn-primary btn-sm" onClick={() => onPick({ type: 'sample', sampleId: s.id, name: s.name })}>
                  Usar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className={cx('mt-4 text-[11px] text-fog-400')}>Los sonidos incluidos son síntesis propia de la app pensada para aprender; tus samples pueden darle un acabado más profesional.</p>
    </Modal>
  );
}
