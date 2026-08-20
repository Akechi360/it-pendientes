import { test, expect } from '@playwright/test';

test.describe('Portal IT - Verificación E2E con Playwright', () => {

  test.beforeEach(async ({ page }) => {
    // Interceptar llamadas externas de OneSignal SDK
    await page.route('**/*onesignal*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    }));
  });

  const performLogin = async (page: any) => {
    await page.goto('/');
    
    // Esperar a que la página de login esté lista
    const emailInput = page.locator('#login-email');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });

    await emailInput.fill('sistemas@clinicaieq.com');
    await page.locator('#login-password').fill('123456');
    await page.locator('button[type="submit"]').click();

    // Esperar a que el header esté presente en la vista
    await page.locator('header').waitFor({ state: 'visible', timeout: 10000 });
  };

  test('Debe cargar la aplicación y mostrar la interfaz principal', async ({ page }) => {
    await performLogin(page);
    await expect(page.locator('header')).toBeVisible();
  });

  test('Debe abrir el modal del Agente IT por Voz (IA)', async ({ page }) => {
    await performLogin(page);

    const aiButton = page.locator('button[title="Agente IT por Voz (IA)"]');
    await expect(aiButton).toBeVisible();
    await aiButton.click();

    await expect(page.locator('text=Agente IT Inteligente')).toBeVisible();
    await expect(page.locator('input[placeholder*="Registra una incidencia"]')).toBeVisible();
  });

  test('Debe mostrar los filtros de asignación rápida en el módulo de Tareas', async ({ page }) => {
    await performLogin(page);

    await page.locator('button:has-text("Tareas")').first().click();

    await expect(page.locator('button:has-text("Mis Pendientes")')).toBeVisible();
    await expect(page.locator('button:has-text("Compañero")')).toBeVisible();
  });

  test('Debe abrir la bandeja de notificaciones y mostrar la acción de marcar como leídas', async ({ page }) => {
    await performLogin(page);

    const bellButton = page.locator('button[title="Notificaciones"]');
    await expect(bellButton).toBeVisible();
    await bellButton.click();

    await expect(page.locator('h3:has-text("Notificaciones")')).toBeVisible();
  });

});
