import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle, typeInEditor } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
});

// Section 32: Persistence
test('32.1 articles persist across reload', async ({ page }) => {
  await createArticle(page, 'Persist Me');
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);
  await page.reload();
  await waitForApp(page);
  await expect(page.getByText('Persist Me')).toBeVisible();
});

test('32.2 article title persists', async ({ page }) => {
  await createArticle(page, 'Title Persists');
  await page.getByRole('button', { name: '← Back' }).click();
  await page.reload();
  await waitForApp(page);
  await expect(page.getByText('Title Persists')).toBeVisible();
});

test('32.4 settings persist across reload', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Light' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 });
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  expect(htmlClass).toContain('light-theme');
});

// Section 33: Content bleed
test('33.1 article B shows empty content not A content', async ({ page }) => {
  await createArticle(page, 'Article A');
  await typeInEditor(page, 'Content of Article A');
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);

  await createArticle(page, 'Article B');
  const content = await page.locator('.cm-content').innerText();
  expect(content.trim()).toBe('');
});

test('33.3 direct URL navigation loads correct article', async ({ page }) => {
  await createArticle(page, 'Direct Nav Article');
  const url = page.url();
  await page.goto('/');
  await waitForApp(page);
  await page.goto(url);
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 10000 });
  const val = await page.getByPlaceholder('Title required').inputValue();
  expect(val).toBe('Direct Nav Article');
});

// Section 34: Navigation
test('34.1 library to editor to back', async ({ page }) => {
  await createArticle(page, 'Nav Test');
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('heading', { name: 'Longform' })).toBeVisible();
});

test('34.2 library to settings to back', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('heading', { name: 'Longform' })).toBeVisible();
});

test('34.3 library to corpus to back', async ({ page }) => {
  await page.getByRole('link', { name: 'Corpus' }).click();
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('heading', { name: 'Longform' })).toBeVisible();
});

test('34.4 editor to references to back', async ({ page }) => {
  await createArticle(page, 'Refs Nav Test');
  await page.locator('a[href*="/references/"]').click();
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 5000 });
});

test('34.7 browser forward after back', async ({ page }) => {
  await createArticle(page, 'Forward Test');
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);
  await page.goBack();
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 5000 });
});
