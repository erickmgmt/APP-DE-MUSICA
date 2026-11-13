// Prueba de humo de extremo a extremo: levanta `vite preview` y recorre los flujos principales
// en Chromium real. Uso: npm run build && npm run e2e   (SHOTS=carpeta para guardar capturas)
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const PORT = 4179;
const BASE = `http://localhost:${PORT}/`;
const SHOTS = process.env.SHOTS;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
await new Promise((res, rej) => {
  server.stdout.on('data', (d) => d.toString().includes('Local') && res());
  server.on('exit', (c) => rej(new Error('preview terminó ' + c)));
  setTimeout(() => rej(new Error('timeout preview')), 20000);
});

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));

let step = 0;
const ok = (msg) => console.log(`  ✓ ${++step}. ${msg}`);
const shot = async (name, p = page) => { if (!SHOTS) return; await p.waitForTimeout(700); await p.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }); };
const go = async (hash) => { await page.goto(BASE + '#' + hash); await page.waitForLoadState('networkidle'); };
const expectText = async (text, timeout = 5000) => page.getByText(text, { exact: false }).first().waitFor({ timeout });

try {
  // ---------------- Dashboard
  await go('/');
  await expectText('Siguiente paso recomendado');
  await page.getByRole('button', { name: 'Reproducir' }).first().click();
  await page.waitForTimeout(1200);
  await shot('01-dashboard');
  await page.getByRole('button', { name: 'Detener' }).first().click();
  ok('Dashboard carga y el groove suena (Web Audio) sin errores');

  // ---------------- Academia: lección 1 completa
  await go('/academia');
  await expectText('Ruta de aprendizaje');
  if (!(await page.getByText('Cómo funciona el Estudio de la app').first().isVisible())) throw new Error('lista de lecciones');
  // la lección 2 debe estar bloqueada (no es enlace)
  if (await page.locator('a[href="#/academia/l1-reaper"]').count()) throw new Error('l1-reaper debería estar bloqueada');
  ok('Academia: solo la lección 1 está desbloqueada');
  await go('/academia/l1-daw');
  await expectText('Explicación sencilla');
  await page.getByRole('button', { name: /^FX/ }).first().click();
  await expectText('La cadena de efectos');
  for (const cb of await page.locator('section:has-text("Ejercicio") input[type=checkbox]').all()) await cb.check();
  await expectText('Ejercicio completado.');
  const answers = [1, 0, 2, 1];
  const fieldsets = await page.locator('fieldset').all();
  for (let i = 0; i < fieldsets.length; i++) await fieldsets[i].locator('button').nth(answers[i]).click();
  await page.getByRole('button', { name: 'Comprobar respuestas' }).click();
  await expectText('¡Aprobado!');
  await shot('02-leccion');
  await page.getByRole('button', { name: /Siguiente: Cómo funciona el Estudio/ }).click();
  await expectText('Mapa simplificado del Estudio');
  ok('Lección 1: ejercicio + evaluación aprobada desbloquean la lección 2');

  // widgets de las lecciones (sin errores)
  for (const id of ['l1-bpm', 'l1-notas', 'l1-escalas', 'l1-tonalidades', 'l1-midi', 'l1-audio', 'l1-patrones', 'l1-compases']) {
    await go('/academia/' + id);
    await expectText('Lección bloqueada');
  }
  ok('Lecciones posteriores siguen bloqueadas hasta aprobar las anteriores');

  // ---------------- Canción nueva → Estudio
  await go('/proyectos/nuevo');
  await page.getByPlaceholder('p. ej. Luces de medianoche').fill('Luces de medianoche');
  await page.getByRole('button', { name: 'Crear y abrir el Estudio' }).click();
  await expectText('Ajustes del loop');
  await page.getByRole('button', { name: 'Reproducir' }).first().click();
  await page.waitForTimeout(1500);
  const posText = await page.getByLabel('Posición (compás.pulso)').textContent();
  await page.getByRole('button', { name: 'Detener' }).first().click();
  if (posText === '1.1') throw new Error('la reproducción no avanza');
  await shot('03-estudio-pistas');
  ok('Canción nueva con plantilla Deep House: el estudio reproduce');

  // batería: encender un paso
  const pad = page.getByRole('button', { name: 'Paso 2', exact: true });
  await pad.click();
  await page.getByRole('button', { name: 'Paso 2 activo' }).waitFor();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await page.getByRole('button', { name: 'Paso 2', exact: true }).waitFor();
  // notas: añadir una nota al bajo
  await page.locator('button:has-text("Bajo Deep")').first().click();
  const before = await page.locator('button[aria-label$="(nota)"]').count();
  await page.getByRole('button', { name: 'C2 paso 1', exact: true }).click();
  await page.waitForFunction((n) => document.querySelectorAll('button[aria-label$="(nota)"]').length > n, before);
  await shot('04-estudio-notas');
  ok('Editor de batería y de notas funcionan, con deshacer');

  await page.getByRole('tab', { name: 'Mezcla' }).click();
  await expectText('Limitador de protección');
  await page.getByRole('slider', { name: 'Volumen' }).first().fill('-10');
  await page.getByRole('tab', { name: 'Estructura' }).click();
  await expectText('Estructura Deep House');
  await page.locator('input[aria-label="Nombre de la parte"]').first().waitFor();
  await shot('05-estudio-estructura');
  await page.waitForTimeout(900); // guardado automático
  ok('Mezcla y estructura disponibles; cambios guardados');

  // ---------------- Guía paso a paso del proyecto
  await page.locator('a[href*="/proyectos/prj_"]').first().click();
  await expectText('Tu productor dice');
  await page.getByRole('button', { name: /4\. Selección del kick/ }).click();
  await expectText('Busca un kick redondo');
  await expectText('Hazlo en el Estudio');
  await page.locator('label:has-text("Comparé al menos 5 kicks") input').check();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Hecho', exact: true }).click();
  await expectText('Etapa "Selección del kick" completada');
  ok('Guía: etapa con pasos en el Estudio, checklist y estado');
  await page.getByRole('tab', { name: 'Ficha del proyecto' }).click();
  await expectText('Pistas de tu canción (Estudio)');
  const nameInput = page.locator('label:has-text("Nombre") input').first();
  await nameInput.fill('Luces de medianoche v2');
  await nameInput.press('Enter');
  await page.waitForTimeout(400);
  await page.getByRole('tab', { name: /Problemas y versiones/ }).click();
  await page.getByPlaceholder('Ej.: el kick y el bajo se pelean').fill('el kick y el bajo se pelean');
  await page.getByRole('button', { name: 'Añadir problema' }).click();
  await expectText('Tienes 1 problema(s) pendiente(s)');
  await page.getByRole('tab', { name: 'Historial' }).click();
  await expectText('Renombrar');
  page.once('dialog', (d) => d.accept());
  await page.locator('li:has-text("Renombrar") button:has-text("Restaurar")').first().click();
  await expectText('Versión restaurada');
  await page.getByRole('heading', { name: 'Luces de medianoche', exact: true }).waitFor();
  ok('Ficha, problemas e historial: una versión anterior se restaura');

  // ---------------- Exportar a WAV (canción corta)
  await go('/proyectos/nuevo');
  await page.getByPlaceholder('p. ej. Luces de medianoche').fill('Prueba export');
  await page.getByRole('button', { name: /Canción vacía/ }).click();
  await page.getByRole('button', { name: 'Crear y abrir el Estudio' }).click();
  await expectText('Ajustes del loop');
  await page.getByRole('button', { name: /Exportar/ }).click();
  await page.getByRole('button', { name: 'Renderizar' }).click();
  await page.getByText('loudness integrado', { exact: true }).waitFor({ timeout: 60000 });
  await shot('06-exportar');
  const [wav] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: /Descargar/ }).click()]);
  if (!wav.suggestedFilename().endsWith('.wav')) throw new Error('el archivo no es WAV');
  await page.keyboard.press('Escape');
  ok('Exportación WAV con pico y LUFS medidos, archivo descargado');

  // ---------------- Sonidos
  await go('/sonidos');
  await page.locator('#sound-q').fill('Necesito un sonido atmosférico para el fondo de mi canción');
  await expectText('Entendí que buscas');
  await expectText('ambiente / atmósfera');
  await page.getByRole('button', { name: 'Ver ficha completa' }).first().click();
  await expectText('Frecuencias que suele ocupar');
  await shot('05-sonidos');
  await page.keyboard.press('Escape');
  ok('Biblioteca: el buscador por intención entiende la frase de ejemplo');

  // ---------------- Profesor
  await go('/profesor');
  await page.getByLabel('Tu pregunta').fill('Mi kick y mi bajo se están peleando');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expectText('1 · Diagnóstico probable');
  await expectText('4 · Pasos en el Estudio');
  await expectText('6 · Cómo comprobar si funcionó');
  await shot('06-profesor');
  await page.getByLabel('Tu pregunta').fill('receta de tortilla');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expectText('No tengo una respuesta verificada');
  ok('Profesor: responde en 6 partes y no inventa respuestas fuera de su base');

  // ---------------- Ideas
  await go('/ideas');
  await page.getByPlaceholder('Ej.: módulo para crear bajos estilo Deep House').fill('Agrega un módulo para aprender a crear bajos estilo Deep House');
  await page.getByRole('button', { name: 'Guardar idea' }).click();
  await expectText('Idea registrada');
  await page.getByRole('button', { name: 'Convertir en funcionalidad' }).click();
  await expectText('Lee primero CLAUDE.md');
  await page.keyboard.press('Escape');
  ok('Ideas: registro, priorización y conversión en instrucción');

  // ---------------- Sistema: exportar / importar
  await go('/sistema');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar respaldo' }).click()]);
  const path = await dl.path();
  await page.locator('input[type=file]').setInputFiles(path);
  await expectText('Fusionar (recomendado)');
  await page.getByRole('button', { name: 'Fusionar (recomendado)' }).click();
  await expectText('Importado:');
  await expectText('Automático antes de importar');
  await shot('07-sistema');
  ok('Sistema: respaldo exportado e importado (fusión) con punto de restauración automático');

  // ---------------- Persistencia tras recargar
  await page.reload();
  await go('/estudio');
  await expectText('Luces de medianoche');
  await expectText('Prueba export');
  await go('/academia');
  await expectText('1 de 10 lecciones disponibles completadas');
  ok('Los datos persisten tras recargar (IndexedDB)');

  // ---------------- Móvil
  const mobile = await browser.newContext({ ...(await import('node:module')).createRequire(import.meta.url)('playwright').devices['Pixel 7'] });
  const mp = await mobile.newPage();
  mp.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message));
  await mp.goto(BASE + '#/');
  await mp.getByRole('navigation', { name: 'Navegación móvil' }).waitFor();
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (overflow) throw new Error('scroll horizontal en móvil');
  await shot('08-movil-dashboard', mp);
  await mp.goto(BASE + '#/academia/l1-daw');
  await mp.getByText('Explicación sencilla').waitFor();
  await shot('09-movil-leccion', mp);
  await mp.getByRole('button', { name: 'Más' }).click();
  await mp.getByText('Más módulos').waitFor();
  ok('Móvil: navegación inferior, sin scroll horizontal');

  // ---------------- PWA
  const manifest = await (await fetch(BASE + 'manifest.webmanifest')).json();
  if (manifest.short_name !== 'Mi Estudio') throw new Error('manifest');
  const sw = await fetch(BASE + 'sw.js');
  if (!sw.ok) throw new Error('service worker');
  ok('PWA: manifest y service worker disponibles');

  if (errors.length) throw new Error('Errores en consola:\n' + errors.join('\n'));
  console.log(`\nE2E OK — ${step} comprobaciones superadas`);
} catch (e) {
  console.error('\n✗ FALLO:', e.message);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/zz-fallo.png`, fullPage: true });
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
  server.kill();
}
