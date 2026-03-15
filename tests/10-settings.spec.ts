import { test, expect } from '@playwright/test';
import { clearDb, waitForApp } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('25.1 appearance section visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Dark' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Light' })).toBeVisible();
});

test('25.2 switching to light theme applies class', async ({ page }) => {
  await page.getByRole('button', { name: 'Light' }).click();
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  expect(htmlClass).toContain('light-theme');
});

test('25.3 switching back to dark removes class', async ({ page }) => {
  await page.getByRole('button', { name: 'Light' }).click();
  await page.getByRole('button', { name: 'Dark' }).click();
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  expect(htmlClass).not.toContain('light-theme');
});

test('26.1 provider radio buttons present', async ({ page }) => {
  await expect(page.getByText('OpenAI').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/claude \(anthropic\)/i).first()).toBeVisible();
  await expect(page.getByText(/ollama \(local\)/i).first()).toBeVisible();
});

test('26.2 switching provider selects radio', async ({ page }) => {
  const claudeRadio = page.locator('input[type="radio"][value="CLAUDE"]');
  await claudeRadio.check();
  await expect(claudeRadio).toBeChecked();
});

test('28.1 OpenAI key field visible', async ({ page }) => {
  await expect(page.getByPlaceholder('sk-...')).toBeVisible();
});

test('28.2 Claude key field visible', async ({ page }) => {
  await expect(page.getByPlaceholder('sk-ant-...')).toBeVisible();
});

test('29.1 save button disabled initially', async ({ page }) => {
  const saveBtn = page.getByRole('button', { name: 'Save Settings' });
  await expect(saveBtn).toBeDisabled();
});

test('29.2 save button enabled after change', async ({ page }) => {
  await page.getByRole('button', { name: 'Light' }).click();
  const saveBtn = page.getByRole('button', { name: 'Save Settings' });
  await expect(saveBtn).toBeEnabled();
});

test('29.3 save button shows Saved and re-disables', async ({ page }) => {
  await page.getByRole('button', { name: 'Light' }).click();
  await page.getByRole('button', { name: 'Save Settings' }).click();
  await expect(page.getByRole('button', { name: 'Saved!' })).toBeVisible();
  await page.waitForTimeout(2500);
  await expect(page.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
});

test('30.1 backup now creates a slot', async ({ page }) => {
  await page.getByRole('button', { name: 'Backup Now' }).click();
  await expect(page.getByText('Latest')).toBeVisible();
});

test('30.2 auto-backup interval selector present', async ({ page }) => {
  await expect(page.getByText('Auto-backup interval')).toBeVisible();
  const select = page.locator('div').filter({ hasText: /auto-backup interval/i }).locator('select');
  await expect(select).toBeVisible();
});

test('30.3 restore from file input present', async ({ page }) => {
  await expect(page.getByText(/restore from file/i)).toBeVisible();
});

test('27.1 ollama base url field present', async ({ page }) => {
  await expect(page.getByPlaceholder(/localhost:11434/i)).toBeVisible();
});

test('27.2 fetch models button present', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Fetch Models' })).toBeVisible();
});

test('settings back button returns to library', async ({ page }) => {
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('heading', { name: 'Likhitu' })).toBeVisible();
});
