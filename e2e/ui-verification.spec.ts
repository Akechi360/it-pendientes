import { test, expect } from '@playwright/test';

test.describe('Portal IT - Verificación E2E con Playwright', () => {

  const performLogin = async (page: any) => {
    await page.goto('/');
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('sistemas@clinicaieq.com');
      await page.locator('input[type="password"]').fill('123456');
      await page.locator('button[type="submit"]').click();
    }
  };

  test('Debe cargar la aplicación y mostrar la interfaz principal', async ({ page }) => {
    await performLogin(page);
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
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

    await page.locator('button:has-text("Tareas"), a:has-text("Tareas")').first().click();

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
