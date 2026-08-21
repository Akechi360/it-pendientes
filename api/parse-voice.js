export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { command, membersText } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Missing command' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY in server environment' });
  }

  try {
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres un asistente de IA para un Portal IT de una clínica. Analiza este dictado por voz en español: "${command}".

Miembros del equipo disponibles:
${membersText || '- Eduardo Toro\n- Manuel Pérez'}

REGLAS STRICTAS:
1. "title": Título técnico súper profesional y sintético del problema (máximo 6 palabras). Elimina COMPLETAMENTE las instrucciones de asignación (ej: "asignale esta incidencia a Eduardo", "urgente a Eduardo", "registra una incidencia...").
   - Ejemplo de voz: "Se cayó el wi-fi en hospitalización en la habitación de dos asignale esta incidencia de manera urgente a Eduardo"
   - Título correcto: "Fallo de Cobertura Wi-Fi en Habitación 2 de Hospitalización"
2. "description": Descripción técnica clara del problema reportado omitiendo las ordenes de asignación o meta-comandos.
3. "priority": "critica" si mencionan "urgente" o "crítica", si no "alta", "media" o "baja".
4. "assigneeUid" y "assigneeName": El usuario asignado si lo mencionan.

Responde ÚNICAMENTE con esta estructura JSON sin markdown:
{
  "entityType": "incident",
  "title": "string",
  "description": "string",
  "priority": "critica",
  "category": "redes",
  "assigneeUid": "string o null",
  "assigneeName": "string o null"
}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return res.status(aiResponse.status).json({ error: 'Gemini API Error', details: errText });
    }

    const aiData = await aiResponse.json();
    const textContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(textContent);

    return res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: String(error) });
  }
}
