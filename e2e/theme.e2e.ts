import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const html = (page: Page) => page.locator('html');
const storedTheme = (page: Page) =>
  page.evaluate(() => window.localStorage.getItem('theme'));

test('dark mode toggles, persists across reloads and pages, and toggles back', async ({
  page,
}) => {
  await page.goto('/');
  await expect(html(page)).not.toHaveClass(/\bdark\b/);

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(html(page)).toHaveClass(/\bdark\b/);
  expect(await storedTheme(page)).toBe('dark');

  await page.reload();
  await expect(html(page)).toHaveClass(/\bdark\b/);

  await page.goto('/data-catalog');
  await expect(html(page)).toHaveClass(/\bdark\b/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Data Catalog' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(html(page)).not.toHaveClass(/\bdark\b/);
  expect(await storedTheme(page)).toBe('light');

  await page.reload();
  await expect(html(page)).not.toHaveClass(/\bdark\b/);
});
