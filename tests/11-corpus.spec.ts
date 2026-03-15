import { test, expect } from '@playwright/test';
import { clearDb, waitForApp } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await page.getByText('Corpus').click();
  await expect(page.getByRole('heading', { name: /corpus/i })).toBeVisible({ timeout: 5000 });
});

test('20.1 corpus page loads with back button', async ({ page }) => {
  await expect(page.getByRole('button', { name: '← Back' })).toBeVisible();
});

test('20.2 add document title field visible', async ({ page }) => {
  await expect(page.getByPlaceholder(/document title/i)).toBeVisible();
});

test('20.3 URL input field present', async ({ page }) => {
  await expect(page.getByPlaceholder(/example\.com/i)).toBeVisible();
});

test('21.1 URL input enables add button when filled', async ({ page }) => {
  const urlInput = page.getByPlaceholder(/example\.com/i);
  const addBtn = page.getByRole('button', { name: /^Add$/ });
  await expect(addBtn).toBeDisabled();
  await urlInput.fill('https://example.com/article.txt');
  await expect(addBtn).toBeEnabled();
});

test('21.3 add button disabled without url', async ({ page }) => {
  const addBtn = page.getByRole('button', { name: /^Add$/ });
  await expect(addBtn).toBeDisabled();
});

test('22.1 file upload input has correct accept attribute', async ({ page }) => {
  const fileInput = page.locator('input[type="file"]');
  const accept = await fileInput.getAttribute('accept');
  expect(accept).toBeTruthy();
});

test('corpus back button returns to library', async ({ page }) => {
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('heading', { name: 'Likhitu' })).toBeVisible();
});
