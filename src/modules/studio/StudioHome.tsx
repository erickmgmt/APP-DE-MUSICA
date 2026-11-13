import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useLive } from '../../core/db/hooks';
import { createProject, listProjects } from '../../core/db/repo';
import { STAGE_IDS } from '../../content/producer/stages';
import { getGenre } from '../../content/producer/genres';
import { deepHouseSong } from '../../core/studio/song';
import { EmptyState, PageHeader } from '../../components/ui';
import { formatDate } from '../../core/id';

export function StudioHome() {
  const projects = useLive(listProjects, ['projects']);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (!projects) return null;

  const quick = async () => {
    setBusy(true);
    const p = await createProject({ name: 'Mi primera canción Deep House', genreId: 'deep-house', bpm: 122, key: { tonic: 'A', mode: 'menor' }, song: deepHouseSong() }, STAGE_IDS);
    navigate(`/estudio/${p.id}`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Estudio"
        title="Produce dentro de la app"
        subtitle="Batería, bajo, acordes, melodías, tus samples, mezcla y exportación a WAV. Todo en tu dispositivo."
        actions={
          <>
            <button className="btn-primary" onClick={quick} disabled={busy}><Sparkles size={16} /> Empezar con plantilla Deep House</button>
            <Link to="/proyectos/nuevo" className="btn-ghost"><Plus size={16} /> Canción nueva</Link>
          </>
        }
      />
      {projects.length === 0 ? (
        <EmptyState icon={<SlidersHorizontal />} title="Aún no tienes canciones" text="Empieza con la plantilla Deep House: ya suena desde el primer segundo y aprenderás modificándola pista por pista." action={<button className="btn-primary" onClick={quick} disabled={busy}><Sparkles size={16} /> Crear y abrir el estudio</button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} to={`/estudio/${p.id}`} className="panel block p-4 transition hover:-translate-y-0.5 hover:border-ink-500">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-xs text-fog-400">{getGenre(p.genreId).name} · {p.bpm} BPM{p.key ? ` · ${p.key.tonic} ${p.key.mode}` : ''}</p>
              <p className="mt-2 text-xs text-fog-300">{p.song ? `${p.song.tracks.length} pistas · ${p.song.sections.length} partes` : 'Sin canción todavía (se crea al abrir)'}</p>
              <p className="mt-1 text-[11px] text-fog-400">Actualizado {formatDate(p.updatedAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
