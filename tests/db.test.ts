import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { _resetDBForTests } from '../src/core/db/database';
import * as repo from '../src/core/db/repo';
import { STAGE_IDS } from '../src/content/producer/stages';

beforeEach(async () => {
  await _resetDBForTests();
  // base de datos limpia para cada prueba
  globalThis.indexedDB = new IDBFactory();
});

describe('proyectos', () => {
  it('crea un proyecto con todas las etapas y una instantánea inicial', async () => {
    const p = await repo.createProject({ name: 'Noche', bpm: 122 }, STAGE_IDS);
    expect(Object.keys(p.stages)).toHaveLength(15);
    const snaps = await repo.listSnapshots(p.id);
    expect(snaps).toHaveLength(1);
    expect(snaps[0].reason).toBe('Proyecto creado');
  });

  it('guarda el historial y permite restaurar una versión anterior', async () => {
    const p = await repo.createProject({ name: 'Original', bpm: 122 }, STAGE_IDS);
    await repo.saveProject({ ...p, name: 'Cambiado', bpm: 124 }, 'Renombrar', 'force');
    const current = await repo.getProject(p.id);
    expect(current?.name).toBe('Cambiado');
    const snaps = await repo.listSnapshots(p.id);
    const before = snaps.find((s) => s.data.name === 'Original' && s.reason === 'Renombrar')!;
    expect(before).toBeTruthy();
    const restored = await repo.restoreSnapshot(before.id);
    expect(restored.name).toBe('Original');
    expect(restored.bpm).toBe(122);
    // restaurar también guarda la versión que se reemplaza
    const after = await repo.listSnapshots(p.id);
    expect(after.some((s) => s.reason === 'Antes de restaurar una versión' && s.data.name === 'Cambiado')).toBe(true);
  });

  it('agrupa ediciones seguidas con el mismo motivo', async () => {
    const p = await repo.createProject({ name: 'A' }, STAGE_IDS);
    await repo.saveProject({ ...p, notes: '1' }, 'Notas');
    const p2 = (await repo.getProject(p.id))!;
    await repo.saveProject({ ...p2, notes: '12' }, 'Notas');
    const snaps = await repo.listSnapshots(p.id);
    expect(snaps.filter((s) => s.reason === 'Notas')).toHaveLength(1);
  });

  it('un proyecto eliminado sigue siendo recuperable', async () => {
    const p = await repo.createProject({ name: 'Borrable' }, STAGE_IDS);
    await repo.deleteProject(p.id);
    expect(await repo.getProject(p.id)).toBeUndefined();
    const deleted = await repo.listDeletedProjects();
    expect(deleted[0].data.name).toBe('Borrable');
    await repo.restoreSnapshot(deleted[0].id);
    expect((await repo.getProject(p.id))?.name).toBe('Borrable');
  });
});

describe('copias de seguridad', () => {
  it('exporta e importa (reemplazar) sin perder datos', async () => {
    await repo.createProject({ name: 'P1' }, STAGE_IDS);
    await repo.savePlugin({ name: 'TDR Nova', developer: 'TDR', version: '2', format: 'VST3', categories: ['eq'], cpu: 'ligero', notes: '', favorite: true });
    await repo.saveIdea({ title: 'Bajos deep', description: '', module: 'academia', priority: 'alta', status: 'nueva', votes: 0 });
    await repo.updateProgress('l1-daw', { exerciseDone: true, quizBest: 1 });
    const backup = await repo.exportBackup();
    const text = JSON.stringify(backup);

    globalThis.indexedDB = new IDBFactory();
    await _resetDBForTests();
    expect(await repo.listProjects()).toHaveLength(0);

    const res = await repo.importBackup(repo.parseBackup(text), 'replace');
    expect(res.added).toBeGreaterThan(0);
    expect((await repo.listProjects())[0].name).toBe('P1');
    expect((await repo.listPlugins())[0].name).toBe('TDR Nova');
    expect((await repo.listIdeas())[0].title).toBe('Bajos deep');
    expect((await repo.listProgress())['l1-daw'].quizBest).toBe(1);
  });

  it('fusionar conserva la versión más reciente de cada registro', async () => {
    const p = await repo.createProject({ name: 'Viejo' }, STAGE_IDS);
    const backup = await repo.exportBackup();
    await repo.saveProject({ ...p, name: 'Nuevo local' }, 'Edición', 'none');
    const res = await repo.importBackup(backup, 'merge');
    expect(res.kept).toBeGreaterThan(0);
    expect((await repo.getProject(p.id))?.name).toBe('Nuevo local');
  });

  it('crea un punto de restauración antes de importar y permite volver a él', async () => {
    await repo.createProject({ name: 'Antes' }, STAGE_IDS);
    const empty = { app: 'reaper-academy', format: 1, dbVersion: 1, exportedAt: Date.now(), data: { projects: [] } } as const;
    await repo.importBackup(repo.parseBackup(JSON.stringify(empty)), 'replace');
    expect(await repo.listProjects()).toHaveLength(0);
    const points = await repo.listRestorePoints();
    expect(points.length).toBeGreaterThan(0);
    await repo.restoreFromPoint(points[0].id);
    expect((await repo.listProjects())[0].name).toBe('Antes');
  });

  it('rechaza archivos que no son respaldos', () => {
    expect(() => repo.parseBackup('no json')).toThrow();
    expect(() => repo.parseBackup('{"app":"otra"}')).toThrow(/no es un respaldo/);
    expect(() => repo.parseBackup('{"app":"reaper-academy","format":99,"data":{}}')).toThrow(/más nueva/);
  });
});

describe('ajustes', () => {
  it('rellena campos por defecto y nunca guarda API keys', async () => {
    const s = await repo.getSettings();
    expect(s.ai.provider).toBe('none');
    const next = await repo.updateSettings({ ai: { provider: 'openai-compatible', baseUrl: 'http://localhost:3001/v1', model: 'x', shareContext: true } });
    expect(Object.keys(next.ai)).not.toContain('apiKey');
  });
});
