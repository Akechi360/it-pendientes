import { test, expect } from '@playwright/test';

test.describe('Portal IT - Verificación E2E de IA y Notificaciones', () => {

  test.beforeEach(async ({ page }) => {
    // Mock de respuestas de red para OneSignal
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

  test('Debe procesar comando de voz complejo y extraer asignación a Eduardo y navegación limpia', async ({ page }) => {
    await performLogin(page);

    // Abrir modal de IA
    const aiButton = page.locator('button[title="Agente IT por Voz (IA)"]');
    await aiButton.click();

    const input = page.locator('#voice-command-input');
    await input.fill('Se cayó el wi-fi en hospitalización en la habitación de dos asignale esta incidencia de manera urgente a Eduardo');

    // Enviar comando
    await page.locator('#voice-command-submit').click();

    // Verificar que navega a incidencias y asignó a Eduardo Toro
    await expect(page.locator('text=Eduardo Toro').first()).toBeVisible({ timeout: 10000 });
  });

});
