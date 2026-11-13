import { Link } from 'react-router-dom';
import { Play, Plus, Trash2 } from 'lucide-react';
import { GENRES } from '../../content/producer/genres';
import { NOTES_EN, NOTES_ES } from '../../core/music/theory';
import { getInstrument } from '../../core/studio/instruments';
import { uid } from '../../core/id';
import type { Project, Reference } from '../../core/types';
import { Field, Panel } from '../../components/ui';
import { SaveInput, SaveTextarea } from '../../components/SaveFields';

type Update = (fn: (p: Project) => Project, reason?: string) => Promise<void>;

function RowDelete({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn-ghost btn-sm shrink-0" onClick={onClick} aria-label="Eliminar">
      <Trash2 size={14} />
    </button>
  );
}

export function ProjectSheet({ project, update }: { project: Project; update: Update }) {

  const set = <K extends keyof Project>(k: K, v: Project[K], reason = 'Ficha del proyecto') => update((p) => ({ ...p, [k]: v }), reason);

  const patchRef = (id: string, patch: Partial<Reference>) => set('references', project.references.map((r) => (r.id === id ? { ...r, ...patch } : r)), 'Referencias');


  return (
    <div className="space-y-4">
      <Panel title="Datos básicos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre">
            <SaveInput value={project.name} onSave={(v) => set('name', v.trim() || 'Mi canción', 'Renombrar')} />
          </Field>
          <Field label="Género">
            <select className="input" value={project.genreId} onChange={(e) => set('genreId', e.target.value, 'Cambio de género')}>
              {GENRES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label="BPM">
            <SaveInput type="number" min={40} max={240} value={String(project.bpm)} onSave={(v) => { const n = Math.round(+v); if (n >= 40 && n <= 240) set('bpm', n, 'Cambio de BPM'); }} />
          </Field>
          <Field label="Tonalidad">
            <div className="flex gap-2">
              <select className="input" value={project.key?.tonic ?? ''} onChange={(e) => set('key', e.target.value ? { tonic: e.target.value, mode: project.key?.mode ?? 'menor' } : null, 'Cambio de tonalidad')}>
                <option value="">Sin definir</option>
                {NOTES_EN.map((n, i) => <option key={n} value={n}>{n} ({NOTES_ES[i]})</option>)}
              </select>
              <select className="input" disabled={!project.key} value={project.key?.mode ?? 'menor'} onChange={(e) => project.key && set('key', { ...project.key, mode: e.target.value as 'mayor' | 'menor' }, 'Cambio de tonalidad')}>
                <option value="menor">menor</option>
                <option value="mayor">mayor</option>
              </select>
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Idea musical">
              <SaveTextarea value={project.idea} onSave={(v) => set('idea', v, 'Idea')} placeholder="La emoción o imagen de la canción" className="min-h-16" />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Referencias musicales" actions={<button className="btn-ghost btn-sm" onClick={() => set('references', [...project.references, { id: uid('ref'), title: '', artist: '', notes: '' }], 'Referencias')}><Plus size={14} /> Añadir</button>}>
        {project.references.length === 0 && <p className="text-sm text-fog-400">Añade canciones que quieras usar como modelo.</p>}
        <div className="space-y-2">
          {project.references.map((r) => (
            <div key={r.id} className="panel-inset grid gap-2 p-2.5 sm:grid-cols-[1fr_1fr_2fr_auto]">
              <SaveInput value={r.title} placeholder="Título" onSave={(title) => patchRef(r.id, { title })} />
              <SaveInput value={r.artist} placeholder="Artista" onSave={(artist) => patchRef(r.id, { artist })} />
              <SaveInput value={r.notes} placeholder="Qué te gusta de ella (kick, groove, mezcla…)" onSave={(notes) => patchRef(r.id, { notes })} />
              <RowDelete onClick={() => set('references', project.references.filter((x) => x.id !== r.id), 'Referencias')} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Pistas de tu canción (Estudio)" actions={<Link to={`/estudio/${project.id}`} className="btn-primary btn-sm"><Play size={14} /> Abrir estudio</Link>}>
        {!project.song?.tracks.length ? (
          <p className="text-sm text-fog-400">Aún no hay pistas. Abre el estudio para crear tu canción.</p>
        ) : (
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {project.song.tracks.map((t) => (
              <li key={t.id} className="panel-inset flex items-center gap-2 p-2 text-sm">
                <span className="h-5 w-1.5 rounded-full" style={{ background: t.color }} />
                <span className="flex-1 truncate font-medium">{t.name}</span>
                <span className="truncate text-xs text-fog-400">{t.kind === 'sample' ? 'Sample propio' : getInstrument(t.instrument)?.name}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Notas personales">
        <SaveTextarea value={project.notes} onSave={(v) => set('notes', v, 'Notas')} placeholder="Todo lo que quieras recordar de esta canción" />
      </Panel>
    </div>
  );
}
