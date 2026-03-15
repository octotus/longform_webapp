import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
});

test('2.1 header shows correct nav items', async ({ page }) => {
  await expect(page.getByRole('button', { name: '+ New Article' })).toBeVisible();
  await expect(page.getByText('Global Refs')).toBeVisible();
  await expect(page.getByText('Corpus')).toBeVisible();
  await expect(page.getByText('Settings')).toBeVisible();
});

test('2.2 empty state message shown', async ({ page }) => {
  await expect(page.getByText(/no articles yet/i)).toBeVisible();
});

test('2.3 search bar visible with placeholder', async ({ page }) => {
  await expect(page.getByPlaceholder(/search articles/i)).toBeVisible();
});

test('2.4 sort dropdown visible', async ({ page }) => {
  await expect(page.getByRole('combobox')).toBeVisible();
});

test('3.1 new article dialog opens', async ({ page }) => {
  await page.getByRole('button', { name: '+ New Article' }).click();
  await expect(page.getByPlaceholder(/e\.g\.|Role of Sleep/i)).toBeVisible();
});

test('3.2 article created and editor opens', async ({ page }) => {
  await createArticle(page, 'Test Article');
  await expect(page.locator('.cm-editor')).toBeVisible();
});

test('3.3 article appears in library after creation', async ({ page }) => {
  await createArticle(page, 'My Test Article');
  await page.getByRole('button', { name: '← Back' }).click();
  await waitForApp(page);
  await expect(page.getByText('My Test Article')).toBeVisible();
});

test('3.4 empty title does not create article', async ({ page }) => {
  await page.getByRole('button', { name: '+ New Article' }).click();
  await expect(page.getByPlaceholder(/e\.g\.|Role of Sleep/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Article' })).toBeDisabled();
});

test('3.5 Escape closes new article dialog', async ({ page }) => {
  await page.getByRole('button', { name: '+ New Article' }).click();
  const input = page.getByPlaceholder(/e\.g\.|Role of Sleep/i);
  await expect(input).toBeVisible();
  await input.press('Escape');
  await expect(input).not.toBeVisible();
});
