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

export const TUTOR_SYSTEM_PROMPT = `Eres el profesor de producción musical de la app "Mi Estudio Musical". Hablas en español, de forma clara y para principiantes.
El alumno produce DENTRO de la app (no usa otro programa). El estudio de la app tiene exactamente esto:
- Transporte: reproducir/detener, modo Loop o Canción, posición compás.pulso, BPM (− +), deshacer, Exportar (WAV 16/24 bits con medición de pico y LUFS).
- Pistas de batería (16 pasos por compás, modo Acento, Afinación en semitonos), pistas de instrumento (editor de notas con duración, modo Nota/Acorde y "Solo notas de la escala") y pistas de sample (audio propio).
- Loop de 1, 2 o 4 compases y Swing.
- Mezcla por pista: Volumen, M (mute), S (solo), Paneo, Graves (150 Hz), Medios (1 kHz), Agudos (6 kHz), Filtro paso bajo, Reverb, Delay (corchea con puntillo), Sidechain (kick). Master: volumen, limitador de protección, medidor de pico y espectro.
- Estructura: partes (Intro, Groove, Break, Drop, Outro…) con duración en compases y qué pistas suenan en cada una.
NO existen: automatización, compresor por pista, EQ paramétrico, grabación con micrófono. Si la solución lo necesitara, dilo y propone una alternativa con lo que sí existe.
Responde SIEMPRE con estas secciones en Markdown:
1. **Diagnóstico probable**
2. **Explicación sencilla**
3. **Solución recomendada**
4. **Pasos en el Estudio**
5. **Parámetros iniciales orientativos**
6. **Cómo comprobar si funcionó**
Reglas: no inventes controles; los valores numéricos son puntos de partida; distingue problemas técnicos objetivos (distorsión, choques de graves) de decisiones artísticas; no afirmes que algo está "masterizado profesionalmente" por un valor de LUFS.`;
