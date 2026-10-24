import { test, expect } from '@playwright/test';
async function chooseStart(page: import('@playwright/test').Page, mode = 'Start new expedition') {
  await page.getByRole('button', { name: mode, exact: false }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
async function pickWeapon(page: import('@playwright/test').Page, prefix: string, name: string) {
  await page.getByLabel('Equipped weapon', {exact:true}).fill(prefix);
  await page.getByRole('option', {name, exact:true}).click();
}
// One three-letter prefix per weapon pool, so the helper works for whichever character is on screen.
const POOL_PICKS = [['Aby','Abysseram'],['Col','Colim'],['Bat','Battlum'],['Alg','Algueron'],['Cor','Corpeso'],['Nus','Nusaro']];
async function enterWeapon(page: import('@playwright/test').Page) {
  const input = page.getByLabel('Equipped weapon', {exact:true});
  if (!(await input.count()) || await input.inputValue()) return;
  for (const [prefix, name] of POOL_PICKS) {
    await input.fill(prefix);
    const option = page.getByRole('option', {name, exact:true});
    if (await option.waitFor({timeout:500}).then(() => true, () => false)) { await option.click(); return; }
  }
  throw new Error('No weapon pool matched the current character.');
}
async function proceedSetup(page: import('@playwright/test').Page, name: string) {
  await enterWeapon(page);
  await page.getByRole('button', {name, exact:true}).click();
}
async function finishNewParty(page: import('@playwright/test').Page) {
  await proceedSetup(page, 'Continue');
  await proceedSetup(page, 'Continue');
  await proceedSetup(page, 'Create playthrough');
}
async function createNew(page: import('@playwright/test').Page) {
  await chooseStart(page);
  await finishNewParty(page);
}
async function saveCharacter(page: import('@playwright/test').Page) {
  await enterWeapon(page);
  await page.getByRole('button', {name:'Save progress', exact:true}).click();
}
test.beforeEach(async ({page}) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });
test('hides the current expedition control until a playthrough exists', async ({page}) => { await expect(page.getByRole('button',{name:'View all expeditions'})).toHaveCount(0); await createNew(page); await expect(page.getByRole('button',{name:'View all expeditions'})).toBeVisible(); });
test('uses dark card surfaces in dark theme', async ({page}) => { await page.evaluate(() => localStorage.setItem('expedition-33-guide.theme','dark')); await page.reload(); await createNew(page); await expect(page.locator('.character-card').first()).toHaveCSS('background-color','rgb(23, 22, 20)'); await expect(page.getByRole('button',{name:'Add a character'})).toHaveCSS('background-color','rgb(23, 22, 20)'); await expect(page.getByRole('button',{name:'Add a character'})).toHaveCSS('color','rgb(235, 231, 223)'); });
test('keeps setup controls readable in dark theme', async ({page}) => {
  await page.evaluate(() => localStorage.setItem('expedition-33-guide.theme','dark')); await page.reload();
  await page.getByRole('button',{name:/Start new expedition/}).click();
  await expect(page.getByLabel('Playthrough name')).toHaveCSS('background-color','rgb(32, 30, 27)');
  await expect(page.getByLabel('Playthrough name')).toHaveCSS('color','rgb(235, 231, 223)');
});
test('creates and reloads a named playthrough with initial party', async ({page}) => { await page.getByRole('button',{name:/Start new expedition/}).click(); await page.getByLabel('Playthrough name').fill('Night run'); await proceedSetup(page, 'Continue'); await finishNewParty(page); await expect(page.getByText('Night run',{exact:true})).toBeVisible(); await expect(page.getByRole('img',{name:'Gustave avatar'})).toBeVisible(); await expect(page.locator('.character-card__badges .level-tag').first()).toHaveText('LV 1'); await expect(page.locator('.character-card__badges .points-tag').first()).toHaveText('3 AP'); await expect(page.locator('.points-line')).toHaveCount(0); await expect(page.locator('.character-card__index')).toHaveCount(0); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); await page.reload(); await expect(page.getByText('Night run',{exact:true})).toBeVisible(); await expect(page.getByRole('heading',{name:'Gustave'})).toBeVisible(); });
test('manages expeditions from the current expedition control', async ({page}) => { await createNew(page); await page.getByRole('button',{name:'View all expeditions'}).click(); await page.getByLabel('New expedition').fill('Late run'); await page.getByRole('button',{name:'Add expedition'}).click(); await expect(page.getByText('Late run',{exact:true})).toBeVisible(); await page.getByRole('button',{name:'View all expeditions'}).click(); await page.getByRole('button',{name:/My Expedition/}).click(); await expect(page.getByText('My Expedition',{exact:true})).toBeVisible(); await page.getByRole('button',{name:'View all expeditions'}).click(); await page.getByRole('button',{name:'Rename'}).first().click(); await page.getByLabel('Expedition name').fill('First run'); await page.getByRole('button',{name:'Save', exact:true}).click(); await expect(page.getByRole('button',{name:'View all expeditions'}).getByText('First run',{exact:true})).toBeVisible(); await page.getByRole('button',{name:'Delete'}).last().click(); await expect(page.getByRole('dialog',{name:'Delete expedition?'})).toBeVisible(); await page.getByRole('button',{name:'Delete expedition'}).click(); await expect(page.getByText('Late run',{exact:true})).toHaveCount(0); });
test('cycles the always-visible theme control through auto, dark and light', async ({page}) => { const theme = page.getByRole('button',{name:/Theme:/}); await expect(theme).toHaveAttribute('data-theme-mode','auto'); await theme.click(); await expect(theme).toHaveAttribute('data-theme-mode','dark'); await expect(page.locator('html')).toHaveAttribute('data-theme','dark'); await theme.click(); await expect(theme).toHaveAttribute('data-theme-mode','light'); await expect(page.locator('html')).toHaveAttribute('data-theme','light'); await expect(page.locator('body')).toHaveCSS('background-color','rgb(246, 245, 242)'); await theme.click(); await expect(theme).toHaveAttribute('data-theme-mode','auto'); await page.reload(); await expect(page.getByRole('button',{name:/Theme: Auto/})).toBeVisible(); });
test('deleting the only saved expedition returns to blank setup', async ({page}) => { await createNew(page); await page.getByRole('button',{name:'View all expeditions'}).click(); await expect(page.getByRole('button',{name:'Delete'})).toBeEnabled(); await page.getByRole('button',{name:'Delete'}).click(); await expect(page.getByRole('dialog',{name:'Delete expedition?'})).toBeVisible(); await page.getByRole('button',{name:'Delete expedition'}).click(); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeVisible(); await expect(page.getByRole('button',{name:'View all expeditions'})).toHaveCount(0); await page.reload(); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeVisible(); await expect(page.getByRole('button',{name:'View all expeditions'})).toHaveCount(0); });
test('keeps advice pending through reload and confirms once', async ({page}) => { await createNew(page); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.reload(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.getByRole('button',{name:"I've applied these"}).click(); await expect(page.getByText('Applied recommendation recorded once.')).toBeVisible(); });
test('dismisses pending advice and persists the dismissal', async ({page}) => { await createNew(page); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.getByRole('button',{name:'Dismiss advice'}).click(); await expect(page.getByText('Pending recommendation')).toHaveCount(0); await page.reload(); await expect(page.getByText('Pending recommendation')).toHaveCount(0); });
test('uses anonymous reveal dialog and preserves cancellation', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.focus(); await add.press('Enter'); await expect(page.getByRole('dialog')).toHaveAccessibleName('Continue your expedition?'); await expect(page.getByText(/Only continue if someone new/)).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await expect(page.getByText(/The next character is/)).toBeVisible(); await page.getByRole('button',{name:'Cancel'}).click(); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(add).toBeVisible(); });
test('does not overwrite malformed saved data', async ({page}) => { await page.evaluate(() => localStorage.setItem('expedition-33-guide.v1','not-json')); await page.reload(); await expect(page.getByRole('alert')).toContainText('saved playthrough could not be read'); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeDisabled(); await expect(page.evaluate(() => localStorage.getItem('expedition-33-guide.v1'))).resolves.toBe('not-json'); });
test('shows an honest failure when storage becomes unwritable', async ({page}) => { await page.evaluate(() => { const original=Storage.prototype.setItem; Storage.prototype.setItem=function(){ throw new Error('blocked'); }; (window as any).__restore=()=>Storage.prototype.setItem=original; }); await createNew(page); await expect(page.getByRole('alert')).toContainText('could not save'); });
test('supports direct catch-up, correction, confirmation and reload', async ({page}) => { await createNew(page); await page.locator('.character-card').getByRole('button',{name:'Update progress'}).first().click(); await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('15'); await page.getByRole('spinbutton',{name:'Available attribute points',exact:true}).fill('30'); await saveCharacter(page); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.locator('.character-card').getByRole('button',{name:'Update progress'}).first().click(); await page.getByRole('spinbutton',{name:'Available attribute points',exact:true}).fill('5'); await saveCharacter(page); await expect(page.getByText('Pending recommendation')).toHaveCount(0); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await page.reload(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.getByRole('button',{name:"I've applied these"}).first().click(); await page.reload(); await expect(page.getByText('Pending recommendation')).toHaveCount(0); });
test('adds sequentially only after setup and retires the add control once nobody is left', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.getByRole('button',{name:'Cancel'}).last().click(); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(0); for(let i=0;i<4;i++){ await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await saveCharacter(page); } await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await expect(page.getByText('No additional character is available right now.')).toBeVisible(); await page.getByRole('button',{name:'Cancel'}).click(); await expect(add).toHaveCount(0); await page.reload(); await expect(page.getByRole('heading',{name:'Monoco',exact:true})).toBeVisible(); await expect(add).toHaveCount(0); });
test('cancelling later-character setup does not append a duplicate on retry', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.getByRole('button',{name:'Cancel'}).last().click(); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await saveCharacter(page); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(1); });
test('recovers later-character setup after a failed save without duplicating or advancing', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.evaluate(() => { const original=Storage.prototype.setItem; let fail=true; Storage.prototype.setItem=function(key,value){ if(fail){ fail=false; throw new Error('blocked once'); } return original.call(this,key,value); }; (window as any).__restore=()=>Storage.prototype.setItem=original; }); await saveCharacter(page); await expect(page.getByRole('alert')).toContainText('could not save'); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(0); await page.evaluate(() => (window as any).__restore()); await saveCharacter(page); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(1); await page.reload(); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(1); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await expect(page.getByText(/The next character is Sciel/)).toBeVisible(); });
test('rejects malformed nested saves without overwriting raw data', async ({page}) => { const raw='{"version":1,"activeId":"p","playthroughs":[{"id":"p","name":"x","characters":[{"id":"gustave","name":"Gustave","level":0}]}]}'; await page.evaluate(raw => localStorage.setItem('expedition-33-guide.v1', raw), raw); await page.reload(); await expect(page.getByRole('alert')).toContainText('unreadable'); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeDisabled(); await expect(page.evaluate(() => localStorage.getItem('expedition-33-guide.v1'))).resolves.toBe(raw); });
test('shows accessible validation for invalid progress and restores focus', async ({page}) => { await createNew(page); const update=page.locator('.character-card').getByRole('button',{name:'Update progress'}).first(); await update.click(); await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toBeFocused(); await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('0'); await saveCharacter(page); await expect(page.getByRole('alert')).toContainText('whole numbers'); await page.getByRole('button',{name:'Cancel'}).click(); await expect(update).toBeFocused(); });
test('starts with a single choice and preserves names when going back', async ({page}) => {
  await expect(page.getByRole('heading',{name:'Where are you starting?'})).toBeVisible();
  await expect(page.getByLabel('Playthrough name')).toHaveCount(0);
  await page.getByRole('button',{name:/Start new expedition/}).click();
  await page.getByLabel('Playthrough name').fill('Evening expedition');
  await proceedSetup(page, 'Continue');
  await expect(page.getByRole('heading',{name:'Who’s in your party?'})).toBeFocused();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByLabel('Playthrough name')).toHaveValue('Evening expedition');
  await page.getByLabel('Playthrough name').fill(' ');
  await proceedSetup(page, 'Continue');
  await expect(page.getByRole('alert')).toContainText('Enter a name');
});
test('supports midway entry one character at a time with custom number controls', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await proceedSetup(page, 'Continue');
  await expect(page.getByRole('heading',{name:'Gustave’s progress'})).toBeFocused();
  await expect(page.getByRole('heading',{name:'Lune’s progress'})).toHaveCount(0);
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('12');
  await page.getByRole('button',{name:'Increase Available attribute points',exact:true}).click();
  await page.getByRole('button',{name:'Increase Vitality',exact:true}).click();
  await expect(page.getByRole('spinbutton',{name:'Vitality',exact:true})).toHaveValue('1');
  await page.getByRole('button',{name:'Decrease Vitality',exact:true}).click();
  await expect(page.getByRole('button',{name:'Decrease Vitality',exact:true})).toBeDisabled();
  await page.getByRole('spinbutton',{name:'Might',exact:true}).fill('99');
  await expect(page.getByRole('button',{name:'Increase Might',exact:true})).toBeDisabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await proceedSetup(page, 'Continue');
  await expect(page.getByRole('heading',{name:'Lune’s progress'})).toBeVisible();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toHaveValue('12');
  await proceedSetup(page, 'Continue');
  await proceedSetup(page, 'Create playthrough');
  await expect(page.getByText('LV 12')).toBeVisible();
  await expect(page.getByLabel('1 attribute points available',{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByText('LV 12')).toBeVisible();
});
test('clears deselected midway drafts before reselecting', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await proceedSetup(page, 'Continue');
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('12');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).check();
  await proceedSetup(page, 'Continue');
  // The progress screens follow menu order, even after re-selection.
  await expect(page.getByRole('heading',{name:'Gustave’s progress'})).toBeVisible();
  await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toHaveValue('1');
});
test('switching midway setup to new restores verified defaults', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await proceedSetup(page, 'Continue');
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('10');
  for (let i=0;i<3;i++) await page.getByRole('button',{name:'Back',exact:true}).click();
  await createNew(page);
  await expect(page.getByText('LV 1')).toHaveCount(2);
  await expect(page.getByLabel('3 attribute points available',{exact:true})).toHaveCount(2);
});
test('blocks invalid midway progress and requires an initial character', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Lune',exact:true}).uncheck();
  await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
  await page.getByRole('checkbox',{name:'Lune',exact:true}).check();
  await proceedSetup(page, 'Continue');
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('0');
  await proceedSetup(page, 'Create playthrough');
  await expect(page.getByRole('alert')).toContainText('whole numbers');
  await expect(page.getByRole('heading',{name:'Lune’s progress'})).toBeVisible();
});
test('custom controls support keyboard adjustment without submitting progress', async ({page}) => {
  await createNew(page);
  await page.locator('.character-card').getByRole('button',{name:'Update progress'}).first().click();
  const level=page.getByRole('spinbutton',{name:'Current level',exact:true});
  await level.press('ArrowUp');
  await expect(level).toHaveValue('2');
  await page.getByRole('button',{name:'Increase Agility',exact:true}).press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('spinbutton',{name:'Agility',exact:true})).toHaveValue('1');
  await saveCharacter(page);
  await page.reload();
  await expect(page.getByText('LV 2')).toBeVisible();
});

test('reveals setup characters individually and records an advanced party', async ({page}) => {
  await chooseStart(page, 'Join midway');
  const later = ['Maelle', 'Sciel', 'Verso', 'Monoco'];
  for (const name of later) await expect(page.getByText(name,{exact:true})).toHaveCount(0);
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Lune',exact:true}).uncheck();
  for (let i=0; i<later.length; i++) {
    await page.getByRole('button',{name:'Reveal next character',exact:true}).click();
    const checkbox = page.getByRole('checkbox',{name:later[i],exact:true});
    await expect(checkbox).not.toBeChecked();
    await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
    for (const hidden of later.slice(i+1)) await expect(page.getByText(hidden,{exact:true})).toHaveCount(0);
  }
  await expect(page.getByRole('button',{name:'Reveal next character',exact:true})).toBeVisible();
  await expect(page.getByText('All available characters have been revealed.',{exact:true})).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button',{name:'Reveal next character',exact:true})).toBeVisible();
  await expect(page.getByText('All available characters have been revealed.',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Reveal next character',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('All available characters have been revealed.');
  await expect(page.getByRole('button',{name:'Reveal next character',exact:true})).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('All available characters have been revealed.');
  await expect(page.getByRole('checkbox')).toHaveCount(6);
  for (const name of [...later, 'Lune']) await page.getByRole('checkbox',{name,exact:true}).check();
  const menuOrder = ['Sciel', 'Lune', 'Verso', 'Maelle', 'Monoco'];
  await expect(page.locator('.character-choice label span')).toHaveText(['Gustave', ...menuOrder]);
  await proceedSetup(page, 'Continue');
  for (let i=0; i<menuOrder.length; i++) {
    await expect(page.getByRole('heading',{name:`${menuOrder[i]}’s progress`})).toBeVisible();
    await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill(String(20+i));
    await page.getByRole('spinbutton',{name:'Vitality',exact:true}).fill(String(10+i));
    await proceedSetup(page, i===menuOrder.length-1 ? 'Create playthrough' : 'Continue');
  }
  await page.reload();
  await expect(page.locator('.character-card h2')).toHaveText(menuOrder);
  for (let i=0; i<menuOrder.length; i++) {
    await expect(page.getByRole('heading',{name:menuOrder[i],exact:true})).toHaveCount(1);
    await expect(page.getByText(`LV ${20+i}`,{exact:true})).toBeVisible();
  }
  await expect(page.getByRole('heading',{name:'Gustave',exact:true})).toHaveCount(0);
  // Setup already showed that everyone has been revealed, so there is nobody left to add.
  await expect(page.getByRole('button',{name:'Add a character',exact:true})).toHaveCount(0);
});

test('skipped revealed characters remain addable without duplicating the advanced party', async ({page}) => {
  await chooseStart(page, 'Join midway');
  for (let i=0;i<3;i++) await page.getByRole('button',{name:'Reveal next character',exact:true}).click();
  await page.getByRole('checkbox',{name:'Verso',exact:true}).check();
  await proceedSetup(page, 'Continue');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Verso',exact:true})).toBeChecked();
  await expect(page.getByRole('checkbox',{name:'Sciel',exact:true})).not.toBeChecked();
  await expect(page.getByText('Monoco',{exact:true})).toHaveCount(0);
  await proceedSetup(page, 'Continue');
  for (let i=0;i<2;i++) await proceedSetup(page, 'Continue');
  await proceedSetup(page, 'Create playthrough');
  await page.reload();
  for (const name of ['Maelle','Sciel','Monoco']) {
    await page.getByRole('button',{name:'Add a character',exact:true}).click();
    await page.getByRole('button',{name:'Reveal character',exact:true}).click();
    await expect(page.getByText(`The next character is ${name}.`)).toBeVisible();
    await page.getByRole('button',{name:'Add to playthrough',exact:true}).click();
    await saveCharacter(page);
    await page.reload();
  }
  await expect(page.getByRole('heading',{name:'Verso',exact:true})).toHaveCount(1);
  await expect(page.locator('.character-card')).toHaveCount(6);
});

test('restores setup name and screen from query parameters without extra history entries', async ({page}) => {
  await page.goto('/?campaign=evening#guide');
  const historyLength = await page.evaluate(() => history.length);
  await page.getByRole('button',{name:/Start new expedition/}).click();
  await page.getByLabel('Playthrough name').fill('Alex & friends / run #2 ✨');
  await expect.poll(() => new URL(page.url()).searchParams.has('setup')).toBe(true);
  await expect(page.evaluate(() => history.length)).resolves.toBe(historyLength);
  await page.reload();
  await expect(page.getByRole('heading',{name:'Name your expedition',exact:true})).toBeVisible();
  await expect(page.getByLabel('Playthrough name')).toHaveValue('Alex & friends / run #2 ✨');
  expect(new URL(page.url()).searchParams.get('campaign')).toBe('evening');
  expect(new URL(page.url()).hash).toBe('#guide');
  await proceedSetup(page, 'Continue');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Who’s in your party?',exact:true})).toBeVisible();
  await finishNewParty(page);
  await expect.poll(() => new URL(page.url()).searchParams.has('setup')).toBe(false);
  expect(new URL(page.url()).searchParams.get('campaign')).toBe('evening');
  expect(new URL(page.url()).hash).toBe('#guide');
});

test('restores advanced setup progress and spoiler boundaries after repeated reloads', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await page.getByRole('checkbox',{name:'Lune',exact:true}).uncheck();
  await page.getByRole('button',{name:'Reveal next character',exact:true}).click();
  await page.getByRole('checkbox',{name:'Maelle',exact:true}).check();
  await page.reload();
  await expect(page.getByRole('checkbox',{name:'Maelle',exact:true})).toBeChecked();
  await expect(page.getByRole('checkbox',{name:'Lune',exact:true})).not.toBeChecked();
  for (const name of ['Sciel','Verso','Monoco']) await expect(page.getByText(name,{exact:true})).toHaveCount(0);
  await proceedSetup(page, 'Continue');
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('26');
  await page.getByRole('spinbutton',{name:'Vitality',exact:true}).fill('12');
  await proceedSetup(page, 'Continue');
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('24');
  await page.getByRole('spinbutton',{name:'Available attribute points',exact:true}).fill('9');
  await page.getByRole('button',{name:'Increase Might',exact:true}).click();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Maelle’s progress',exact:true})).toBeVisible();
  await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toHaveValue('24');
  await expect(page.getByRole('spinbutton',{name:'Available attribute points',exact:true})).toHaveValue('9');
  await expect(page.getByRole('spinbutton',{name:'Might',exact:true})).toHaveValue('1');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toHaveValue('26');
  await expect(page.getByRole('spinbutton',{name:'Vitality',exact:true})).toHaveValue('12');
  await proceedSetup(page, 'Continue');
  await proceedSetup(page, 'Create playthrough');
  await expect.poll(() => new URL(page.url()).searchParams.has('setup')).toBe(false);
  await page.reload();
  await expect(page.getByText('LV 24',{exact:true})).toBeVisible();
  await expect(page.getByText('LV 26',{exact:true})).toBeVisible();
});

test('restores an empty party selection and tolerates malformed setup URLs', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Lune',exact:true}).uncheck();
  await page.reload();
  await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
  await expect(page.getByRole('checkbox',{name:'Gustave',exact:true})).not.toBeChecked();
  await page.goto('/?setup=not-json');
  await expect(page.getByRole('heading',{name:'Where are you starting?',exact:true})).toBeVisible();
  const invalid = {version:1, mode:'midway', screen:'verso', name:'Invalid', selected:['verso'], revealed:0, progress:{}};
  await page.goto('/?setup='+encodeURIComponent(JSON.stringify(invalid)));
  await expect(page.getByRole('heading',{name:'Where are you starting?',exact:true})).toBeVisible();
  await expect(page.getByText('Verso',{exact:true})).toHaveCount(0);
});

test('requires equipped weapons in new onboarding and restores them from the URL', async ({page}) => {
  await chooseStart(page);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Gustave’s weapon',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Enter the equipped weapon name');
  await pickWeapon(page,'Aby','Abysseram');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Gustave’s weapon',exact:true})).toBeVisible();
  await expect(page.getByLabel('Equipped weapon',{exact:true})).toHaveValue('Abysseram');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Lune’s weapon',exact:true})).toBeVisible();
  await pickWeapon(page,'Col','Colim');
  // Wait for the URL to contain the last field edit before adapting an older draft.
  await expect.poll(() => JSON.parse(new URL(page.url()).searchParams.get('setup')!).progress.lune.weapon).toBe('Colim');
  // A draft URL saved before weapons were required may lack an earlier character's entry.
  const oldUrl = new URL(page.url());
  const draft = JSON.parse(oldUrl.searchParams.get('setup')!);
  delete draft.progress.gustave.weapon;
  oldUrl.searchParams.set('setup',JSON.stringify(draft));
  await page.goto(oldUrl.href);
  await page.getByRole('button',{name:'Create playthrough',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Gustave’s weapon',exact:true})).toBeVisible();
  await pickWeapon(page,'Aby','Abysseram');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByLabel('Equipped weapon',{exact:true})).toHaveValue('Colim');
  await page.getByRole('button',{name:'Create playthrough',exact:true}).click();
  await expect(page.locator('.character-weapon strong')).toHaveText(['Abysseram · Level 1','Colim · Level 1']);
  await page.reload();
  await expect(page.locator('.character-weapon strong')).toHaveText(['Abysseram · Level 1','Colim · Level 1']);
});

test('keeps older saves readable and requires a weapon when updating them', async ({page}) => {
  await createNew(page);
  await page.evaluate(()=>{
    const key='expedition-33-guide.v1', data=JSON.parse(localStorage.getItem(key)!);
    for (const run of data.playthroughs) for (const character of run.characters) delete character.weapon;
    localStorage.setItem(key,JSON.stringify(data));
  });
  await page.reload();
  const card=page.locator('.character-card').first();
  await card.getByRole('button',{name:'Add weapon',exact:true}).click();
  await expect(page.getByLabel('Equipped weapon',{exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Save progress',exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('equipped weapon');
  await pickWeapon(page,'aby','Abysseram');
  await page.getByRole('button',{name:'Save progress',exact:true}).click();
  await expect(card.locator('.character-weapon strong')).toHaveText('Abysseram · Level 1');
  await expect(card.getByRole('button',{name:'Update progress',exact:true})).toBeFocused();
  await page.reload();
  await expect(card.locator('.character-weapon strong')).toHaveText('Abysseram · Level 1');
});

test('keeps the add control after the last character joins until the empty reveal is seen', async ({page}) => {
  await page.evaluate(() => {
    const characters = ['gustave','lune','maelle','sciel','verso','monoco'].map(id => ({id,name:id[0].toUpperCase()+id.slice(1),weapon:'Recorded weapon',level:10,points:0,invested:{vitality:0,might:0,agility:0,defence:0,luck:0},tracked:true,revealed:true}));
    localStorage.setItem('expedition-33-guide.v1',JSON.stringify({version:1,activeId:'full',playthroughs:[{id:'full',name:'Full party',characters,nextRevealIndex:4,revision:0}]}));
  });
  await page.reload();
  const add = page.getByRole('button',{name:/Add a character/});
  await expect(add).toBeVisible();
  await add.click();
  await page.getByRole('button',{name:'Reveal character'}).click();
  await expect(page.getByText('No additional character is available right now.')).toBeVisible();
  await page.getByRole('button',{name:'Cancel'}).click();
  await expect(add).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('expedition-33-guide.v1')!).playthroughs[0].revealComplete)).toBe(true);
});

test('searches weapons only after three letters and accepts only listed weapons', async ({page}) => {
  await chooseStart(page);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  const input = page.getByLabel('Equipped weapon',{exact:true});
  await input.fill('Ab');
  await expect(page.getByRole('option')).toHaveCount(0);
  await input.fill('Aby');
  await expect(page.getByRole('option')).toHaveText(['Abysseram']);
  // Another character's weapons never appear in Gustave's search.
  await input.fill('Col');
  await expect(page.getByRole('option',{name:'Colim'})).toHaveCount(0);
  await input.fill('Not a real weapon');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(input).toHaveValue('');
  await expect(page.getByRole('alert')).toContainText('Enter the equipped weapon name');
});

test('highlights the attributes the equipped weapon scales with', async ({page}) => {
  await chooseStart(page);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await pickWeapon(page,'Aby','Abysseram');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await pickWeapon(page,'Col','Colim');
  await page.getByRole('button',{name:'Create playthrough',exact:true}).click();
  const gustave = page.locator('.character-card').filter({has: page.getByRole('heading',{name:'Gustave',exact:true})});
  await expect(gustave.locator('.stats__item.is-scaling .stats__label')).toHaveText(['Vitality','Defence']);
  await expect(gustave.locator('.stats__item.is-scaling .scaling-grade')).toHaveText([/C$/, /D$/]);
  await gustave.getByRole('button',{name:'Update progress',exact:true}).click();
  await expect(page.locator('.attribute-row.is-scaling label')).toHaveText(['VitalityC','DefenceD']);
  await expect(page.getByLabel('Vitality',{exact:true})).toBeVisible();
  // Grades rise by one at weapon levels 4, 20 and 33.
  await page.getByRole('spinbutton',{name:'Weapon level',exact:true}).fill('20');
  await expect(page.locator('.attribute-row.is-scaling label')).toHaveText(['VitalityA','DefenceB']);
  await pickWeapon(page,'Cru','Cruleram');
  await expect(page.locator('.attribute-row.is-scaling label')).toHaveText(['DefenceA','LuckB']);
  await page.getByRole('button',{name:'Save progress',exact:true}).click();
  await expect(gustave.locator('.character-weapon strong')).toHaveText('Cruleram · Level 20');
  await expect(gustave.locator('.stats__item.is-scaling .scaling-grade')).toHaveText([/A$/, /B$/]);
});

test('changes and removes the equipped weapon from the character card', async ({page}) => {
  await createNew(page);
  const gustave = page.locator('.character-card').filter({has: page.getByRole('heading',{name:'Gustave',exact:true})});
  await gustave.getByRole('button',{name:'Change Gustave’s weapon',exact:true}).click();
  const input = page.getByLabel('Equipped weapon',{exact:true});
  await expect(input).toBeFocused();
  await page.keyboard.type('Cru');
  await page.getByRole('option',{name:'Cruleram',exact:true}).click();
  await page.getByRole('button',{name:'Save progress',exact:true}).click();
  await expect(gustave.locator('.character-weapon strong')).toHaveText('Cruleram · Level 1');
  await gustave.getByRole('button',{name:'Remove Gustave’s weapon',exact:true}).click();
  await expect(gustave.locator('.character-weapon strong')).toHaveCount(0);
  await expect(gustave.locator('.stats__item.is-scaling')).toHaveCount(0);
  await page.reload();
  await expect(gustave.getByRole('button',{name:'Add weapon',exact:true})).toBeVisible();
});

test('clears the weapon field with its clear control', async ({page}) => {
  await createNew(page);
  await page.locator('.character-card').first().getByRole('button',{name:'Update progress',exact:true}).click();
  const input = page.getByLabel('Equipped weapon',{exact:true});
  await expect(input).not.toHaveValue('');
  await page.locator('.weapon-field .p-autocomplete-clear-icon').click();
  await expect(input).toHaveValue('');
  await page.getByRole('button',{name:'Save progress',exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('equipped weapon');
});
