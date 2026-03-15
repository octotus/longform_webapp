import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle, typeInEditor } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await createArticle(page, 'Editor Test');
});

test('6.1 editor page has back button', async ({ page }) => {
  await expect(page.getByRole('button', { name: '← Back' })).toBeVisible();
});

test('6.2 editor page shows article title in input', async ({ page }) => {
  await expect(page.getByPlaceholder('Title required')).toBeVisible();
  const val = await page.getByPlaceholder('Title required').inputValue();
  expect(val).toBe('Editor Test');
});

test('6.3 CodeMirror editor is visible', async ({ page }) => {
  await expect(page.locator('.cm-editor')).toBeVisible();
});

test('6.4 toolbar is visible', async ({ page }) => {
  await expect(page.getByTitle('Bold')).toBeVisible();
  await expect(page.getByTitle('Italic')).toBeVisible();
});

test('6.5 references link present', async ({ page }) => {
  await expect(page.locator('a[href*="/references/"]')).toBeVisible();
});

test('6.6 focus mode link present', async ({ page }) => {
  await expect(page.locator('a[href*="/focus/"]')).toBeVisible();
});

test('7.1 typing in editor updates content', async ({ page }) => {
  await typeInEditor(page, 'Hello world');
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('Hello');
});

test('7.2 word count updates after typing', async ({ page }) => {
  await typeInEditor(page, 'One two three four five');
  await page.waitForTimeout(500);
  await expect(page.locator('span').filter({ hasText: /\d+ words?/i }).first()).toBeVisible();
});

test('7.3 title change persists to library', async ({ page }) => {
  const titleInput = page.getByPlaceholder('Title required');
  await titleInput.clear();
  await titleInput.fill('Renamed Article');
  await titleInput.press('Tab');
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);
  await expect(page.getByText('Renamed Article')).toBeVisible();
});

test('7.4 back button returns to library', async ({ page }) => {
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('heading', { name: 'Likhatu' })).toBeVisible();
});

test('7.5 F5 hard reload retains content', async ({ page }) => {
  await typeInEditor(page, 'Persisted content');
  await page.waitForTimeout(3500);
  await page.reload();
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 10000 });
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('Persisted');
});
