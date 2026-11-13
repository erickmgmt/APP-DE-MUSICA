import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  ActivityEntry,
  ChatMessage,
  Idea,
  LessonProgress,
  Project,
  ProjectSnapshot,
  RestorePoint,
  Settings,
  UserPlugin,
  UserSample,
} from '../types';

/**
 * Base de datos local (IndexedDB).
 *
 * REGLAS DE ORO (ver CLAUDE.md):
 *  1. Las migraciones son ADITIVAS: nunca borres un store ni datos en `upgrade`.
 *  2. Sube DB_VERSION y añade un bloque `if (oldVersion < N)` para cada cambio.
 *  3. Los datos nuevos se rellenan con valores por defecto al leer (ver normalizers en repo.ts).
 */
export const DB_NAME = 'reaper-academy';
export const DB_VERSION = 2;

export interface AcademyDB extends DBSchema {
  projects: { key: string; value: Project; indexes: { byUpdated: number } };
  snapshots: { key: string; value: ProjectSnapshot; indexes: { byProject: string } };
  progress: { key: string; value: LessonProgress };
  plugins: { key: string; value: UserPlugin };
  ideas: { key: string; value: Idea };
  chats: { key: string; value: ChatMessage; indexes: { byCreated: number } };
  settings: { key: string; value: Settings };
  activity: { key: string; value: ActivityEntry; indexes: { byAt: number } };
  restorePoints: { key: string; value: RestorePoint };
  samples: { key: string; value: UserSample };
}

export type StoreName =
  | 'projects'
  | 'snapshots'
  | 'progress'
  | 'plugins'
  | 'ideas'
  | 'chats'
  | 'settings'
  | 'activity'
  | 'restorePoints'
  | 'samples';

/** Stores que forman parte de un respaldo (los restorePoints no se incluyen a sí mismos). */
export const BACKUP_STORES: StoreName[] = [
  'projects',
  'snapshots',
  'progress',
  'plugins',
  'ideas',
  'chats',
  'settings',
  'activity',
  'samples',
];

let dbPromise: Promise<IDBPDatabase<AcademyDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AcademyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AcademyDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const projects = db.createObjectStore('projects', { keyPath: 'id' });
          projects.createIndex('byUpdated', 'updatedAt');
          const snaps = db.createObjectStore('snapshots', { keyPath: 'id' });
          snaps.createIndex('byProject', 'projectId');
          db.createObjectStore('progress', { keyPath: 'lessonId' });
          db.createObjectStore('plugins', { keyPath: 'id' });
          db.createObjectStore('ideas', { keyPath: 'id' });
          const chats = db.createObjectStore('chats', { keyPath: 'id' });
          chats.createIndex('byCreated', 'createdAt');
          db.createObjectStore('settings', { keyPath: 'id' });
          const act = db.createObjectStore('activity', { keyPath: 'id' });
          act.createIndex('byAt', 'at');
          db.createObjectStore('restorePoints', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          // v0.2: samples propios del usuario para el estudio
          db.createObjectStore('samples', { keyPath: 'id' });
        }
        // if (oldVersion < 3) { ... futuras migraciones ADITIVAS ... }
      },
      blocked() {
        console.warn('[db] Otra pestaña bloquea la actualización de la base de datos.');
      },
    });
  }
  return dbPromise;
}

/** Solo para pruebas: cierra y olvida la conexión. */
export async function _resetDBForTests(): Promise<void> {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
}

// ---- Bus de cambios para refrescar la interfaz ----
type Listener = (store: StoreName) => void;
const listeners = new Set<Listener>();

export function onDbChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitChange(store: StoreName): void {
  listeners.forEach((fn) => fn(store));
}

/** Pide al navegador que no borre los datos automáticamente cuando falte espacio. */
export async function requestPersistentStorage(): Promise<boolean | null> {
  try {
    if (navigator.storage?.persist) {
      const already = await navigator.storage.persisted();
      if (already) return true;
      return await navigator.storage.persist();
    }
  } catch {
    /* no soportado */
  }
  return null;
}
