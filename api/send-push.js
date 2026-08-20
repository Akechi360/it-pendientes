export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { targetUserId, title, message } = req.body;

  if (!targetUserId || !title || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const appId = process.env.VITE_ONESIGNAL_APP_ID;
  const restApiKey = process.env.VITE_ONESIGNAL_REST_KEY;

  if (!appId || !restApiKey) {
    return res.status(500).json({ error: 'Missing OneSignal credentials' });
  }

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Key ' + restApiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        app_id: appId,
        target_channel: 'push',
        include_external_user_ids: [targetUserId],
        headings: { en: title, es: title },
        contents: { en: message, es: message },
      })
    });

    const responseData = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'OneSignal API Error', details: responseData });
    }

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
