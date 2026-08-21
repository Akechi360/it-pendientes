// Función serverless de Vercel: cliente -> /api/parse-voice -> Gemini.
// La API key (GEMINI_API_KEY) vive SOLO aquí, en el servidor.
import { parseVoiceWithGemini } from './_lib/parseVoice.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { command, membersText } = req.body || {};

  if (!command) {
    return res.status(400).json({ error: 'Missing command' });
  }

  // Preferimos GEMINI_API_KEY (server-only). Mantenemos VITE_ como
  // compatibilidad hacia atrás, pero lo correcto es la primera.
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  try {
    const data = await parseVoiceWithGemini({ command, membersText, apiKey });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      error: error.code || 'INTERNAL_ERROR',
      details: String(error.message || error),
    });
  }
}
