export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { targetUserId, title, message, sendAfter } = req.body;

  if (!targetUserId || !title || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const appId = process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID || 'd1338b94-ffbe-4c72-8a96-b9ca075f7147';
  const restApiKey = process.env.ONESIGNAL_REST_KEY || process.env.VITE_ONESIGNAL_REST_KEY;

  if (!restApiKey) {
    console.error('[OneSignal Serverless] Falta la variable VITE_ONESIGNAL_REST_KEY u ONESIGNAL_REST_KEY en Vercel.');
    return res.status(500).json({ error: 'Missing OneSignal REST API Key' });
  }

  const buildPayload = (filtersOrInclude) => {
    const payload = {
      app_id: appId,
      target_channel: 'push',
      headings: { en: title, es: title },
      contents: { en: message, es: message },
      ...filtersOrInclude
    };
    if (sendAfter) {
      // OneSignal es súper estricto: requiere "YYYY-MM-DD HH:MM:SS GMT"
      // Si la IA manda un ISO 8601, lo formateamos exacto.
      const date = new Date(sendAfter);
      if (!isNaN(date.getTime())) {
        const pad = (n) => n.toString().padStart(2, '0');
        payload.send_after = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} GMT`;
      } else {
        payload.send_after = sendAfter;
      }
    }
    return payload;
  };

  try {
    // 1. Intentar envío por external_id con canal Push explícito (OneSignal API v9 & v11)
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Key ' + restApiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(buildPayload({
        include_external_user_ids: [targetUserId],
        channel_for_external_user_ids: 'push'
      }))
    });

    const responseData = await response.text();
    console.log('[OneSignal Serverless] Status:', response.status, 'Data:', responseData);

    let parsed = {};
    try { parsed = JSON.parse(responseData); } catch (e) {}

    // 2. Si no hay destinatarios por external_id o hay error, fallback al filtro por tag 'uid'
    if (!response.ok || parsed.recipients === 0) {
      console.log('[OneSignal Serverless] Fallback a filtro tag uid:', targetUserId);
      const fallbackResp = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Key ' + restApiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(buildPayload({
          filters: [{ field: 'tag', key: 'uid', relation: '=', value: targetUserId }]
        }))
      });
      const fallbackData = await fallbackResp.text();
      return res.status(fallbackResp.status).json({ success: fallbackResp.ok, data: fallbackData });
    }

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('[OneSignal Serverless Error]', error);
    return res.status(500).json({ error: 'Internal Server Error', details: String(error) });
  }
}
