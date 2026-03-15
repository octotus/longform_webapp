import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await createArticle(page, 'Article Alpha');
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);
});

test('4.1 article card shows title', async ({ page }) => {
  await expect(page.getByText('Article Alpha')).toBeVisible();
});

test('4.2 article card shows word count', async ({ page }) => {
  await expect(page.locator('span').filter({ hasText: /\d+ words?/i }).first()).toBeVisible();
});

test('4.3 article card shows modified date', async ({ page }) => {
  await expect(page.locator('span').filter({ hasText: /Modified/ }).first()).toBeVisible();
});

test('4.4 clicking article card opens editor', async ({ page }) => {
  await page.getByText('Article Alpha').click();
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 10000 });
});

test('4.5 delete article from library', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('Article Alpha')).not.toBeVisible();
});

test('5.1 search filters articles', async ({ page }) => {
  await page.getByRole('button', { name: '+ New Article' }).click();
  await page.getByPlaceholder(/e\.g\.|Role of Sleep/i).fill('Beta Article');
  await page.getByRole('button', { name: 'Create Article' }).click();
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);

  await page.getByPlaceholder(/search articles/i).fill('Alpha');
  await expect(page.getByText('Article Alpha')).toBeVisible();
  await expect(page.getByText('Beta Article')).not.toBeVisible();
});

test('5.2 clearing search restores all articles', async ({ page }) => {
  await page.getByPlaceholder(/search articles/i).fill('zzznomatch');
  await expect(page.getByText('Article Alpha')).not.toBeVisible();
  await page.getByPlaceholder(/search articles/i).clear();
  await expect(page.getByText('Article Alpha')).toBeVisible();
});

test('5.3 sort dropdown has expected options', async ({ page }) => {
  const dropdown = page.getByRole('combobox');
  const options = await dropdown.locator('option').allTextContents();
  expect(options.some(o => /modified|date|title/i.test(o))).toBe(true);
});
