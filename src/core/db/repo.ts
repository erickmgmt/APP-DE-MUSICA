import { BACKUP_STORES, DB_VERSION, emitChange, getDB, type StoreName } from './database';
import { uid } from '../id';
import type {
  ActivityEntry,
  ChatMessage,
  Idea,
  LessonProgress,
  Project,
  ProjectSnapshot,
  RestorePoint,
  Settings,
  StageState,
  UserPlugin,
} from '../types';

// =====================================================================
// Ajustes
// =====================================================================
export const DEFAULT_SETTINGS: Settings = {
  id: 'main',
  displayName: '',
  includeReaperStock: true,
  ai: { provider: 'none', baseUrl: '', model: '', shareContext: true },
  lastBackupAt: null,
  onboardingDone: false,
};

/** Rellena campos que falten (datos guardados por versiones anteriores de la app). */
function normalizeSettings(s: Partial<Settings> | undefined): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    id: 'main',
    ai: { ...DEFAULT_SETTINGS.ai, ...(s?.ai ?? {}) },
  };
}

export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  return normalizeSettings(await db.get('settings', 'main'));
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const db = await getDB();
  const current = normalizeSettings(await db.get('settings', 'main'));
  const next = normalizeSettings({ ...current, ...patch, ai: { ...current.ai, ...(patch.ai ?? {}) } });
  await db.put('settings', next);
  emitChange('settings');
  return next;
}

// =====================================================================
// Actividad (registro de cambios de tus datos)
// =====================================================================
const ACTIVITY_LIMIT = 500;

export async function logActivity(kind: string, text: string): Promise<void> {
  const db = await getDB();
  const entry: ActivityEntry = { id: uid('act'), at: Date.now(), kind, text };
  await db.put('activity', entry);
  const count = await db.count('activity');
  if (count > ACTIVITY_LIMIT) {
    const tx = db.transaction('activity', 'readwrite');
    let cursor = await tx.store.index('byAt').openCursor();
    let toDelete = count - ACTIVITY_LIMIT;
    while (cursor && toDelete > 0) {
      await cursor.delete();
      toDelete--;
      cursor = await cursor.continue();
    }
    await tx.done;
  }
  emitChange('activity');
}

export async function listActivity(limit = 50): Promise<ActivityEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('activity', 'byAt');
  return all.reverse().slice(0, limit);
}

// =====================================================================
// Proyectos + historial de versiones
// =====================================================================
const SNAPSHOT_LIMIT_PER_PROJECT = 100;
const SNAPSHOT_COALESCE_MS = 3 * 60 * 1000;

export function emptyStage(): StageState {
  return { status: 'pendiente', checklist: {}, notes: '' };
}

export function normalizeProject(p: Partial<Project> & { id: string }): Project {
  const now = Date.now();
  return {
    name: 'Proyecto sin nombre',
    genreId: 'deep-house',
    bpm: 122,
    key: null,
    idea: '',
    references: [],
    instruments: [],
    pluginsUsed: [],
    fxChains: [],
    stages: {},
    notes: '',
    problems: [],
    milestones: [],
    archived: false,
    createdAt: now,
    updatedAt: now,
    ...p,
  };
}

export async function createProject(
  data: Partial<Project>,
  stageIds: string[],
): Promise<Project> {
  const stages: Record<string, StageState> = {};
  stageIds.forEach((id) => (stages[id] = emptyStage()));
  const project = normalizeProject({ ...data, id: uid('prj'), stages: { ...stages, ...(data.stages ?? {}) } });
  const db = await getDB();
  await db.put('projects', project);
  await addSnapshot(project, 'Proyecto creado');
  await logActivity('project', `Proyecto creado: ${project.name}`);
  emitChange('projects');
  return project;
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  const p = await db.get('projects', id);
  return p ? normalizeProject(p) : undefined;
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDB();
  const all = await db.getAll('projects');
  return all.map(normalizeProject).sort((a, b) => b.updatedAt - a.updatedAt);
}

async function addSnapshot(project: Project, reason: string): Promise<void> {
  const db = await getDB();
  const snap: ProjectSnapshot = {
    id: uid('snap'),
    projectId: project.id,
    createdAt: Date.now(),
    reason,
    data: structuredClone(project),
  };
  await db.put('snapshots', snap);
  const all = await db.getAllFromIndex('snapshots', 'byProject', project.id);
  if (all.length > SNAPSHOT_LIMIT_PER_PROJECT) {
    all.sort((a, b) => a.createdAt - b.createdAt);
    const excess = all.slice(0, all.length - SNAPSHOT_LIMIT_PER_PROJECT);
    const tx = db.transaction('snapshots', 'readwrite');
    await Promise.all(excess.map((s) => tx.store.delete(s.id)));
    await tx.done;
  }
  emitChange('snapshots');
}

/**
 * Guarda un proyecto. Antes de sobrescribir, la versión ANTERIOR queda en el historial.
 * - 'auto': agrupa ediciones seguidas (máx. una instantánea cada 3 min por motivo).
 * - 'force': siempre crea instantánea (p.ej. "Etapa completada").
 */
export async function saveProject(
  project: Project,
  reason = 'Edición',
  snapshot: 'auto' | 'force' | 'none' = 'auto',
): Promise<Project> {
  const db = await getDB();
  const previous = await db.get('projects', project.id);
  const next: Project = { ...project, updatedAt: Date.now() };
  if (previous && snapshot !== 'none') {
    let take = snapshot === 'force';
    if (!take) {
      const snaps = await db.getAllFromIndex('snapshots', 'byProject', project.id);
      const last = snaps.sort((a, b) => b.createdAt - a.createdAt)[0];
      take = !last || Date.now() - last.createdAt > SNAPSHOT_COALESCE_MS || last.reason !== reason;
    }
    if (take) await addSnapshot(normalizeProject(previous), reason);
  }
  await db.put('projects', next);
  emitChange('projects');
  return next;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  const p = await db.get('projects', id);
  // Las instantáneas se conservan deliberadamente: permiten recuperar un proyecto borrado.
  if (p) await addSnapshot(normalizeProject(p), 'Antes de eliminar');
  await db.delete('projects', id);
  await logActivity('project', `Proyecto eliminado: ${p?.name ?? id} (recuperable desde Sistema › Historial)`);
  emitChange('projects');
}

export async function listSnapshots(projectId: string): Promise<ProjectSnapshot[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('snapshots', 'byProject', projectId);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/** Proyectos eliminados que todavía tienen instantáneas (recuperables). */
export async function listDeletedProjects(): Promise<ProjectSnapshot[]> {
  const db = await getDB();
  const [snaps, projects] = await Promise.all([db.getAll('snapshots'), db.getAllKeys('projects')]);
  const alive = new Set(projects);
  const latest = new Map<string, ProjectSnapshot>();
  for (const s of snaps) {
    if (alive.has(s.projectId)) continue;
    const cur = latest.get(s.projectId);
    if (!cur || s.createdAt > cur.createdAt) latest.set(s.projectId, s);
  }
  return [...latest.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export async function restoreSnapshot(snapshotId: string): Promise<Project> {
  const db = await getDB();
  const snap = await db.get('snapshots', snapshotId);
  if (!snap) throw new Error('La versión no existe.');
  const current = await db.get('projects', snap.projectId);
  if (current) await addSnapshot(normalizeProject(current), 'Antes de restaurar una versión');
  const restored = normalizeProject({ ...structuredClone(snap.data), updatedAt: Date.now() });
  await db.put('projects', restored);
  await logActivity('project', `Versión restaurada de "${restored.name}" (${new Date(snap.createdAt).toLocaleString('es')})`);
  emitChange('projects');
  return restored;
}

// =====================================================================
// Progreso de la academia
// =====================================================================
export function emptyProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    started: false,
    exerciseDone: false,
    checks: {},
    quizBest: 0,
    quizAttempts: 0,
    completedAt: null,
    notes: '',
    updatedAt: Date.now(),
  };
}

export async function listProgress(): Promise<Record<string, LessonProgress>> {
  const db = await getDB();
  const all = await db.getAll('progress');
  return Object.fromEntries(all.map((p) => [p.lessonId, { ...emptyProgress(p.lessonId), ...p }]));
}

export async function updateProgress(
  lessonId: string,
  patch: Partial<LessonProgress>,
): Promise<LessonProgress> {
  const db = await getDB();
  const current = { ...emptyProgress(lessonId), ...(await db.get('progress', lessonId)) };
  const next: LessonProgress = { ...current, ...patch, lessonId, updatedAt: Date.now() };
  await db.put('progress', next);
  emitChange('progress');
  return next;
}

// =====================================================================
// Plugins del usuario
// =====================================================================
export async function listPlugins(): Promise<UserPlugin[]> {
  const db = await getDB();
  return (await db.getAll('plugins')).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function savePlugin(p: Omit<UserPlugin, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: number }): Promise<UserPlugin> {
  const db = await getDB();
  const now = Date.now();
  const isNew = !p.id;
  const plugin: UserPlugin = { ...p, id: p.id ?? uid('plg'), createdAt: p.createdAt ?? now, updatedAt: now };
  await db.put('plugins', plugin);
  await logActivity('plugin', `${isNew ? 'Plugin registrado' : 'Plugin actualizado'}: ${plugin.name}`);
  emitChange('plugins');
  return plugin;
}

export async function deletePlugin(id: string): Promise<void> {
  const db = await getDB();
  const p = await db.get('plugins', id);
  await db.delete('plugins', id);
  await logActivity('plugin', `Plugin eliminado: ${p?.name ?? id}`);
  emitChange('plugins');
}

// =====================================================================
// Ideas y mejoras
// =====================================================================
export async function listIdeas(): Promise<Idea[]> {
  const db = await getDB();
  return db.getAll('ideas');
}

export async function saveIdea(i: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: number }): Promise<Idea> {
  const db = await getDB();
  const now = Date.now();
  const isNew = !i.id;
  const idea: Idea = { ...i, id: i.id ?? uid('idea'), createdAt: i.createdAt ?? now, updatedAt: now };
  await db.put('ideas', idea);
  if (isNew) await logActivity('idea', `Idea registrada: ${idea.title}`);
  emitChange('ideas');
  return idea;
}

export async function deleteIdea(id: string): Promise<void> {
  const db = await getDB();
  const i = await db.get('ideas', id);
  await db.delete('ideas', id);
  await logActivity('idea', `Idea eliminada: ${i?.title ?? id}`);
  emitChange('ideas');
}

// =====================================================================
// Chat del profesor
// =====================================================================
export async function listChat(): Promise<ChatMessage[]> {
  const db = await getDB();
  return db.getAllFromIndex('chats', 'byCreated');
}

export async function addChatMessage(m: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
  const db = await getDB();
  const msg: ChatMessage = { ...m, id: uid('msg'), createdAt: Date.now() };
  await db.put('chats', msg);
  emitChange('chats');
  return msg;
}

export async function clearChat(): Promise<void> {
  const db = await getDB();
  await db.clear('chats');
  emitChange('chats');
}

// =====================================================================
// Copias de seguridad (exportar / importar / puntos de restauración)
// =====================================================================
export const BACKUP_APP_ID = 'reaper-academy';
export const BACKUP_FORMAT = 1;

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  format: number;
  dbVersion: number;
  exportedAt: number;
  data: Partial<Record<StoreName, unknown[]>>;
}

export async function exportBackup(): Promise<BackupFile> {
  const db = await getDB();
  const data: BackupFile['data'] = {};
  for (const store of BACKUP_STORES) data[store] = await db.getAll(store);
  return { app: BACKUP_APP_ID, format: BACKUP_FORMAT, dbVersion: DB_VERSION, exportedAt: Date.now(), data };
}

export async function markBackupDone(): Promise<void> {
  await updateSettings({ lastBackupAt: Date.now() });
}

export function parseBackup(text: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  const b = parsed as Partial<BackupFile>;
  if (!b || b.app !== BACKUP_APP_ID || typeof b.data !== 'object' || b.data === null) {
    throw new Error('El archivo no es un respaldo de Reaper Academy.');
  }
  if ((b.format ?? 0) > BACKUP_FORMAT) {
    throw new Error('Este respaldo se creó con una versión más nueva de la app. Actualiza la app antes de importarlo.');
  }
  for (const [store, rows] of Object.entries(b.data)) {
    if (!BACKUP_STORES.includes(store as StoreName)) continue;
    if (!Array.isArray(rows)) throw new Error(`Datos inválidos en "${store}".`);
  }
  return b as BackupFile;
}

const KEY_OF: Record<StoreName, string> = {
  projects: 'id',
  snapshots: 'id',
  progress: 'lessonId',
  plugins: 'id',
  ideas: 'id',
  chats: 'id',
  settings: 'id',
  activity: 'id',
  restorePoints: 'id',
};

export interface ImportResult {
  added: number;
  updated: number;
  kept: number;
}

/**
 * Importa un respaldo.
 * - 'merge': añade lo nuevo; si un registro existe en ambos lados gana el más reciente (updatedAt).
 * - 'replace': sustituye todos tus datos por los del archivo.
 * En ambos casos se crea antes un punto de restauración automático.
 */
export async function importBackup(backup: BackupFile, mode: 'merge' | 'replace'): Promise<ImportResult> {
  await createRestorePoint(`Automático antes de importar (${mode === 'merge' ? 'fusionar' : 'reemplazar'})`);
  const db = await getDB();
  const result: ImportResult = { added: 0, updated: 0, kept: 0 };
  for (const store of BACKUP_STORES) {
    const rows = (backup.data[store] ?? []) as Record<string, unknown>[];
    const tx = db.transaction(store, 'readwrite');
    if (mode === 'replace') await tx.store.clear();
    for (const row of rows) {
      const key = row[KEY_OF[store]] as string | undefined;
      if (!key) continue;
      if (mode === 'merge') {
        const existing = (await tx.store.get(key)) as Record<string, unknown> | undefined;
        if (existing) {
          const a = Number(existing.updatedAt ?? existing.createdAt ?? existing.at ?? 0);
          const b = Number(row.updatedAt ?? row.createdAt ?? row.at ?? 0);
          if (b > a) {
            await tx.store.put(row as never);
            result.updated++;
          } else result.kept++;
          continue;
        }
      }
      await tx.store.put(row as never);
      result.added++;
    }
    await tx.done;
    emitChange(store);
  }
  await logActivity('backup', `Respaldo importado (${mode}): ${result.added} añadidos, ${result.updated} actualizados`);
  return result;
}

const RESTORE_POINT_LIMIT = 10;

export async function createRestorePoint(label: string): Promise<RestorePoint> {
  const backup = await exportBackup();
  const payload = JSON.stringify(backup);
  const db = await getDB();
  const rp: RestorePoint = { id: uid('rp'), createdAt: Date.now(), label, payload, sizeBytes: payload.length };
  await db.put('restorePoints', rp);
  const all = (await db.getAll('restorePoints')).sort((a, b) => b.createdAt - a.createdAt);
  for (const old of all.slice(RESTORE_POINT_LIMIT)) await db.delete('restorePoints', old.id);
  emitChange('restorePoints');
  return rp;
}

export async function listRestorePoints(): Promise<Omit<RestorePoint, 'payload'>[]> {
  const db = await getDB();
  const all = await db.getAll('restorePoints');
  return all
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ payload: _p, ...rest }) => rest);
}

export async function restoreFromPoint(id: string): Promise<ImportResult> {
  const db = await getDB();
  const rp = await db.get('restorePoints', id);
  if (!rp) throw new Error('El punto de restauración no existe.');
  return importBackup(parseBackup(rp.payload), 'replace');
}

export async function deleteRestorePoint(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('restorePoints', id);
  emitChange('restorePoints');
}
