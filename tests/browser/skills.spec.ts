import { test, expect, type Page } from '@playwright/test';

const panel = (page: Page, index = 0) => page.locator('.guidance-tools').nth(index);
const card = (page: Page, index = 0) => page.locator('.character').nth(index);
async function setup(page: Page, index = 0) {
  await panel(page, index).getByRole('button', { name: 'Skill and weapon setup' }).click();
  return page.getByRole('dialog');
}
async function addNext(page: Page) {
  await page.getByRole('button', { name: /Add a character/ }).click();
  await page.getByRole('button', { name: 'Reveal character', exact: true }).click();
  await page.getByRole('button', { name: 'Add to playthrough', exact: true }).click();
  await page.getByRole('button', { name: 'Save progress', exact: true }).click();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create playthrough', exact: true }).click();
});

test('optional setup stays skipped, scaling persists, and cancelling drafts changes nothing', async ({ page }) => {
  await expect(panel(page).getByRole('button', { name: 'Get skill advice' })).toBeDisabled();
  await card(page).getByRole('button', { name: 'Get advice for Gustave' }).click();
  await expect(card(page)).toContainText('Equipped-weapon scaling is not considered');
  let dialog = await setup(page);
  await dialog.getByLabel('Luck scaling').selectOption('S');
  await dialog.getByRole('button', { name: 'Save scaling only' }).click();
  await expect(card(page).getByText('Pending recommendation', { exact: true })).toHaveCount(0);
  await expect(panel(page).getByRole('button', { name: 'Get skill advice' })).toBeDisabled();
  await page.reload();
  dialog = await setup(page);
  await expect(dialog.getByLabel('Luck scaling')).toHaveValue('S');
  await dialog.getByRole('button', { name: 'Continue skill setup' }).click();
  await dialog.getByLabel('Available skill points').fill('7');
  await dialog.getByLabel('Overcharge', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Set up later' }).click();
  await page.reload();
  await expect(panel(page).getByRole('button', { name: 'Get skill advice' })).toBeDisabled();
  await card(page).getByRole('button', { name: 'Get advice for Gustave' }).click();
  await expect(card(page)).toContainText(/scaling/i);
  await expect(card(page)).toContainText(/Luck/);
});

test('skill advice saves points, remains pending over reload, and confirms ownership exactly once', async ({ page }) => {
  let dialog = await setup(page);
  await dialog.getByRole('button', { name: 'Continue skill setup' }).click();
  await dialog.getByLabel('Lumière Assault', { exact: true }).check();
  await dialog.getByLabel('Overcharge', { exact: true }).check();
  await dialog.getByLabel('Available skill points').fill('0');
  await dialog.getByRole('button', { name: 'Save skill setup' }).click();
  await panel(page).getByRole('button', { name: 'Get skill advice' }).click();
  await expect(panel(page)).toContainText('Save your skill points');
  await expect(panel(page).getByRole('button', { name: "I've applied this skill" })).toHaveCount(0);
  dialog = await setup(page);
  await dialog.getByLabel('Available skill points').fill('1');
  await dialog.getByRole('button', { name: 'Save skill setup' }).click();
  await panel(page).getByRole('button', { name: 'Get skill advice' }).click();
  await expect(panel(page).locator('.advice')).toContainText('Marking Shot');
  await page.reload();
  await expect(panel(page)).toContainText('1 SP');
  await panel(page).getByRole('button', { name: "I've applied this skill" }).click();
  await expect(panel(page)).toContainText('0 SP');
  await expect(panel(page)).toContainText('Marking Shot');
  await expect(panel(page).getByRole('button', { name: "I've applied this skill" })).toHaveCount(0);
  await expect(panel(page).getByText(/Recorded loadout:/)).toHaveCount(0);
  await panel(page).getByRole('button', { name: 'Record suggested loadout' }).click();
  await expect(panel(page).getByText(/Recorded loadout:/)).toContainText('Marking Shot');
  dialog = await setup(page);
  await dialog.getByLabel('Marking Shot', { exact: true }).uncheck();
  await dialog.getByRole('button', { name: 'Save skill setup' }).click();
  await page.reload();
  await expect(panel(page).getByText(/Recorded loadout:/)).not.toContainText('Marking Shot');
  await expect(panel(page)).toContainText('0 SP');
});

test('later skills require deliberate discovery and stay scoped to their run', async ({ page }) => {
  await addNext(page);
  let dialog = await setup(page, 2);
  await dialog.getByRole('button', { name: 'Continue skill setup' }).click();
  await expect(dialog.getByText('Burning Canvas', { exact: true })).toHaveCount(0);
  await dialog.getByLabel('Spark', { exact: true }).check();
  await dialog.getByLabel('Percée', { exact: true }).check();
  await dialog.getByLabel('Offensive Switch', { exact: true }).check();
  await dialog.getByLabel('Available skill points').fill('1');
  await dialog.getByRole('button', { name: 'Save skill setup' }).click();
  await panel(page, 2).getByRole('button', { name: 'Get skill advice' }).click();
  await expect(panel(page, 2).locator('.advice')).toContainText('Swift Stride');
  await panel(page, 2).getByRole('button', { name: "I've applied this skill" }).click();
  await panel(page, 2).getByRole('button', { name: 'Record a discovered skill', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Burning Canvas', { exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'I discovered a skill', exact: true }).click();
  await dialog.getByLabel('Phantom Strike', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Save discovered skills' }).click();
  await page.reload();
  dialog = await setup(page, 2);
  await expect(dialog.getByLabel('Phantom Strike', { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('Phantom Strike', { exact: true })).not.toBeChecked();
  await expect(dialog.getByText('Burning Canvas', { exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Set up later' }).click();
  await page.getByRole('button', { name: 'Playthrough menu' }).click();
  await page.getByLabel('New playthrough name').fill('Separate skills');
  await page.getByRole('button', { name: 'Create independent playthrough' }).click();
  await expect(panel(page).getByRole('button', { name: 'Get skill advice' })).toBeDisabled();
  await addNext(page);
  dialog = await setup(page, 2);
  await dialog.getByRole('button', { name: 'Continue skill setup' }).click();
  await expect(dialog.getByText('Phantom Strike', { exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Set up later' }).click();
  await page.getByRole('button', { name: 'Playthrough menu' }).click();
  await page.getByRole('button', { name: 'My Expedition', exact: true }).click();
  await expect(panel(page, 2)).toContainText('Swift Stride');
  await expect(panel(page, 2)).toContainText('0 SP');
  await card(page, 2).getByRole('button', { name: 'Remove', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Playthrough menu' }).click();
  await page.getByRole('button', { name: 'Restore Maelle', exact: true }).click();
  await expect(panel(page, 2)).toContainText('Swift Stride');
  dialog = await setup(page, 2);
  await expect(dialog.getByLabel('Phantom Strike', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Set up later' }).click();
  await page.getByRole('button', { name: 'Playthrough menu' }).click();
  await page.getByRole('button', { name: 'Reset this playthrough', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Maelle', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Playthrough menu' }).click();
  await page.getByRole('button', { name: 'Separate skills', exact: true }).click();
  dialog = await setup(page, 2);
  await dialog.getByRole('button', { name: 'Continue skill setup' }).click();
  await expect(dialog.getByText('Phantom Strike', { exact: true })).toHaveCount(0);
});

test('learned-acquisition guidance records only actual skills and never spends skill points', async ({ page }) => {
  for (let step = 0; step < 4; step++) await addNext(page);
  const index = 5;
  const dialog = await setup(page, index);
  await dialog.getByRole('button', { name: 'Continue skill setup' }).click();
  await dialog.getByLabel('Learned skills', { exact: true }).fill('Lancelier Impale, Orphelin Cheers');
  await dialog.getByRole('button', { name: 'Save skill setup' }).click();
  await panel(page, index).getByRole('button', { name: 'Get skill advice' }).click();
  await expect(panel(page, index)).toContainText(/learn|encounter/i);
  await expect(panel(page, index).getByRole('button', { name: "I've applied this skill" })).toHaveCount(0);
  await panel(page, index).getByRole('button', { name: 'Record suggested loadout' }).click();
  await page.reload();
  await expect(panel(page, index).getByText(/Recorded loadout:/)).toContainText('Lancelier Impale');
  await expect(panel(page, index).getByText(/Recorded loadout:/)).toContainText('Orphelin Cheers');
});


test('validates optional inputs and clears obsolete attribute advice when scaling changes', async ({ page }) => {
  let dialog = await setup(page);
  await dialog.getByLabel('Vitality scaling').selectOption('A');
  await dialog.getByLabel('Might scaling').selectOption('B');
  await dialog.getByLabel('Luck scaling').selectOption('S');
  await dialog.getByRole('button', { name: 'Save scaling only' }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByLabel('Luck scaling').selectOption('');
  await dialog.getByRole('button', { name: 'Continue skill setup' }).click();
  await dialog.getByLabel('Available skill points').fill('-1');
  await dialog.getByRole('button', { name: 'Save skill setup' }).click();
  await expect(dialog.getByRole('alert')).toContainText('whole number');
  await dialog.getByRole('button', { name: 'Set up later' }).click();
  await card(page).getByRole('button', { name: 'Get advice for Gustave' }).click();
  dialog = await setup(page);
  await dialog.getByLabel('Luck scaling').selectOption('S');
  await dialog.getByRole('button', { name: 'Save scaling only' }).click();
  await expect(card(page).getByText('Pending recommendation', { exact: true })).toHaveCount(0);
  await expect(card(page)).toContainText('3 attribute points available');
  await card(page).getByRole('button', { name: 'Get advice for Gustave' }).click();
  await expect(card(page).locator('.advice')).toContainText(/Luck/);
  dialog = await setup(page);
  await dialog.getByLabel('Luck scaling').selectOption('');
  await dialog.getByRole('button', { name: 'Save scaling only' }).click();
  await expect(card(page).getByText('Pending recommendation', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(card(page)).toContainText('3 attribute points available');
});
