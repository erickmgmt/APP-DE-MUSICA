import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArchiveRestore, Bot, Database, Download, FileClock, History, RotateCcw, Shield, Trash2, Upload, Map as MapIcon, ScrollText } from 'lucide-react';
import { MODULES } from '../registry';
import { CHANGELOG, APP_VERSION } from '../../content/changelog';
import { useLive } from '../../core/db/hooks';
import {
  createRestorePoint,
  deleteRestorePoint,
  exportBackup,
  getSettings,
  importBackup,
  listActivity,
  listDeletedProjects,
  listRestorePoints,
  markBackupDone,
  parseBackup,
  restoreFromPoint,
  restoreSnapshot,
  updateSettings,
  type BackupFile,
} from '../../core/db/repo';
import { createProvider } from '../../core/ai/providers';
import { formatDate } from '../../core/id';
import { Callout, Field, PageHeader, Panel, Tabs, cx } from '../../components/ui';
import { toast } from '../../components/ui/toast';

type Tab = 'respaldo' | 'recuperar' | 'ia' | 'actividad' | 'modulos' | 'cambios';

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function BackupTab() {
  const settings = useLive(getSettings, ['settings']);
  const points = useLive(listRestorePoints, ['restorePoints']) ?? [];
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [storage, setStorage] = useState<{ usage?: number; quota?: number; persisted?: boolean }>({});

  useEffect(() => {
    void (async () => {
      const est = await navigator.storage?.estimate?.().catch(() => undefined);
      const persisted = await navigator.storage?.persisted?.().catch(() => undefined);
      setStorage({ usage: est?.usage, quota: est?.quota, persisted });
    })();
  }, [points.length]);

  const doExport = async () => {
    const b = await exportBackup();
    download(`reaper-academy-respaldo-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(b, null, 1));
    await markBackupDone();
    toast('Respaldo descargado');
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      setPending(parseBackup(await f.text()));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Archivo no válido', 'error');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const doImport = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    if (mode === 'replace' && !confirm('Reemplazar sustituirá TODOS tus datos actuales por los del archivo. Antes se creará un punto de restauración automático. ¿Continuar?')) return;
    const r = await importBackup(pending, mode);
    setPending(null);
    toast(`Importado: ${r.added} añadidos, ${r.updated} actualizados`);
  };

  const counts = pending ? Object.entries(pending.data).map(([k, v]) => `${k}: ${(v as unknown[]).length}`).join(' · ') : '';
  const daysSince = settings?.lastBackupAt ? Math.floor((Date.now() - settings.lastBackupAt) / 86400000) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={<span className="flex items-center gap-2"><Download size={16} className="text-teal" /> Exportar copia de seguridad</span>}>
        <p className="mb-3 text-sm text-fog-300">Descarga un archivo JSON con todos tus datos: proyectos (con historial), progreso, plugins, ideas, chat y ajustes. Guárdalo en otra carpeta, un USB o tu nube.</p>
        <p className="mb-3 text-xs text-fog-400">{settings?.lastBackupAt ? `Último respaldo: ${formatDate(settings.lastBackupAt)}${daysSince && daysSince > 7 ? ` (hace ${daysSince} días)` : ''}` : 'Aún no has descargado ningún respaldo.'}</p>
        <button className="btn-primary" onClick={doExport}><Download size={16} /> Descargar respaldo</button>
      </Panel>

      <Panel title={<span className="flex items-center gap-2"><Upload size={16} className="text-teal" /> Importar copia de seguridad</span>}>
        <p className="mb-3 text-sm text-fog-300">Útil para pasar tus datos del ordenador al teléfono o recuperar un respaldo.</p>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}><Upload size={16} /> Elegir archivo…</button>
        {pending && (
          <div className="mt-3 space-y-3 rounded-xl border border-violet/40 bg-violet/5 p-3">
            <p className="text-sm">Respaldo del {formatDate(pending.exportedAt)}</p>
            <p className="text-xs text-fog-400">{counts}</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary btn-sm" onClick={() => doImport('merge')}>Fusionar (recomendado)</button>
              <button className="btn-danger btn-sm" onClick={() => doImport('replace')}>Reemplazar todo</button>
              <button className="btn-ghost btn-sm" onClick={() => setPending(null)}>Cancelar</button>
            </div>
            <p className="text-xs text-fog-400">Fusionar añade lo nuevo y, si un registro existe en ambos, conserva el más reciente.</p>
          </div>
        )}
      </Panel>

      <Panel className="lg:col-span-2" title={<span className="flex items-center gap-2"><ArchiveRestore size={16} className="text-teal" /> Puntos de restauración (en este dispositivo)</span>} actions={<button className="btn-ghost btn-sm" onClick={async () => { await createRestorePoint('Manual'); toast('Punto de restauración creado'); }}>Crear ahora</button>}>
        <p className="mb-3 text-xs text-fog-400">Instantáneas completas guardadas dentro de la app (se conservan las 10 últimas). Se crea una automáticamente antes de cada importación. No sustituyen al respaldo descargado: si borras los datos del navegador, también se borran.</p>
        {points.length === 0 ? <p className="text-sm text-fog-400">Ninguno todavía.</p> : (
          <ul className="divide-y divide-ink-600">
            {points.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{p.label}</p>
                  <p className="text-[11px] text-fog-400">{formatDate(p.createdAt)} · {(p.sizeBytes / 1024).toFixed(0)} KB</p>
                </div>
                <button className="btn-ghost btn-sm" onClick={async () => { if (confirm('¿Volver a este punto? Tus datos actuales se guardarán antes en un punto nuevo.')) { await restoreFromPoint(p.id); toast('Datos restaurados'); } }}><RotateCcw size={14} /> Restaurar</button>
                <button className="btn-ghost btn-sm" onClick={() => deleteRestorePoint(p.id)} aria-label="Eliminar"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="lg:col-span-2" title={<span className="flex items-center gap-2"><Database size={16} className="text-teal" /> Almacenamiento</span>}>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="panel-inset p-3"><p className="label">Usado</p>{storage.usage !== undefined ? `${(storage.usage / 1048576).toFixed(2)} MB` : 'No disponible'}</div>
          <div className="panel-inset p-3"><p className="label">Disponible para el sitio</p>{storage.quota !== undefined ? `${(storage.quota / 1048576).toFixed(0)} MB` : 'No disponible'}</div>
          <div className="panel-inset p-3"><p className="label">Almacenamiento persistente</p>{storage.persisted === undefined ? 'No disponible' : storage.persisted ? 'Concedido ✓' : 'No concedido (instala la app como PWA para mejorarlo)'}</div>
        </div>
      </Panel>
    </div>
  );
}

function RecoverTab() {
  const deleted = useLive(listDeletedProjects, ['snapshots', 'projects']) ?? [];
  return (
    <Panel title={<span className="flex items-center gap-2"><History size={16} className="text-teal" /> Proyectos eliminados</span>}>
      <p className="mb-3 text-xs text-fog-400">Al eliminar un proyecto se conserva su historial. Desde aquí puedes recuperarlo con su última versión.</p>
      {deleted.length === 0 ? <p className="text-sm text-fog-400">No hay proyectos eliminados.</p> : (
        <ul className="divide-y divide-ink-600">
          {deleted.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{s.data.name}</p>
                <p className="text-[11px] text-fog-400">Última versión: {formatDate(s.createdAt)}</p>
              </div>
              <button className="btn-ghost btn-sm" onClick={async () => { await restoreSnapshot(s.id); toast('Proyecto recuperado'); }}><RotateCcw size={14} /> Recuperar</button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function AiTab() {
  const settings = useLive(getSettings, ['settings']);
  const [form, setForm] = useState<{ baseUrl: string; model: string } | null>(null);
  const [test, setTest] = useState<string | null>(null);
  useEffect(() => { if (settings && !form) setForm({ baseUrl: settings.ai.baseUrl, model: settings.ai.model }); }, [settings, form]);
  if (!settings || !form) return null;
  const enabled = settings.ai.provider === 'openai-compatible';

  const save = async () => {
    await updateSettings({ ai: { ...settings.ai, provider: form.baseUrl && form.model ? 'openai-compatible' : 'none', baseUrl: form.baseUrl.trim(), model: form.model.trim() } });
    toast('Ajustes de IA guardados');
  };
  const runTest = async () => {
    setTest('Probando…');
    const p = createProvider({ ...settings.ai, provider: 'openai-compatible', baseUrl: form.baseUrl.trim(), model: form.model.trim() });
    if (!p) return setTest('Completa la URL y el modelo.');
    try {
      const r = await p.chat([{ role: 'user', content: 'Responde solo con la palabra: OK' }]);
      setTest(`Conexión correcta. Respuesta: ${r.slice(0, 80)}`);
    } catch (e) {
      setTest(`Error: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Panel title={<span className="flex items-center gap-2"><Bot size={16} className="text-teal" /> Proveedor de IA (opcional)</span>}>
        <div className="mb-4"><Callout tone="ok">La app funciona completa sin IA: el Profesor usa su base de conocimiento offline.</Callout></div>
        <div className="grid gap-3">
          <Field label="URL base del servidor compatible con OpenAI" hint="Ej.: http://localhost:3001/v1 (tu proxy), http://IP-de-otro-PC:11434/v1 (Ollama). Debe aceptar peticiones desde el navegador (CORS).">
            <input className="input font-mono" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="https://mi-proxy.ejemplo.workers.dev/v1" />
          </Field>
          <Field label="Modelo" hint="El nombre exacto que acepta tu servidor.">
            <input className="input font-mono" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.ai.shareContext} onChange={(e) => updateSettings({ ai: { ...settings.ai, shareContext: e.target.checked } })} />
            Enviar contexto (género, BPM, tonalidad del último proyecto y nombres de tus plugins). Nunca se envía audio.
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={save}>Guardar</button>
            <button className="btn-ghost" onClick={runTest}>Probar conexión</button>
            {enabled && <button className="btn-ghost" onClick={() => { setForm({ baseUrl: '', model: '' }); void updateSettings({ ai: { ...settings.ai, provider: 'none', baseUrl: '', model: '' } }); }}>Desconectar</button>}
          </div>
          {test && <p className="text-sm text-fog-300">{test}</p>}
        </div>
      </Panel>
      <Panel title={<span className="flex items-center gap-2"><Shield size={16} className="text-teal" /> Seguridad de las API keys</span>}>
        <ul className="list-disc space-y-2 pl-5 text-sm text-fog-300">
          <li>Esta app <b>no tiene campo para API keys</b> y nunca las guarda.</li>
          <li>La key vive en tu servidor (proxy), que es quien llama al proveedor de IA.</li>
          <li>Solo se envía tu pregunta (y el contexto si lo activas), y solo cuando pulsas "Preguntar a la IA".</li>
          <li>Guía y ejemplo de proxy: <code className="text-fog-200">docs/IA.md</code> en el repositorio.</li>
        </ul>
      </Panel>
    </div>
  );
}

function ActivityTab() {
  const items = useLive(() => listActivity(200), ['activity']) ?? [];
  return (
    <Panel title={<span className="flex items-center gap-2"><FileClock size={16} className="text-teal" /> Registro de actividad</span>}>
      {items.length === 0 ? <p className="text-sm text-fog-400">Sin actividad todavía.</p> : (
        <ul className="divide-y divide-ink-600">
          {items.map((a) => (
            <li key={a.id} className="flex gap-3 py-2 text-sm">
              <span className="w-36 shrink-0 text-xs text-fog-400">{formatDate(a.at)}</span>
              <span className="chip h-fit text-[10px]">{a.kind}</span>
              <span className="min-w-0 text-fog-200">{a.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ModulesTab() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {MODULES.map((m) => (
        <div key={m.id} className={cx('panel p-4', m.status === 'planeado' && 'border-dashed opacity-80')}>
          <div className="mb-2 flex items-center justify-between">
            <m.icon size={20} className={m.status === 'activo' ? 'text-violet-soft' : 'text-fog-400'} />
            <span className={cx('chip text-[10px]', m.status === 'activo' ? 'border-teal/50 text-teal' : 'border-amber/50 text-amber')}>{m.status === 'activo' ? 'Activo' : 'Siguiente fase'}</span>
          </div>
          <p className="font-semibold">{m.title}</p>
          <p className="mt-1 text-sm text-fog-400">{m.description}</p>
        </div>
      ))}
    </div>
  );
}

function ChangesTab() {
  return (
    <div className="space-y-3">
      {CHANGELOG.map((c) => (
        <Panel key={c.version} title={<span>v{c.version} — {c.title} <span className="font-normal text-fog-400">({c.date})</span></span>}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fog-200">{c.changes.map((x) => <li key={x}>{x}</li>)}</ul>
        </Panel>
      ))}
    </div>
  );
}

export default function SystemPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'respaldo';
  return (
    <>
      <PageHeader eyebrow={`Sistema · v${APP_VERSION}`} title="Datos, IA y evolución" subtitle="Tus datos se guardan solo en este dispositivo (IndexedDB). Ningún archivo ni dato sale de aquí salvo que tú lo exportes o uses la IA." />
      <Tabs<Tab>
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        tabs={[
          { id: 'respaldo', label: 'Copias de seguridad' },
          { id: 'recuperar', label: 'Proyectos eliminados' },
          { id: 'ia', label: 'IA' },
          { id: 'actividad', label: 'Actividad' },
          { id: 'modulos', label: <span className="flex items-center gap-1.5"><MapIcon size={14} /> Módulos</span> },
          { id: 'cambios', label: <span className="flex items-center gap-1.5"><ScrollText size={14} /> Cambios</span> },
        ]}
      />
      {tab === 'respaldo' && <BackupTab />}
      {tab === 'recuperar' && <RecoverTab />}
      {tab === 'ia' && <AiTab />}
      {tab === 'actividad' && <ActivityTab />}
      {tab === 'modulos' && <ModulesTab />}
      {tab === 'cambios' && <ChangesTab />}
    </>
  );
}
