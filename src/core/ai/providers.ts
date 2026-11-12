import type { AiSettings } from '../types';

/**
 * Arquitectura de proveedores de IA (intercambiables).
 *
 * SEGURIDAD: la app NUNCA guarda API keys. Solo habla con un endpoint que TÚ controlas
 * (un proxy propio, un servidor local o una función serverless) y ese endpoint guarda la key.
 * Endpoints compatibles con la API de OpenAI (/v1/chat/completions) que puedes usar:
 *   - tu instancia de freellmapi u otro proxy propio,
 *   - Ollama (http://localhost:11434/v1) o LM Studio en otra máquina de tu red,
 *   - el proxy de ejemplo de docs/IA.md (Cloudflare Worker con la key como secreto).
 * Para añadir otro tipo de proveedor: implementa `AiProvider` y regístralo en `createProvider`.
 */
export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProvider {
  id: string;
  label: string;
  chat(messages: AiMessage[], signal?: AbortSignal): Promise<string>;
}

export class OpenAICompatibleProvider implements AiProvider {
  id = 'openai-compatible';
  label = 'Servidor compatible con OpenAI';
  constructor(
    private baseUrl: string,
    private model: string,
  ) {}

  async chat(messages: AiMessage[], signal?: AbortSignal): Promise<string> {
    const url = this.baseUrl.replace(/\/+$/, '') + '/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, temperature: 0.4 }),
      signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`El servidor respondió ${res.status}. ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Respuesta vacía o con formato inesperado.');
    return text;
  }
}

export function createProvider(s: AiSettings): AiProvider | null {
  if (s.provider === 'openai-compatible' && s.baseUrl && s.model) {
    return new OpenAICompatibleProvider(s.baseUrl, s.model);
  }
  return null;
}

export const TUTOR_SYSTEM_PROMPT = `Eres el profesor de producción musical de "Reaper Academy". Hablas en español, de forma clara y para principiantes.
El alumno usa REAPER 7 (posiblemente con un paquete de idioma en español) en un equipo modesto (Intel Celeron N4020, 8 GB RAM).
Responde SIEMPRE con estas secciones en Markdown:
1. **Diagnóstico probable**
2. **Explicación sencilla**
3. **Solución recomendada**
4. **Pasos en REAPER**
5. **Parámetros iniciales orientativos**
6. **Cómo comprobar si funcionó**
Reglas estrictas:
- Nunca inventes nombres de botones, menús ni funciones de REAPER. Si no estás seguro de una ruta de menú, dilo explícitamente.
- Etiqueta cada paso como [verificado], [confirmar en tu pantalla], [recomendación general] o [experimental].
- Los valores numéricos son puntos de partida, no reglas; dilo.
- Distingue problemas técnicos objetivos (clipping, fase) de decisiones artísticas.
- Prioriza los plugins que el alumno tiene instalados y los que trae REAPER; después alternativas gratuitas y ligeras.
- No afirmes que algo está "masterizado profesionalmente" por un valor de LUFS.`;
