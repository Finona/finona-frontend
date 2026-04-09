// Лаба 5 - E2E-тесты: SEO (мета-теги, canonical, JSON-LD)
import { test, expect } from '@playwright/test';

test.describe('SEO', () => {
  test('index.html has correct meta tags', async ({ page }) => {
    await page.goto('/auth');
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();

    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toBeTruthy();

    const ogType = await page.getAttribute('meta[property="og:type"]', 'content');
    expect(ogType).toBe('website');
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/auth');
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).toBeTruthy();
  });

  test('has JSON-LD structured data', async ({ page }) => {
    await page.goto('/auth');
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed['@type']).toBe('WebApplication');
  });

  test('has correct lang attribute', async ({ page }) => {
    await page.goto('/auth');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('ru');
  });

  test('404 page returns for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await expect(page.locator('text=404')).toBeVisible();
  });
});
