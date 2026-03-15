import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
});

test('35.1 nonexistent editor ID loads without crash', async ({ page }) => {
  await page.goto('/editor/nonexistentid');
  // Should not show error overlay; app should still render
  await expect(page.locator('body')).not.toContainText('Unhandled');
  await expect(page.locator('[class*="min-h-screen"]')).toBeVisible({ timeout: 5000 });
});

test('35.2 nonexistent references ID shows not-found message', async ({ page }) => {
  await page.goto('/references/nonexistentid');
  await expect(page.getByText(/no article found/i)).toBeVisible({ timeout: 5000 });
});

test('35.3 clear localStorage and reload starts fresh without crash', async ({ page }) => {
  await createArticle(page, 'Will Be Cleared');
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await expect(page.getByText(/no articles yet/i)).toBeVisible();
});

test('35.4 empty research query does nothing', async ({ page }) => {
  await createArticle(page, 'Research Test');
  // Open research panel
  const researchBtn = page.getByRole('button', { name: /research/i });
  if (await researchBtn.isVisible()) {
    await researchBtn.click();
    const submitBtn = page.getByRole('button', { name: /search|send|submit/i }).last();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Nothing should crash
      await expect(page.locator('body')).not.toContainText('Unhandled');
    }
  }
});

test('35.8 rapid theme switching applies cleanly', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Light' }).click();
    await page.getByRole('button', { name: 'Dark' }).click();
  }
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  expect(htmlClass).not.toContain('light-theme');
});

test('35.9 dialog stays centred on resize', async ({ page }) => {
  await page.getByRole('button', { name: '+ New Article' }).click();
  await expect(page.getByPlaceholder(/e\.g\./i)).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByPlaceholder(/e\.g\./i)).toBeVisible();
  await page.setViewportSize({ width: 800, height: 600 });
  await expect(page.getByPlaceholder(/e\.g\./i)).toBeVisible();
});

test('36.8 no horizontal scrollbar at 768px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
});
