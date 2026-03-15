import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle, typeInEditor } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await createArticle(page, 'Preview Test');
});

async function togglePreview(page: any) {
  await page.getByRole('button', { name: /preview/i }).click();
}

test('9.1 preview toggle button exists', async ({ page }) => {
  await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
});

test('9.2 switching to preview hides editor', async ({ page }) => {
  await togglePreview(page);
  await expect(page.locator('.cm-editor')).not.toBeVisible();
});

test('9.3 markdown renders as HTML in preview', async ({ page }) => {
  await typeInEditor(page, '# My Heading\n\nSome **bold** text');
  await page.waitForTimeout(500);
  await togglePreview(page);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('strong')).toBeVisible();
});

test('9.4 switching back to edit restores editor', async ({ page }) => {
  await togglePreview(page);
  await page.getByRole('button', { name: /edit/i }).click();
  await expect(page.locator('.cm-editor')).toBeVisible();
});

test('9.5 code block renders in preview', async ({ page }) => {
  await typeInEditor(page, '\n```\nconst x = 1;\n```');
  await page.waitForTimeout(500);
  await togglePreview(page);
  await expect(page.locator('code')).toBeVisible();
});

test('9.6 table renders in preview', async ({ page }) => {
  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  // Insert table via toolbar to ensure correct syntax
  await page.getByTitle('Insert Table').click();
  await page.waitForTimeout(300);
  await togglePreview(page);
  await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
});
