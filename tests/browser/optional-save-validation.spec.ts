import { test, expect } from '@playwright/test';

const key = 'expedition-33-guide.v1';
test('preserves malformed optional records rather than mounting broken guidance', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create playthrough', exact: true }).click();
  const original = await page.evaluate(key => localStorage.getItem(key)!, key);
  const corruptions = [
    { unlockedSkills: 'not an array' },
    { skillSetupComplete: true, unlockedSkills: [], skillPoints: -1 },
    { weaponScaling: { vitality: 'Z' } },
    { loadout: ['not-owned'] },
    { discoveredSkillIds: [null] },
    { pendingSkill: { skillId: 'unknown' } },
  ];
  for (const patch of corruptions) {
    const save = JSON.parse(original);
    Object.assign(save.playthroughs[0].characters[0], patch);
    const raw = JSON.stringify(save);
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw });
    await page.reload();
    await expect(page.getByRole('alert')).toContainText('unreadable');
    await expect(page.getByRole('button', { name: 'Create playthrough', exact: true })).toBeDisabled();
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw);
  }
});

test('resumes older actual progress while dropping unverifiable pending advice', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create playthrough', exact: true }).click();
  await page.getByRole('button', { name: 'Get advice for Gustave' }).click();
  await expect(page.getByText('Pending recommendation', { exact: true })).toBeVisible();
  await page.evaluate(key => {
    const data = JSON.parse(localStorage.getItem(key)!);
    delete data.playthroughs[0].characters[0].pending.basePoints;
    localStorage.setItem(key, JSON.stringify(data));
  }, key);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Gustave', exact: true })).toBeVisible();
  await expect(page.getByText('Pending recommendation', { exact: true })).toHaveCount(0);
  await expect(page.getByText('3 attribute points available')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show Lune' }).click();
  await expect(page.getByText('3 attribute points available')).toHaveCount(1);
});
