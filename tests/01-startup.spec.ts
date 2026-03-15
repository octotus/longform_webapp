import { test, expect } from '@playwright/test';
import { clearDb, waitForApp } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
});

test('1.1 page loads with no blank screen', async ({ page }) => {
  await waitForApp(page);
  await expect(page.locator('body')).not.toBeEmpty();
});

test('1.2 no red console errors on load', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await waitForApp(page);
  const jsErrors = errors.filter(e =>
    !e.includes('wasm') && !e.includes('WASM') && !e.includes('favicon')
  );
  expect(jsErrors).toHaveLength(0);
});

test('1.3 longform_db key present after load', async ({ page }) => {
  await waitForApp(page);
  const key = await page.evaluate(() => localStorage.getItem('longform_db'));
  expect(key).not.toBeNull();
});

test('1.4 longform-settings key written after first change', async ({ page }) => {
  await waitForApp(page);
  // Trigger a settings write by navigating to settings and toggling theme
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Dark' }).click();
  const key = await page.evaluate(() => localStorage.getItem('longform-settings'));
  expect(key).not.toBeNull();
});

test('1.5 default route shows Library page', async ({ page }) => {
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'Longform' })).toBeVisible();
});
