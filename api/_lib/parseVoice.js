// ─────────────────────────────────────────────────────────────
// Lógica compartida de análisis de voz con Gemini.
// Fuente ÚNICA usada tanto por la función serverless de Vercel
// (api/parse-voice.js) como por el plugin de desarrollo de Vite.
// La API key vive SOLO en el servidor: nunca se expone al cliente.
// ─────────────────────────────────────────────────────────────

// Alias que Google mantiene apuntando al flash estable actual.
// Usamos el alias (no una versión fija) porque Google retira versiones
// concretas periódicamente: gemini-1.5-flash, 2.0-flash y 2.5-flash ya
// están retiradas. El alias evita tener que reparar esto cada vez.
export const GEMINI_MODEL = 'gemini-flash-latest';

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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: buildPrompt(command, membersText) }] }],
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
  });
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey };

  // Reintento breve solo para errores transitorios (sobrecarga/cuota momentánea).
  const TRANSIENT = new Set([429, 500, 502, 503, 504]);
  const MAX_ATTEMPTS = 2;
  let resp;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    resp = await fetch(url, { method: 'POST', headers, body });
    if (resp.ok) break;

    const details = await resp.text();
    if (TRANSIENT.has(resp.status) && attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }
    // Propaga el error REAL de Gemini (key inválida, modelo no encontrado, cuota, etc.)
    const err = new Error(`Gemini API ${resp.status}: ${details.slice(0, 500)}`);
    err.status = resp.status;
    err.code = 'GEMINI_ERROR';
    throw err;
  }

  const data = await resp.json();
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return extractJson(textContent);
}
