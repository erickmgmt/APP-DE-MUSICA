# Arquitectura de Reaper Academy

## Tecnología y por qué
| Pieza | Elección | Motivo |
|---|---|---|
| UI | React 19 + TypeScript | Componentes reutilizables y tipado para crecer durante años. |
| Build | Vite 8 | Rápido, lazy-loading por módulo (cada página es un chunk). |
| Estilos | Tailwind CSS 4 | Tema oscuro con tokens propios (`src/styles/index.css`). |
| Datos | IndexedDB (`idb`) | Persistencia local, sin backend ni coste; funciona offline. |
| Audio | Web Audio API | Síntesis de ejemplos y ejercicios sin descargar samples. |
| PWA | vite-plugin-pwa (Workbox) | Instalable y offline; aviso de actualización. |
| Router | react-router `HashRouter` | Funciona desde cualquier carpeta/hosting estático (`base: './'`). |
| Pruebas | Vitest + fake-indexeddb, Playwright | Lógica y flujos reales en Chromium. |

Sin librerías de gráficos: los visualizadores son canvas/SVG propios (ligeros para un Celeron).

## Capas
```
src/
├─ main.tsx              rutas generadas desde el registro de módulos
├─ app/                  Layout (barra lateral / navegación móvil), aviso de actualización PWA
├─ modules/              un directorio por módulo + registry.ts
│  ├─ dashboard/ academy/ producer/ tutor/ sounds/ plugins/ ideas/ system/
├─ components/
│  ├─ ui/                Panel, Tabs, Modal, Check optimista, badges de verificación, toasts…
│  ├─ audio/             Metrónomo, rejilla de compás, piano, escalas, tonalidades, piano roll,
│  │                     osciloscopio, secuenciador de 16 pasos, espectro, diagramas, barra de frecuencias
│  ├─ ReaperSteps.tsx    instrucciones de REAPER con menú EN/ES, atajo y nivel de verificación
│  └─ SaveFields.tsx     campos que guardan al salir
├─ core/                 lógica pura (testeable)
│  ├─ db/                database.ts (esquema + migraciones), repo.ts (CRUD, historial, respaldos), hooks.ts (useLive)
│  ├─ audio/engine.ts    AudioContext único, voces sintetizadas, StepScheduler (lookahead)
│  ├─ music/theory.ts    notas, escalas, acordes, frecuencias, ms por nota
│  ├─ search/            buscador de sonidos por intención
│  ├─ ai/                tutorEngine (offline) y providers (IA intercambiable)
│  └─ academyLogic, producerAdvisor, pluginAdvisor
└─ content/              contenido educativo (no es dato personal)
   ├─ academy/ producer/ sounds/ plugins/ tutor/ changelog.ts types.ts
```

## Separación contenido / datos personales
- **Contenido** (`src/content`): viaja con cada versión de la app. Actualizarlo no toca tus datos.
- **Datos personales** (IndexedDB `reaper-academy`): solo los escribe `core/db/repo.ts`.

### Stores (v1)
| Store | Contenido |
|---|---|
| `projects` | Canciones: nombre, género, BPM, tonalidad, idea, referencias, instrumentos, plugins, cadenas FX, estado de etapas (estado, checklist, notas), notas, problemas, versiones. |
| `snapshots` | Historial: copia completa del proyecto antes de cada cambio importante (máx. 100/proyecto; se conservan al borrar el proyecto → recuperable). |
| `progress` | Progreso por lección (ejercicio, checks, mejor nota, intentos, notas). |
| `plugins` | Catálogo personal de plugins. |
| `ideas` | Ideas y mejoras. |
| `chats` | Conversación con el profesor. |
| `settings` | Ajustes (IA sin keys, plugins nativos, último respaldo). |
| `activity` | Registro de actividad (máx. 500). |
| `restorePoints` | Respaldos completos internos (máx. 10). |

Las ediciones seguidas con el mismo motivo se agrupan (una instantánea cada 3 min) para no llenar el historial.

### Respaldo
`{ app: 'reaper-academy', format, dbVersion, exportedAt, data: { <store>: [...] } }`.
Importar: *merge* (gana el `updatedAt` más reciente) o *replace*. Siempre se crea antes un punto de restauración.

## Reglas pedagógicas
- Lección completa = ejercicio marcado + evaluación ≥ 70 %. La siguiente se desbloquea solo entonces.
- El productor no es una lista rígida: permite trabajar fuera de orden y comenta qué falta (BPM fuera de rango,
  tonalidad sin definir, etapas "hechas" con checklist incompleta, problemas pendientes…).

## Mapa de módulos
| Módulo | Estado |
|---|---|
| Estudio (dashboard) | ✅ activo |
| Academia (N1 completo; N2–N4 planificados) | ✅ activo |
| Productor paso a paso (Deep House completo; otros géneros con ruta básica) | ✅ activo |
| Profesor (offline + IA opcional) | ✅ activo |
| Biblioteca de sonidos | ✅ activo |
| Plugins (catálogo + recomendador) | ✅ activo |
| Ideas y mejoras | ✅ activo |
| Sistema (respaldos, historial, IA, actividad) | ✅ activo |
| Laboratorio de plugins | 🔜 planeado |
| Mezcla y mastering (medidores, análisis local de archivos, LUFS/True Peak, A/B) | 🔜 planeado |
| Entrenamiento auditivo | 🔜 planeado |

## Rendimiento
- Cada módulo es un chunk lazy; el contenido de lecciones solo se carga al entrar en la Academia.
- El planificador de audio solo corre mientras suena algo; el espectro baja a ~4 fps en silencio y se pausa con la pestaña oculta.
- `prefers-reduced-motion` desactiva animaciones.
