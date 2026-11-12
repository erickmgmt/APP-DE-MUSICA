# 🎛️ Reaper Academy — Mi estudio musical inteligente

Aplicación personal para **aprender a producir canciones completas con REAPER**, empezando por Deep House.
Funciona en el navegador del ordenador y del teléfono, se puede **instalar como app (PWA)** y funciona **sin conexión**.
Tus datos se guardan **solo en tu dispositivo**.

## Qué incluye (v0.1.0)

| Módulo | Qué hace |
|---|---|
| **Estudio** | Progreso, siguiente paso recomendado, tus canciones y un groove Deep House en vivo con visualizador de espectro real. |
| **Academia** | Nivel 1 *Fundamentos* completo: 10 lecciones con explicación, visual interactivo (metrónomo, piano, escalas, piano roll, osciloscopio, secuenciador…), ejemplo, pasos exactos en REAPER, ejercicio, errores comunes, evaluación y progreso. Solo avanzas al aprobar (≥ 70 %). Niveles 2–4 planificados. |
| **Productor paso a paso** | Proyectos de canción con las **15 etapas** (idea → exportación). Ruta **completa de Deep House** con recomendaciones justificadas, qué evitar, parámetros orientativos, pasos en REAPER, cómo comprobar y plugins sugeridos. Un "productor" comenta el estado de tu proyecto. Ficha (BPM, tonalidad, referencias, instrumentos, plugins, cadenas de FX, notas), problemas, versiones e **historial restaurable**. |
| **Profesor** | Preguntas en lenguaje natural ("mi kick y mi bajo se pelean") → diagnóstico, explicación, solución, pasos en REAPER, parámetros y cómo comprobarlo. Funciona offline; IA opcional mediante tu propio servidor. |
| **Biblioteca de sonidos** | 23 tipos de sonido con frecuencias, uso, combinaciones y procesado. Buscador por intención: *"necesito un sonido atmosférico para el fondo"*. |
| **Plugins** | Tu catálogo (nombre, versión, formato, categorías, CPU) y un recomendador: **tus plugins → nativos de REAPER → gratuitos ligeros**. |
| **Ideas y mejoras** | Registra, prioriza y convierte ideas en instrucciones para Claude Code. |
| **Sistema** | Copias de seguridad (exportar/importar JSON), puntos de restauración, proyectos eliminados recuperables, configuración de IA, registro de actividad, mapa de módulos y cambios. |

Las instrucciones de REAPER llevan una etiqueta: **Verificado**, **Confirma en pantalla**, **Recomendación general** o **Experimental**.
Los menús se muestran en inglés (texto original de REAPER) con traducción aproximada, porque los paquetes de idioma en español varían.

## Ejecutar

Requisitos: [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Producción:

```bash
npm run build    # genera dist/
npm run preview  # sirve dist/ en http://localhost:4173
```

Pruebas: `npm test` (unitarias) y `npm run e2e` (navegador; necesita Playwright).

### Usarla en el teléfono / instalarla
- **Opción A (recomendada): GitHub Pages.** El workflow `.github/workflows/deploy.yml` publica la app al hacer push a `main`.
  Actívalo en GitHub: *Settings → Pages → Source: GitHub Actions*. Después abre la URL en el móvil y usa
  "Añadir a pantalla de inicio" / "Instalar app".
- **Opción B (red local):** `npm run build && npx vite preview --host` y abre la IP de tu PC desde el móvil
  (la instalación como PWA requiere HTTPS o localhost, así que en red local funcionará como web normal).

## Tus datos
- Se guardan en IndexedDB de **ese** navegador y dispositivo. Cada dispositivo tiene sus propios datos:
  usa **Sistema → Exportar/Importar** para pasarlos de uno a otro (la opción *Fusionar* conserva lo más reciente).
- Actualizar la app **no borra tus datos** (el contenido educativo y tus datos están separados).
- Antes de cada importación se crea un punto de restauración automático.
- Borrar los datos del navegador sí borra todo: **descarga respaldos con regularidad**.

## IA (opcional)
La app no guarda API keys. Para usar IA, conecta un servidor compatible con OpenAI que tú controles
(tu proxy, freellmapi, Ollama/LM Studio en otro equipo…). Ver [docs/IA.md](docs/IA.md).

## Documentación
- [CLAUDE.md](CLAUDE.md) — reglas e instrucciones para futuras sesiones de desarrollo.
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) — arquitectura, datos y mapa de módulos.
- [docs/IA.md](docs/IA.md) — integración de proveedores de IA y seguridad de keys.
- [CHANGELOG.md](CHANGELOG.md) — registro de cambios.
