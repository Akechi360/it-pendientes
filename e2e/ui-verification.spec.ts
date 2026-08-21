import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────
// Verificación E2E del Agente IT por Voz.
//
// En lugar de depender de la persistencia real de Supabase + Realtime
// (no determinista), INTERCEPTAMOS la escritura (POST /rest/v1/incidents)
// y verificamos EXACTAMENTE qué título persiste la UI. Así probamos que:
//   - Camino IA: la UI usa el título SINTETIZADO por Gemini.
//   - Fallback: si la IA falla, avisa y el parser local produce un título
//     limpio (nunca con frases de control como "asigna esta incidencia...").
//
// El test anterior era un falso positivo: pasaba por el regex local aunque
// Gemini estuviera roto, y asertaba "Eduardo Toro" que ya está en el sidebar.
// ─────────────────────────────────────────────────────────────

const COMMAND =
  'Se cayó el wi-fi en la habitación 2 de hospitalización asigna esta incidencia como urgente a Eduardo';

const SYNTHESIZED_TITLE = 'Fallo de Cobertura Wi-Fi en Habitación 2 de Hospitalización';

const performLogin = async (page: any) => {
  await page.goto('/');
  const emailInput = page.locator('#login-email');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('sistemas@clinicaieq.com');
  await page.locator('#login-password').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.locator('header').waitFor({ state: 'visible', timeout: 10000 });
};

const openVoiceAgentAndSubmit = async (page: any, command: string) => {
  await page.locator('button[title="Agente IT por Voz (IA)"]').click();
  const input = page.locator('#voice-command-input');
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(command);
  await page.locator('#voice-command-submit').click();
};

test.describe('Portal IT - Agente de Voz (IA)', () => {
  // Devuelve un objeto que capturará el título persistido para el incidente.
  const stubWrites = async (page: any) => {
    const captured: { incidentTitle: string | null } = { incidentTitle: null };

    // Interceptar SOLO los POST de escritura; los GET (carga inicial) siguen normales.
    await page.route('**/rest/v1/incidents*', async (route: any) => {
      const req = route.request();
      if (req.method() === 'POST') {
        try {
          const body = JSON.parse(req.postData() || '[]');
          captured.incidentTitle = Array.isArray(body) ? body[0]?.title ?? null : body?.title ?? null;
        } catch { /* ignore */ }
        return route.fulfill({ status: 201, contentType: 'application/json', body: '[]' });
      }
      return route.continue();
    });

    // Neutralizar el resto de escrituras y el push para aislar la lógica.
    for (const table of ['notifications', 'activity_logs']) {
      await page.route(`**/rest/v1/${table}*`, (route: any) =>
        route.request().method() === 'POST'
          ? route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
          : route.continue()
      );
    }
    await page.route('**/api/send-push', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
    );
    await page.route('**/*onesignal*', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
    );

    return captured;
  };

  test('Camino IA: persiste el título sintetizado por Gemini, no el dictado crudo', async ({ page }) => {
    const captured = await stubWrites(page);

    // Mock determinista de la IA: título profesional sintetizado.
    await page.route('**/api/parse-voice', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            entityType: 'incident',
            title: SYNTHESIZED_TITLE,
            description: 'Se reporta caída de señal Wi-Fi en la habitación 2 del área de hospitalización.',
            priority: 'critica',
            category: 'redes',
            assigneeUid: null,
            assigneeName: null,
          },
        }),
      })
    );

    await performLogin(page);
    await openVoiceAgentAndSubmit(page, COMMAND);

    // La UI debe persistir EXACTAMENTE el título sintetizado por la IA.
    await expect.poll(() => captured.incidentTitle, { timeout: 10000 }).toBe(SYNTHESIZED_TITLE);
    expect(captured.incidentTitle?.toLowerCase()).not.toContain('asigna esta incidencia');
  });

  test('Fallback: si la IA falla, avisa y persiste un título limpio (sin frases de control)', async ({ page }) => {
    const captured = await stubWrites(page);

    // Simular fallo de la IA (p. ej. key/model inválidos) → 500.
    await page.route('**/api/parse-voice', (route: any) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'GEMINI_ERROR', details: 'HTTP 400 API_KEY_INVALID' }),
      })
    );

    await performLogin(page);
    await openVoiceAgentAndSubmit(page, COMMAND);

    // 1. Aviso visible de degradación (fin de la degradación silenciosa).
    await expect(page.locator('text=IA no disponible').first()).toBeVisible({ timeout: 8000 });

    // 2. Aun con fallback, el título persistido no contiene frases de control.
    await expect.poll(() => captured.incidentTitle, { timeout: 10000 }).not.toBeNull();
    expect(captured.incidentTitle?.toLowerCase()).not.toContain('asigna esta incidencia');
  });
});
