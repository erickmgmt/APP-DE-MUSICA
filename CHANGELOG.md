# Registro de cambios

Formato: versión — fecha — cambios. Mantener sincronizado con `src/content/changelog.ts`.

## 0.2.0 — 2026-11-13 — App independiente con estudio propio
- Nuevo **Estudio**: producir dentro de la app (batería por pasos, instrumentos con editor de notas, samples propios, loop 1/2/4 compases, swing).
- 23 instrumentos sintetizados incluidos y plantilla Deep House.
- Mezcla: volumen, mute/solo, paneo, EQ 3 bandas, filtro, reverb y delay compartidos, sidechain del kick, limitador, medidor de pico y espectro.
- Estructura de canción (partes con pistas activas) y modo Canción.
- Exportación WAV 16/24 bits (render offline por bloques) con pico de muestra y loudness integrado (LUFS, BS.1770) medidos.
- Deshacer y guardado automático; samples en IndexedDB (migración aditiva v2) e incluidos en el respaldo (formato 2).
- Se elimina la dependencia de REAPER: lecciones, guía, profesor y prompt de IA enseñan con el estudio de la app. Se retira el catálogo de plugins (datos conservados).
- Corregido: instantáneas creadas en el mismo milisegundo podían no agruparse.
- Nombre de la app: "Mi Estudio Musical".

## 0.1.0 — 2026-11-12 — Primera versión funcional (Reaper Academy)
- Estudio (dashboard) con progreso, siguiente paso recomendado, proyectos y groove Deep House con espectro real.
- Academia: Nivel 1 completo (10 lecciones con 8 partes cada una y visuales interactivos con Web Audio). Avance bloqueado hasta aprobar. Niveles 2–4 planificados.
- Productor paso a paso: 15 etapas, ruta completa de Deep House, consejos contextuales, ficha completa, problemas, versiones e historial restaurable; proyectos eliminados recuperables.
- Biblioteca de sonidos (23 tipos) con buscador por intención y ejemplos sintetizados.
- Catálogo personal de plugins y recomendador priorizado (tuyos → REAPER → gratuitos ligeros).
- Profesor offline (17 temas, respuestas en 6 partes) + conexión opcional a IA vía servidor propio (sin API keys en el frontend).
- Ideas y mejoras con prioridad, votos, estados e instrucción generada para Claude Code.
- Sistema: exportar/importar respaldos (fusionar/reemplazar), puntos de restauración, actividad, mapa de módulos.
- PWA instalable y offline. Pruebas unitarias y E2E.
