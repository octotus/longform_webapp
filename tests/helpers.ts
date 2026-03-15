import { Page, expect } from '@playwright/test';

export async function clearDb(page: Page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      localStorage.removeItem(key);
    }
  });
}

export async function waitForApp(page: Page) {
  await expect(page.getByRole('heading', { name: 'Likhitu' })).toBeVisible({ timeout: 15000 });
}

export async function createArticle(page: Page, title: string) {
  await page.getByRole('button', { name: '+ New Article' }).click();
  // Input placeholder is the example sentence; find the active text input in the dialog
  await page.getByPlaceholder(/e\.g\.|Role of Sleep/i).fill(title);
  await page.getByRole('button', { name: 'Create Article' }).click();
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 10000 });
}

export async function goToLibrary(page: Page) {
  await page.goto('/');
  await waitForApp(page);
}

export async function typeInEditor(page: Page, text: string) {
  const editor = page.locator('.cm-content');
  await editor.click();
  await editor.type(text);
}
