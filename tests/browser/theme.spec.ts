import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('cycles auto, light, and dark themes and remembers the choice', async ({ page }) => {
  const theme = page.getByRole('combobox', { name: 'Select theme' });

  await expect(theme).toHaveValue('auto');
  await theme.selectOption('light');
  await expect(theme).toHaveValue('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(245, 242, 236)');

  await theme.selectOption('dark');
  await expect(theme).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(21, 23, 22)');

  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Select theme' })).toHaveValue('dark');

  await page.getByRole('combobox', { name: 'Select theme' }).selectOption('auto');
  await expect(page.getByRole('combobox', { name: 'Select theme' })).toHaveValue('auto');
});
