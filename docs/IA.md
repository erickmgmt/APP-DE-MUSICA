# IA en Reaper Academy

## Principios
1. **La app funciona sin IA.** El Profesor usa una base de conocimiento offline (`src/content/tutor/knowledge.ts`)
   con respuestas revisadas y etiquetadas por nivel de verificación.
2. **Ninguna API key en el frontend.** La app no tiene campo para keys. Solo guarda la URL de un servidor y el
   nombre del modelo. Ese servidor (que controlas tú) guarda la key y llama al proveedor.
3. **Envío explícito.** Solo se envía algo cuando pulsas "Preguntar a la IA": tu última pregunta y, si lo activas,
   el contexto (género/BPM/tonalidad del último proyecto y nombres de tus plugins). Nunca audio ni archivos.
4. Las respuestas de IA se marcan como **no verificadas**. El prompt de sistema exige las 6 partes, prohíbe
   inventar menús de REAPER y pide etiquetar cada paso (`src/core/ai/providers.ts`).

## Arquitectura
```ts
interface AiProvider { id: string; label: string; chat(messages, signal?): Promise<string> }
```
- `OpenAICompatibleProvider`: `POST {baseUrl}/chat/completions` con `{ model, messages }`.
- Añadir otro tipo: implementa `AiProvider`, añade su id a `AiSettings['provider']` y créalo en `createProvider`.

## Opciones de servidor
| Opción | URL base de ejemplo | Notas |
|---|---|---|
| **freellmapi** (o cualquier proxy compatible con OpenAI) | `http://localhost:3001/v1` | Las keys se configuran en el servidor. |
| **Ollama** en otro equipo | `http://IP:11434/v1` | Un Celeron N4020 no es adecuado para ejecutar modelos locales; usa otro PC. Configura `OLLAMA_ORIGINS` para permitir CORS. |
| **LM Studio** en otro equipo | `http://IP:1234/v1` | Activa el servidor y CORS. |
| **Proxy propio serverless** | `https://tu-proxy.workers.dev/v1` | Ejemplo abajo. |

> El navegador debe poder llamar al servidor (CORS). Si la app está en HTTPS (GitHub Pages), el servidor también
> debe estar en HTTPS (los navegadores bloquean llamadas HTTP desde páginas HTTPS, salvo `localhost`).

## Ejemplo: proxy en Cloudflare Workers
La key queda como **secreto** del Worker; el navegador nunca la ve.

```js
// worker.js — reenvía /v1/chat/completions a un proveedor compatible con OpenAI.
// Variables: UPSTREAM_URL (p. ej. la URL /v1 de tu proveedor), ALLOWED_ORIGIN (la URL de tu app).
// Secreto:  wrangler secret put API_KEY
export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url);
    if (req.method !== 'POST' || url.pathname !== '/v1/chat/completions' || req.headers.get('Origin') !== env.ALLOWED_ORIGIN) {
      return new Response('No permitido', { status: 403, headers: cors });
    }
    const upstream = await fetch(env.UPSTREAM_URL.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.API_KEY}` },
      body: await req.text(),
    });
    return new Response(upstream.body, { status: upstream.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
```
Comprobar el origen limita el uso desde otras webs, pero no es autenticación fuerte: si publicas el proxy,
añade límites de uso en el panel del proveedor.

## Configurar en la app
Sistema → IA → URL base + modelo → **Probar conexión** → Guardar.
