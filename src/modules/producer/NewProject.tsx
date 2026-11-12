import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GENRES, getGenre } from '../../content/producer/genres';
import { STAGE_IDS } from '../../content/producer/stages';
import { createProject, emptyStage } from '../../core/db/repo';
import { NOTES_EN, NOTES_ES } from '../../core/music/theory';
import { Callout, Field, PageHeader, Panel, cx } from '../../components/ui';
import type { MusicalKey } from '../../core/types';
import { uid } from '../../core/id';

export function NewProject() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [genreId, setGenreId] = useState('deep-house');
  const genre = getGenre(genreId);
  const [bpm, setBpm] = useState(genre.defaultBpm);
  const [key, setKey] = useState<MusicalKey | null>(genre.defaultKey ?? null);
  const [idea, setIdea] = useState('');
  const [ref, setRef] = useState({ title: '', artist: '' });
  const [busy, setBusy] = useState(false);

  const pickGenre = (id: string) => {
    const g = getGenre(id);
    setGenreId(id);
    setBpm(g.defaultBpm);
    if (g.defaultKey) setKey(g.defaultKey);
  };

  const create = async () => {
    setBusy(true);
    const stages = Object.fromEntries(STAGE_IDS.map((s) => [s, emptyStage()]));
    const p = await createProject(
      {
        name: name.trim() || 'Mi canción',
        genreId,
        bpm,
        key,
        idea: idea.trim(),
        references: ref.title.trim() ? [{ id: uid('ref'), title: ref.title.trim(), artist: ref.artist.trim(), notes: '' }] : [],
        stages,
      },
      STAGE_IDS,
    );
    navigate(`/proyectos/${p.id}`);
  };

  return (
    <>
      <PageHeader eyebrow="Nueva canción" title="Empecemos tu proyecto" subtitle="Nada de esto es definitivo: podrás cambiarlo todo después desde la ficha del proyecto." actions={<Link to="/proyectos" className="btn-ghost btn-sm"><ArrowLeft size={14} /> Proyectos</Link>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Panel title="1 · Nombre e idea">
            <div className="grid gap-3">
              <Field label="Nombre provisional">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="p. ej. Luces de medianoche" autoFocus />
              </Field>
              <Field label="Idea musical (opcional)" hint="Describe la emoción o la imagen. Ej.: viaje nocturno en coche junto al mar.">
                <textarea className="input min-h-20" value={idea} onChange={(e) => setIdea(e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="2 · Género">
            <div className="grid gap-2 sm:grid-cols-3">
              {GENRES.map((g) => (
                <button key={g.id} onClick={() => pickGenre(g.id)} className={cx('rounded-xl border p-3 text-left transition', genreId === g.id ? 'border-violet bg-violet/10' : 'border-ink-600 bg-ink-850 hover:border-ink-500')}>
                  <p className="text-sm font-semibold">{g.name}</p>
                  <p className="text-[11px] text-fog-400">
                    {g.bpm[0]}–{g.bpm[1]} BPM · {g.route === 'completa' ? 'Ruta completa' : 'Ruta básica'}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-fog-300">{genre.description}</p>
            {genre.route === 'basica' && (
              <div className="mt-3">
                <Callout tone="info">Para {genre.name} la ruta usa recomendaciones generales. La ruta específica de este género se añadirá en una próxima versión (puedes pedirla en Ideas y mejoras).</Callout>
              </div>
            )}
          </Panel>

          <Panel title="3 · Tempo y tonalidad">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`BPM: ${bpm}`} hint={`Rango habitual de ${genre.name}: ${genre.bpm[0]}–${genre.bpm[1]} BPM`}>
                <input type="range" min={60} max={180} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full" />
              </Field>
              <Field label="Tonalidad">
                <div className="flex gap-2">
                  <select className="input" value={key?.tonic ?? ''} onChange={(e) => setKey(e.target.value ? { tonic: e.target.value, mode: key?.mode ?? 'menor' } : null)}>
                    <option value="">Aún no sé</option>
                    {NOTES_EN.map((n, i) => (
                      <option key={n} value={n}>{n} ({NOTES_ES[i]})</option>
                    ))}
                  </select>
                  <select className="input" value={key?.mode ?? 'menor'} disabled={!key} onChange={(e) => key && setKey({ ...key, mode: e.target.value as 'mayor' | 'menor' })}>
                    <option value="menor">menor</option>
                    <option value="mayor">mayor</option>
                  </select>
                </div>
              </Field>
            </div>
          </Panel>

          <Panel title="4 · Una canción de referencia (opcional)">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Título">
                <input className="input" value={ref.title} onChange={(e) => setRef({ ...ref, title: e.target.value })} />
              </Field>
              <Field label="Artista">
                <input className="input" value={ref.artist} onChange={(e) => setRef({ ...ref, artist: e.target.value })} />
              </Field>
            </div>
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <Panel title={<span className="flex items-center gap-2"><Sparkles size={16} className="text-violet-soft" /> Rasgos de {genre.name}</span>}>
            <ul className="space-y-1.5 text-sm text-fog-200">
              {genre.traits.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {t}
                </li>
              ))}
            </ul>
          </Panel>
          <button className="btn-primary w-full py-3" onClick={create} disabled={busy}>
            Crear proyecto y empezar
          </button>
        </aside>
      </div>
    </>
  );
}
