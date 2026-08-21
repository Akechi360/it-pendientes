// ─────────────────────────────────────────────────────────────
// Lógica compartida de análisis de voz con Gemini.
// Fuente ÚNICA usada tanto por la función serverless de Vercel
// (api/parse-voice.js) como por el plugin de desarrollo de Vite.
// La API key vive SOLO en el servidor: nunca se expone al cliente.
// ─────────────────────────────────────────────────────────────

// Cadena de modelos (alias "latest" para no romperse cuando Google retira
// versiones concretas). Si el primero está saturado (503) o lento, se cae al
// siguiente ANTES de rendirse al parser local. flash-lite es más disponible y
// rápido; ambos son 2.5 y aceptan thinkingConfig.
export const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];

const buildPrompt = (command, membersText) => `Eres un asistente de IA para un Portal IT de una clínica. Analiza este dictado por voz en español: "${command}".

Miembros del equipo disponibles:
${membersText || '- Eduardo Toro\n- Manuel Pérez'}

REGLAS ESTRUCTURALES CRÍTICAS:
1. "title": Título técnico súper profesional y sintético del problema (máximo 7 palabras). Elimina COMPLETAMENTE las instrucciones de asignación (ej: "asigna esta incidencia como urgente a Eduardo", "urgente a Eduardo", "registra una incidencia...").
   - Ejemplo de voz: "Se cayó el wi-fi en la habitación 2 de hospitalización asigna esta incidencia como urgente a Eduardo"
   - Título correcto: "Fallo de Cobertura Wi-Fi en Habitación 2 de Hospitalización"
2. "description": Descripción técnica clara del problema reportado omitiendo las órdenes de asignación o meta-comandos.
3. "priority": "critica" si mencionan "urgente" o "crítica"; si no "alta", "media" o "baja".
4. "assigneeUid" y "assigneeName": El usuario asignado si lo mencionan (resuelve el UID a partir de la lista de miembros).
5. "entityType": "incident", "task", "meeting" o "project" según corresponda.
6. "category": "redes", "hardware", "software", "soporte", etc.

Responde ÚNICAMENTE con esta estructura JSON sin markdown:
{
  "entityType": "incident",
  "title": "string",
  "description": "string",
  "priority": "critica",
  "category": "redes",
  "assigneeUid": "string o null",
  "assigneeName": "string o null"
}`;

// Extrae el primer objeto JSON válido del texto devuelto por el modelo,
// tolerando envolturas accidentales tipo ```json ... ```.
const extractJson = (text) => {
  if (!text) throw new Error('Respuesta vacía del modelo');
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No se pudo extraer JSON de la respuesta del modelo');
  }
};

/**
 * Llama a Gemini y devuelve el intent estructurado.
 * @throws {Error} con `.status` y mensaje real de Gemini si la API falla.
 */
export async function parseVoiceWithGemini({ command, membersText, apiKey }) {
  if (!apiKey) {
    const err = new Error('Falta GEMINI_API_KEY en el entorno del servidor');
    err.status = 500;
    err.code = 'MISSING_KEY';
    throw err;
  }

  // Auth por cabecera (x-goog-api-key), no en la URL: evita que la clave
  // acabe en logs/proxies. La clave nunca sale del servidor.
  const body = JSON.stringify({
    contents: [{ parts: [{ text: buildPrompt(command, membersText) }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      maxOutputTokens: 800,
      // CLAVE de latencia: gemini-flash (2.5) trae "thinking" dinámico
      // activado, que dispara la latencia a 30-60s. Esto es una extracción
      // estructurada simple: desactivamos el thinking para ~2-3s.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey };

  const TRANSIENT = new Set([429, 500, 502, 503, 504]);
  const FETCH_TIMEOUT_MS = 8000; // corta la llamada si el modelo se cuelga

  // Recorre la cadena de modelos: si uno está saturado (503), con cuota (429)
  // o lento (timeout), pasa al siguiente antes de rendirse. Un error NO
  // transitorio (key inválida, 400, modelo inexistente) aborta de inmediato.
  let lastErr;
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let resp;
    try {
      resp = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
    } catch (e) {
      lastErr = new Error(`Gemini no respondió a tiempo con ${model} (${FETCH_TIMEOUT_MS}ms): ${String(e?.message || e)}`);
      lastErr.status = 504;
      lastErr.code = 'GEMINI_TIMEOUT';
      continue; // probar el siguiente modelo
    } finally {
      clearTimeout(timer);
    }

    if (resp.ok) {
      const data = await resp.json();
      const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return extractJson(textContent);
    }

    const details = await resp.text();
    lastErr = new Error(`Gemini API ${resp.status} (${model}): ${details.slice(0, 300)}`);
    lastErr.status = resp.status;
    lastErr.code = 'GEMINI_ERROR';
    if (TRANSIENT.has(resp.status)) continue; // saturación/cuota → siguiente modelo
    throw lastErr; // error no transitorio → abortar
  }

  // Todos los modelos fallaron (saturación/timeout): propaga el último error.
  throw lastErr;
}
