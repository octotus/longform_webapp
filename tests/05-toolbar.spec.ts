import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle, typeInEditor } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await createArticle(page, 'Toolbar Test');
  await typeInEditor(page, 'sample text');
  await page.locator('.cm-content').press('Control+a');
});

test('8.1 bold wraps selection', async ({ page }) => {
  await page.getByTitle('Bold').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('**');
});

test('8.2 italic wraps selection', async ({ page }) => {
  await page.getByTitle('Italic').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('_');
});

test('8.3 strikethrough wraps selection', async ({ page }) => {
  await page.getByTitle('Strikethrough').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('~~');
});

test('8.4 H1 inserts heading prefix', async ({ page }) => {
  await page.locator('.cm-content').press('End');
  await page.keyboard.press('Enter');
  await page.getByTitle('Heading 1').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('# ');
});

test('8.5 H2 inserts heading prefix', async ({ page }) => {
  await page.locator('.cm-content').press('End');
  await page.keyboard.press('Enter');
  await page.getByTitle('Heading 2').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('## ');
});

test('8.6 blockquote inserts prefix', async ({ page }) => {
  await page.locator('.cm-content').press('End');
  await page.keyboard.press('Enter');
  await page.getByTitle('Blockquote').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('> ');
});

test('8.7 table inserts markdown table', async ({ page }) => {
  await page.locator('.cm-content').press('End');
  await page.getByTitle('Insert Table').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('|');
});

test('8.8 inline code wraps selection', async ({ page }) => {
  await page.getByTitle('Inline Code').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('`');
});

test('8.9 code block wraps selection', async ({ page }) => {
  await page.getByTitle('Code Block').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('```');
});

test('8.10 citation inserts [@ref]', async ({ page }) => {
  await page.locator('.cm-content').press('End');
  await page.getByTitle('In-text citation').click();
  const content = await page.locator('.cm-content').innerText();
  expect(content).toContain('[@ref]');
});

test('8.11 IMG button shows image panel', async ({ page }) => {
  await page.getByTitle('Insert Image').click();
  await expect(page.getByPlaceholder(/https:\/\/example.com\/image/i)).toBeVisible();
});

test('8.12 NLP panel toggle shows NLP Analysis', async ({ page }) => {
  await page.getByTitle('NLP Analysis').click();
  await expect(page.getByText('NLP Analysis')).toBeVisible();
});
