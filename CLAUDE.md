# CLAUDE.md — Instrucciones del proyecto Reaper Academy

Lee este archivo completo antes de tocar el código. Es la memoria del proyecto entre sesiones.

## Qué es
Aplicación personal (PWA, en español) que enseña a producir, arreglar, mezclar y masterizar
canciones con **REAPER 7.53 (con paquete de idioma en español)**. Usuario principiante, sin teoría
musical sólida, con un equipo modesto (**Intel Celeron N4020, UHD 600, 8 GB RAM**) y también móvil.
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
- `src/core/` lógica sin UI: `db/` (IndexedDB con `idb`), `audio/engine.ts` (Web Audio), `music/theory.ts`,
  `search/`, `ai/` (motor offline + proveedores), asesores (`academyLogic`, `producerAdvisor`, `pluginAdvisor`).
- `src/content/` **contenido educativo** versionado con el código (lecciones, etapas, géneros, sonidos,
  plugins de referencia, base de conocimiento del profesor, changelog). NO va a la base de datos.
- `src/modules/` un directorio por módulo + `registry.ts` (navegación y rutas se generan desde aquí).
- `src/components/` UI reutilizable (`ui/`, `audio/` widgets interactivos, `ReaperSteps`).

## REGLAS DE ORO
1. **Nunca destruyas datos personales.** Los datos del usuario viven en IndexedDB (`core/db`).
   - Migraciones SOLO aditivas: sube `DB_VERSION` y añade `if (oldVersion < N)`. Jamás borres stores.
   - Campos nuevos: dales valor por defecto al leer (ver `normalizeProject`, `normalizeSettings`, `emptyProgress`).
   - Si cambias el formato del respaldo, sube `BACKUP_FORMAT` y mantén la importación de formatos anteriores.
2. **No inventes nada de REAPER.** Toda instrucción (`ReaperStep`) lleva nivel:
   `verificado` (función estándar con config por defecto), `confirmar` (existe pero nombre/ubicación pueden variar),
   `general` (recomendación de producción), `experimental`. Ante la duda, usa `confirmar` o descríbelo sin ruta exacta.
   Menús: texto original en inglés en `menu.en` y traducción aproximada en `menu.es` (REAPER no trae español de serie).
3. **No inventes información musical.** Valores numéricos = "orientativos". Distingue problemas objetivos de decisiones artísticas.
   No afirmes que algo está "masterizado profesionalmente" por un valor de LUFS.
4. **Nada decorativo.** No añadas botones que no hagan nada. Módulos futuros: `status: 'planeado'` en el registro
   (se muestran en el mapa, no en la navegación). Si algo requiere una integración inexistente, dilo en la UI.
5. **No simules análisis.** Solo se muestra lo que realmente se mide/calcula. Los sonidos de ejemplo son síntesis
   aproximada y se indica.
6. **Privacidad.** No subas archivos ni datos a servidores sin acción explícita del usuario. **Nunca guardes API keys
   en el frontend** (no hay campo de key; la IA se usa vía un servidor/proxy propio — ver docs/IA.md).
7. **Rendimiento (Celeron):** nada pesado en segundo plano; animaciones solo mientras suena audio; lazy-loading
   por módulo; sin librerías de gráficos pesadas (SVG/canvas a mano).
8. La app debe funcionar **offline** y sin IA.

## Añadir un módulo (ej.: "módulo para aprender a crear bajos estilo Deep House")
1. Crea `src/modules/<id>/<Nombre>Page.tsx` con `export default`.
2. Regístralo en `src/modules/registry.ts` (`status: 'activo'`, `nav`, `load: lazy(...)`).
3. Contenido nuevo → `src/content/<área>/` con tipos de `src/content/types.ts`.
4. Datos personales nuevos → store nuevo con migración aditiva + incluirlo en `BACKUP_STORES` + funciones en `repo.ts`.
5. Pruebas en `tests/` (contenido íntegro, lógica) y un paso en `scripts/e2e-smoke.mjs`.
6. Actualiza `CHANGELOG.md`, `src/content/changelog.ts` (`APP_VERSION`) y docs.

## Añadir contenido
- **Lección**: en `src/content/academy/levelN.ts` con las 8 partes (explicación, visual, ejemplo, pasos REAPER,
  ejercicio con checks, errores comunes, quiz ≥3 preguntas). Pon `ready: true`. `tests/content.test.ts` lo valida.
  Visuales nuevos: añadir `VisualKind` y registrarlo en `components/audio/LessonVisual.tsx`.
- **Ruta de un género**: añade `byGenre['<genreId>']` en cada etapa de `src/content/producer/stages.ts`
  y cambia `route` a `'completa'` en `genres.ts`.
- **Respuesta del profesor**: `src/content/tutor/knowledge.ts` (6 partes) + caso en `tests/logic.test.ts`.

## Estado actual (v0.1.0)
Hecho: Dashboard, Academia N1 completo (N2–N4 planificados), Productor paso a paso (ruta Deep House completa),
Biblioteca de sonidos, Plugins, Profesor (offline + IA opcional), Ideas y mejoras, Sistema (respaldo/restauración).
Siguientes incrementos sugeridos: contenido del Nivel 2, Laboratorio de plugins, Mezcla y mastering
(analizador de archivos local con LUFS/True Peak), Entrenamiento auditivo, rutas completas de otros géneros.

## Git
Rama de trabajo indicada por la sesión. Mensajes de commit en español, descriptivos.
