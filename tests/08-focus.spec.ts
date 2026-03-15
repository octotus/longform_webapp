import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await createArticle(page, 'Focus Test');
});

test('12.1 focus mode link present in editor', async ({ page }) => {
  await expect(page.getByRole('link', { name: /focus/i })).toBeVisible();
});

test('12.2 focus mode page loads with duration buttons', async ({ page }) => {
  await page.getByRole('link', { name: /focus/i }).click();
  await expect(page.getByRole('button', { name: /15 min/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /30 min/i })).toBeVisible();
});

test('12.3 back button on focus setup returns to editor', async ({ page }) => {
  await page.getByRole('link', { name: /focus/i }).click();
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.locator('.cm-editor')).toBeVisible();
});

test('12.4 custom duration input visible', async ({ page }) => {
  await page.getByRole('link', { name: /focus/i }).click();
  await expect(page.getByPlaceholder(/custom.*30s|5m|25/i)).toBeVisible();
});

test('12.5 invalid custom duration shows error', async ({ page }) => {
  await page.getByRole('link', { name: /focus/i }).click();
  await page.getByPlaceholder(/custom.*30s|5m|25/i).fill('abc');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText(/enter a duration/i)).toBeVisible();
});

test('12.6 starting session navigates to editor with timer chip', async ({ page }) => {
  await page.getByRole('link', { name: /focus/i }).click();
  // Use a very short custom duration (30s = minimum)
  await page.getByPlaceholder(/custom.*30s|5m|25/i).fill('30s');
  await page.getByRole('button', { name: 'Start' }).click();
  // Should navigate to editor; chip or timer should be visible
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/:\d\d/)).toBeVisible();
});

test('12.7 focus page shows back button', async ({ page }) => {
  await page.getByRole('link', { name: /focus/i }).click();
  await expect(page.getByRole('button', { name: '← Back' })).toBeVisible();
});
