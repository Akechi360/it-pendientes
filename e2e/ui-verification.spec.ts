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

  test('Debe procesar el comando "Se cayó el wi-fi en la habitación 2... asigna... a Eduardo" produciendo un título saneado', async ({ page }) => {
    await performLogin(page);

    const aiButton = page.locator('button[title="Agente IT por Voz (IA)"]');
    await aiButton.click();

    const input = page.locator('#voice-command-input');
    await input.fill('Se cayó el wi-fi en la habitación 2 de hospitalización asigna esta incidencia como urgente a Eduardo');

    await page.locator('#voice-command-submit').click();

    // 1. Verificar que navega a Incidencias
    await expect(page.locator('h1:has-text("Incidencias"), h2:has-text("Incidencias")').first()).toBeVisible({ timeout: 10000 });

    // 2. Verificar que se asignó a Eduardo Toro
    await expect(page.locator('text=Eduardo Toro').first()).toBeVisible({ timeout: 10000 });

    // 3. Verificar que la frase "asigna esta incidencia como urgente a Eduardo" FUE REMOVIDA del título en la lista
    const titleText = await page.locator('.font-semibold, h3, h4').first().textContent();
    console.log('[Playwright Test] Title in DOM:', titleText);
    expect(titleText).not.toContain('asigna esta incidencia como urgente a Eduardo');
  });

});
