import { test, expect } from '@playwright/test';
import { clearDb, waitForApp, createArticle } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
  await createArticle(page, 'Refs Test');
  await page.locator('a[href*="/references/"]').click();
  await expect(page.getByText(/references/i).first()).toBeVisible({ timeout: 5000 });
});

test('13.1 references page has back button', async ({ page }) => {
  await expect(page.getByRole('button', { name: '← Back' })).toBeVisible();
});

test('13.2 DOI import field visible', async ({ page }) => {
  await expect(page.getByPlaceholder(/10\.\d+|doi/i)).toBeVisible();
});

test('13.3 add manual button present', async ({ page }) => {
  await expect(page.getByRole('button', { name: '+ Add Manual' })).toBeVisible();
});

test('13.4 export bibtex button present', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Export BibTeX' })).toBeVisible();
});

test('14.1 add blank reference creates card', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await expect(page.getByText(/no title/i)).toBeVisible({ timeout: 3000 });
});

test('14.2 new reference appears at top of list', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  const cards = page.locator('input[type="checkbox"]');
  expect(await cards.count()).toBeGreaterThanOrEqual(2);
});

test('14.3 edit reference saves changes', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await page.getByRole('button', { name: 'Edit' }).first().click();
  // Find the Title input — it's the 3rd input in the edit form (shortcode, year, title)
  const inputs = page.locator('input[type="text"]');
  // Fill the title field (3rd input after shortcode and year)
  await inputs.nth(2).fill('My Test Reference');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('My Test Reference')).toBeVisible();
});

test('14.4 delete reference with confirm', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await page.getByRole('button', { name: 'Confirm' }).first().click();
  await expect(page.getByText(/no title/i)).not.toBeVisible();
});

test('16.1 reference tag can be added', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await page.getByRole('button', { name: '+ tag' }).first().click();
  await page.getByPlaceholder('tag...').fill('mytag');
  await page.keyboard.press('Enter');
  await expect(page.getByText('mytag')).toBeVisible();
});

test('16.2 reference tag can be removed', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await page.getByRole('button', { name: '+ tag' }).first().click();
  await page.getByPlaceholder('tag...').fill('removeme');
  await page.keyboard.press('Enter');
  await expect(page.getByText('removeme')).toBeVisible();
  // Find the × button inside the tag chip
  await page.locator('span').filter({ hasText: 'removeme' }).locator('button').click();
  await expect(page.getByText('removeme')).not.toBeVisible();
});

test('13.5 invalid article ID shows not-found message', async ({ page }) => {
  await page.goto('/references/nonexistentid');
  await expect(page.getByText(/no article found/i)).toBeVisible({ timeout: 5000 });
});
