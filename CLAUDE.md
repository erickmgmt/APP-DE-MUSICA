# CLAUDE.md — Instrucciones del proyecto Mi Estudio Musical

Lee este archivo completo antes de tocar el código. Es la memoria del proyecto entre sesiones.

## Qué es
Aplicación personal e **independiente** (PWA, en español) para **producir canciones dentro de la propia app**
mientras aprendes: tiene su propio estudio (DAW sencillo) con instrumentos incluidos, samples propios,
mezcla, estructura y exportación WAV. **No depende de REAPER ni de ningún otro programa** (se eliminó en v0.2).
Usuario principiante, sin teoría musical sólida, con un equipo modesto (**Intel Celeron N4020, UHD 600, 8 GB RAM**)
y que la usa sobre todo en el **teléfono** (Android, Chrome). Publicada en GitHub Pages:
https://erickmgmt.github.io/APP-DE-MUSICA/ (se despliega al hacer push a `main`).
Primer género: **Deep House**; la app debe crecer a House, Tech House, Afro House, Reggaetón, Trap, Pop, EDM, urbana…

## Comandos
```bash
npm install
npm run dev        # desarrollo (http://localhost:5173)
npm test           # pruebas unitarias (vitest + fake-indexeddb)
npm run build      # typecheck + build de producción en dist/
npm run e2e        # prueba de extremo a extremo en Chromium (requiere build previo y Playwright)
```
En el contenedor de Claude Code, Playwright es global: `NODE_PATH=$(npm root -g) npm run e2e`.
Antes de dar algo por terminado: `npm test && npm run build && npm run e2e` deben pasar sin errores de consola.

## Arquitectura (resumen; detalle en docs/ARQUITECTURA.md)
- `src/core/` lógica sin UI: `db/` (IndexedDB con `idb`), `audio/engine.ts` (voces Web Audio), `music/theory.ts`,
  `studio/` (motor del estudio: `instruments`, `song` modelo+plantillas, `graph` mezclador, `player` en vivo y render
  offline, `wav`, `loudness` LUFS), `search/`, `ai/` (motor offline + proveedores), asesores (`academyLogic`, `producerAdvisor`).
- `src/content/` **contenido educativo** versionado con el código (lecciones, etapas, géneros, sonidos,
  plugins de referencia, base de conocimiento del profesor, changelog). NO va a la base de datos.
- `src/modules/` un directorio por módulo + `registry.ts` (navegación y rutas se generan desde aquí).
- `src/components/` UI reutilizable (`ui/`, `audio/` widgets interactivos, `ReaperSteps`).

## REGLAS DE ORO
1. **Nunca destruyas datos personales.** Los datos del usuario viven en IndexedDB (`core/db`).
   - Migraciones SOLO aditivas: sube `DB_VERSION` y añade `if (oldVersion < N)`. Jamás borres stores.
   - Campos nuevos: dales valor por defecto al leer (ver `normalizeProject`, `normalizeSettings`, `emptyProgress`).
   - Si cambias el formato del respaldo, sube `BACKUP_FORMAT` y mantén la importación de formatos anteriores.
2. **Las instrucciones describen el Estudio de la app** (`StudioStep`, con `view` para abrir la pestaña).
   Deben coincidir con la interfaz real: si cambias un control del estudio, actualiza lecciones, etapas y profesor
   (y el prompt de `core/ai/providers.ts`). No describas funciones que el estudio no tiene (automatización, compresor
   por pista, grabación con micrófono…): di que están planificadas. Los consejos llevan nivel `general` o `experimental`.
   Hay una prueba que falla si el contenido vuelve a mencionar REAPER.
3. **No inventes información musical.** Valores numéricos = "orientativos". Distingue problemas objetivos de decisiones artísticas.
   No afirmes que algo está "masterizado profesionalmente" por un valor de LUFS.
4. **Nada decorativo.** No añadas botones que no hagan nada. Módulos futuros: `status: 'planeado'` en el registro
   (se muestran en el mapa, no en la navegación). Si algo requiere una integración inexistente, dilo en la UI.
5. **No simules análisis.** Solo se muestra lo que realmente se mide (pico de muestra, LUFS BS.1770 del WAV exportado).
   Los instrumentos son síntesis propia de la app y se indica; no son samples comerciales.
6. **Privacidad.** No subas archivos ni datos a servidores sin acción explícita del usuario. **Nunca guardes API keys
   en el frontend** (no hay campo de key; la IA se usa vía un servidor/proxy propio — ver docs/IA.md).
7. **Rendimiento (Celeron/teléfono):** nada pesado en segundo plano; el planificador de audio solo corre al reproducir;
   la exportación programa por bloques (`OfflineAudioContext.suspend`); lazy-loading por módulo; sin librerías pesadas.
   IDs que NO deben cambiar (rompería datos guardados): base de datos `reaper-academy`, `BACKUP_APP_ID`, lección `l1-reaper`,
   checklist `idea.reaper`.
8. La app debe funcionar **offline** y sin IA.

## Añadir un módulo (ej.: "módulo para aprender a crear bajos estilo Deep House")
1. Crea `src/modules/<id>/<Nombre>Page.tsx` con `export default`.
2. Regístralo en `src/modules/registry.ts` (`status: 'activo'`, `nav`, `load: lazy(...)`).
3. Contenido nuevo → `src/content/<área>/` con tipos de `src/content/types.ts`.
4. Datos personales nuevos → store nuevo con migración aditiva + incluirlo en `BACKUP_STORES` + funciones en `repo.ts`.
5. Pruebas en `tests/` (contenido íntegro, lógica) y un paso en `scripts/e2e-smoke.mjs`.
6. Actualiza `CHANGELOG.md`, `src/content/changelog.ts` (`APP_VERSION`) y docs.

## Añadir contenido
- **Lección**: en `src/content/academy/levelN.ts` con las 8 partes (explicación, visual, ejemplo, pasos en el Estudio,
  ejercicio con checks, errores comunes, quiz ≥3 preguntas). Pon `ready: true`. `tests/content.test.ts` lo valida.
  Visuales nuevos: añadir `VisualKind` y registrarlo en `components/audio/LessonVisual.tsx`.
- **Ruta de un género**: añade `byGenre['<genreId>']` en cada etapa de `src/content/producer/stages.ts`
  y cambia `route` a `'completa'` en `genres.ts`.
- **Respuesta del profesor**: `src/content/tutor/knowledge.ts` (6 partes) + caso en `tests/logic.test.ts`.
- **Instrumento del estudio**: añádelo en `src/core/studio/instruments.ts` (id único, `kind`, `group`, `play`).
- **Plantilla de canción**: `SONG_TEMPLATES` en `src/core/studio/song.ts` (las notas deben estar en su tonalidad).

## Estado actual (v0.2.0)
Hecho: Inicio, **Estudio** (batería, instrumentos, samples propios, mezcla con EQ/filtro/reverb/delay/sidechain,
limitador, estructura, exportación WAV con pico y LUFS, deshacer, guardado automático, plantilla Deep House),
Academia N1 (adaptado al estudio; N2–N4 planificados), Guía paso a paso (15 etapas, Deep House completa),
Biblioteca de sonidos, Profesor (offline + IA opcional), Ideas y mejoras, Sistema (respaldos con samples).
Retirado en v0.2: catálogo de plugins de REAPER (el store `plugins` se conserva por seguridad de datos).
Limitaciones conocidas: sin automatización, sin velocity por nota en el editor de notas, sin grabación con micrófono,
los samples suenan desde el inicio de cada paso (no se estiran al BPM). Siguientes incrementos sugeridos:
contenido del Nivel 2, automatización, Laboratorio de efectos, Análisis (A/B con referencias), Entrenamiento auditivo.

## Git
Rama de trabajo indicada por la sesión. Mensajes de commit en español, descriptivos.
