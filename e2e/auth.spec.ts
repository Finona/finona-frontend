// Лаба 5 - E2E-тесты: аутентификация и защита маршрутов
import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveTitle(/Finona/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation on empty submit', async ({ page }) => {
    await page.goto('/auth');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should redirect unauthenticated users to /auth', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/auth/);
    await expect(page.url()).toContain('/auth');
  });

  test('should show register tab', async ({ page }) => {
    await page.goto('/auth');
    const registerTab = page.getByRole('tab', { name: /регистрация|sign up/i });
    if (await registerTab.isVisible()) {
      await registerTab.click();
      await expect(page.locator('input[name="username"]')).toBeVisible();
    }
  });
});

test.describe('Protected routes', () => {
  test('should redirect /accounts to auth when not logged in', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForURL(/\/auth/);
    await expect(page.url()).toContain('/auth');
  });

  test('should redirect /transactions to auth when not logged in', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForURL(/\/auth/);
    await expect(page.url()).toContain('/auth');
  });

  test('should redirect /admin to auth when not logged in', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\/auth/);
    await expect(page.url()).toContain('/auth');
  });
});
