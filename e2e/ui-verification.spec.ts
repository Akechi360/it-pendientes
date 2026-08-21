import { test, expect } from '@playwright/test';

test.describe('Portal IT - Verificación E2E de IA y Notificaciones', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/*onesignal*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    }));
  });

  const performLogin = async (page: any) => {
    await page.goto('/');
    const emailInput = page.locator('#login-email');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('sistemas@clinicaieq.com');
    await page.locator('#login-password').fill('123456');
    await page.locator('button[type="submit"]').click();
    await page.locator('header').waitFor({ state: 'visible', timeout: 10000 });
  };

  test('Verificación de dictado de voz exacto de la imagen del usuario', async ({ page }) => {
    await performLogin(page);

    // Abrir Agente IA
    const aiButton = page.locator('button[title="Agente IT por Voz (IA)"]');
    await aiButton.click();

    const input = page.locator('#voice-command-input');
    await input.fill('Se cayó el wi-fi en la habitación 2 de hospitalización asigna esta incidencia como urgente a Eduardo');

    await page.locator('#voice-command-submit').click();

    // Esperar navegación a Incidencias
    await page.waitForSelector('text=Eduardo Toro', { timeout: 10000 });

    // Obtener las tarjetas de incidencia creadas
    const titles = await page.locator('.font-semibold, h3, h4').allTextContents();
    console.log('[Playwright Verification] Títulos en pantalla:', titles);

    // Verificar que NINGÚN título contenga la frase "asigna esta incidencia..."
    const dirtyTitle = titles.find(t => t.toLowerCase().includes('asigna esta incidencia'));
    expect(dirtyTitle).toBeUndefined();
  });

});
