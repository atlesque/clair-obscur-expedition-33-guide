import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('cycles auto, light, and dark themes and remembers the choice', async ({ page }) => {
  const theme = page.getByRole('button', { name: /Theme:/ });

  await expect(theme).toHaveAccessibleName('Theme: Auto. Switch to Light.');
  await theme.click();
  await expect(theme).toHaveAccessibleName('Theme: Light. Switch to Dark.');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(245, 242, 236)');

  await theme.click();
  await expect(theme).toHaveAccessibleName('Theme: Dark. Switch to Auto.');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(21, 23, 22)');

  await page.reload();
  await expect(page.getByRole('button', { name: /Theme: Dark/ })).toBeVisible();

  await page.getByRole('button', { name: /Theme: Dark/ }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(page.getByRole('button', { name: /Theme: Auto/ })).toBeVisible();
});
