import { test, expect } from '@playwright/test';
import { clearDb, waitForApp } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearDb(page);
  await page.reload();
  await waitForApp(page);
});

test('19.1 global refs link present in library', async ({ page }) => {
  await expect(page.getByText('Global Refs')).toBeVisible();
});

test('19.2 global refs page loads', async ({ page }) => {
  await page.getByText('Global Refs').click();
  await expect(page.getByText(/global references/i)).toBeVisible({ timeout: 5000 });
});

test('19.3 global refs search bar visible', async ({ page }) => {
  await page.getByText('Global Refs').click();
  await expect(page.getByPlaceholder(/filter by tag or article title/i)).toBeVisible({ timeout: 5000 });
});

test('19.4 add manual ref in global refs', async ({ page }) => {
  await page.getByText('Global Refs').click();
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await expect(page.getByText(/no title/i)).toBeVisible({ timeout: 3000 });
});

test('19.5 select all and select none work', async ({ page }) => {
  await page.getByText('Global Refs').click();
  await page.getByRole('button', { name: '+ Add Manual' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Select All' }).click();
  const checkbox = page.locator('input[type="checkbox"]').first();
  await expect(checkbox).toBeChecked();
  await page.getByRole('button', { name: 'Select None' }).click();
  await expect(checkbox).not.toBeChecked();
});
