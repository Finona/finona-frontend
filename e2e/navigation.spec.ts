// Лаба 5 - E2E-тесты: навигация и UI
import { test, expect } from '@playwright/test';

test.describe('Navigation and UI', () => {
  test('404 page has link to home', async ({ page }) => {
    await page.goto('/some-random-page');
    const link = page.locator('a[href="/"]');
    await expect(link).toBeVisible();
  });

  test('auth page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    expect(errors.length).toBe(0);
  });

  test('page has viewport meta tag', async ({ page }) => {
    await page.goto('/auth');
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(viewport).toContain('width=device-width');
  });
});
