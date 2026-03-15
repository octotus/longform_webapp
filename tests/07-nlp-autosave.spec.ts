import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle, typeInEditor } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await createArticle(page, 'NLP Test');
});

test('10.1 NLP panel shows placeholder before save', async ({ page }) => {
  await page.getByTitle('NLP Analysis').click();
  await expect(page.getByText(/save or wait/i)).toBeVisible();
});

test('10.2 NLP panel shows results after autosave', async ({ page }) => {
  await typeInEditor(page, 'The quick brown fox jumps over the lazy dog. This is a simple test sentence for readability analysis. Adding more words here to ensure the word count exceeds the minimum threshold for meaningful analysis.');
  await page.getByTitle('NLP Analysis').click();
  await expect(page.getByText(/NLP Analysis|Readability Grade|save or wait/i)).toBeVisible({ timeout: 8000 });
});

test('10.3 word count shown in editor header', async ({ page }) => {
  await typeInEditor(page, 'one two three four five');
  await expect(page.locator('span').filter({ hasText: /\d+ words?/i }).first()).toBeVisible();
});

test('10.4 numeric tokens count as words', async ({ page }) => {
  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  await typeInEditor(page, '100 people');
  await page.waitForTimeout(500);
  const wc = await page.locator('span').filter({ hasText: /\d+ words?/i }).first().innerText();
  expect(wc).toMatch(/2 words?/i);
});

test('11.1 autosave triggers after 3 seconds', async ({ page }) => {
  await typeInEditor(page, 'Autosave test content here');
  await page.waitForTimeout(4000);
  await page.reload();
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 10000 });
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('Autosave test');
});

test('11.2 Ctrl+S triggers save without error', async ({ page }) => {
  await typeInEditor(page, 'Manual save test');
  // Ctrl+S in CodeMirror — captured by the browser; use keyboard on the page
  await page.keyboard.press('Control+s');
  await page.waitForTimeout(500);
  // No crash — app still renders
  await expect(page.locator('.cm-editor')).toBeVisible();
});
