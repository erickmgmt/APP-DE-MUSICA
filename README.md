# 🎛️ Mi Estudio Musical — aprende produciendo

App personal para **producir canciones completas dentro de la propia app** mientras aprendes, empezando por Deep House.
No necesita ningún otro programa. Funciona en el teléfono y en el ordenador, se **instala como app (PWA)**, funciona **sin conexión**
y tus datos se guardan **solo en tu dispositivo**.

👉 **Abrir la app:** https://erickmgmt.github.io/APP-DE-MUSICA/
(en Android: Chrome → ⋮ → *Instalar aplicación*; en iPhone: Safari → Compartir → *Añadir a pantalla de inicio*).

## Qué incluye (v0.2.0)

| Módulo | Qué hace |
|---|---|
| **Estudio** | Tu DAW dentro de la app. Pistas de batería (16 pasos por compás, acentos, afinación), instrumentos con editor de notas (duración, modo Acorde, "solo notas de la escala"), **tus propios samples**, loop de 1/2/4 compases con swing. **Mezcla**: volumen, mute/solo, paneo, EQ de 3 bandas, filtro, reverb, delay sincronizado, sidechain del kick, limitador, medidor de pico y espectro. **Estructura**: Intro, Groove, Break, Drop, Outro. **Exportar a WAV** (16/24 bits) con pico y loudness (LUFS) medidos. Deshacer y guardado automático. |
| **Sonidos incluidos** | 23 instrumentos propios sintetizados en el dispositivo: kicks, clap, snare, hats, shaker, rim, congas, 4 bajos, pianos eléctricos, órgano, 2 pads, pluck, lead y campana. |
| **Plantilla Deep House** | Una canción lista para sonar (kick, clap, hats, shaker, bajo, acordes Am7–Dm7, pad y estructura de ~3 min) para aprender modificándola. |
| **Academia** | Nivel 1 completo: 10 lecciones con explicación, visual interactivo, ejemplo, **práctica en el Estudio**, ejercicio, errores comunes, evaluación y progreso. Niveles 2–4 planificados. |
| **Guía paso a paso** | Las 15 etapas de una canción (idea → exportación) con recomendaciones justificadas del género, qué evitar, parámetros orientativos y botones que abren el Estudio en la pestaña correcta. |
| **Profesor** | Preguntas en lenguaje natural ("mi kick y mi bajo se pelean") → diagnóstico, explicación, solución, pasos en el Estudio, parámetros y cómo comprobarlo. Offline; IA opcional con tu propio servidor. |
| **Biblioteca de sonidos** | Qué es cada tipo de sonido, frecuencias, uso y procesado, con buscador por intención. |
| **Ideas y mejoras** | Registra y prioriza ideas y conviértelas en instrucciones para Claude Code. |
| **Sistema** | Copias de seguridad (incluyen tus samples), puntos de restauración, canciones eliminadas recuperables, IA, actividad y cambios. |

Limitaciones actuales: no hay automatización ni grabación con micrófono; los samples no se estiran al BPM.

## Desarrollo

Requisitos: [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # pruebas unitarias
npm run build    # producción en dist/
npm run e2e      # prueba completa en navegador (requiere build y Playwright)
```

Cada push a `main` publica la app en GitHub Pages (`.github/workflows/deploy.yml`).

## Tus datos
- Se guardan en IndexedDB de **ese** navegador y dispositivo. Para pasarlos de uno a otro usa **Sistema → Descargar respaldo / Importar** (*Fusionar* conserva lo más reciente).
- Actualizar la app **no borra tus datos**. Antes de cada importación se crea un punto de restauración.
- Borrar los datos del navegador sí lo borra todo: **descarga respaldos con regularidad**.

## Documentación
- [CLAUDE.md](CLAUDE.md) — reglas e instrucciones para futuras sesiones de desarrollo.
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) — arquitectura, motor de audio y datos.
- [docs/IA.md](docs/IA.md) — IA opcional y seguridad de las API keys.
- [CHANGELOG.md](CHANGELOG.md) — registro de cambios.
