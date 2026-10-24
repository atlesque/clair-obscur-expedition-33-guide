import { test, expect } from '@playwright/test';
async function chooseStart(page: import('@playwright/test').Page, mode = 'Start new expedition') {
  await page.getByRole('button', { name: mode, exact: false }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
async function createNew(page: import('@playwright/test').Page) {
  await chooseStart(page);
  await page.getByRole('button', { name: 'Create playthrough' }).click();
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
test('creates and reloads a named playthrough with initial party', async ({page}) => { await page.getByRole('button',{name:/Start new expedition/}).click(); await page.getByLabel('Playthrough name').fill('Night run'); await page.getByRole('button',{name:'Continue',exact:true}).click(); await page.getByRole('button',{name:'Create playthrough'}).click(); await expect(page.getByText('Night run',{exact:true})).toBeVisible(); await expect(page.getByRole('img',{name:'Gustave avatar'})).toBeVisible(); await expect(page.locator('.character-card__index')).toHaveCount(0); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); await page.reload(); await expect(page.getByText('Night run',{exact:true})).toBeVisible(); await expect(page.getByRole('heading',{name:'Gustave'})).toBeVisible(); });
test('manages expeditions from the current expedition control', async ({page}) => { await createNew(page); await page.getByRole('button',{name:'View all expeditions'}).click(); await page.getByLabel('New expedition').fill('Late run'); await page.getByRole('button',{name:'Add expedition'}).click(); await expect(page.getByText('Late run',{exact:true})).toBeVisible(); await page.getByRole('button',{name:'View all expeditions'}).click(); await page.getByRole('button',{name:/My Expedition/}).click(); await expect(page.getByText('My Expedition',{exact:true})).toBeVisible(); await page.getByRole('button',{name:'View all expeditions'}).click(); await page.getByRole('button',{name:'Rename'}).first().click(); await page.getByLabel('Expedition name').fill('First run'); await page.getByRole('button',{name:'Save', exact:true}).click(); await expect(page.getByRole('button',{name:'View all expeditions'}).getByText('First run',{exact:true})).toBeVisible(); await page.getByRole('button',{name:'Delete'}).last().click(); await expect(page.getByRole('dialog',{name:'Delete expedition?'})).toBeVisible(); await page.getByRole('button',{name:'Delete expedition'}).click(); await expect(page.getByText('Late run',{exact:true})).toHaveCount(0); });
test('cycles the always-visible theme control through auto, dark and light', async ({page}) => { const theme = page.getByRole('button',{name:/Theme:/}); await expect(theme).toHaveAttribute('data-theme-mode','auto'); await theme.click(); await expect(theme).toHaveAttribute('data-theme-mode','dark'); await expect(page.locator('html')).toHaveAttribute('data-theme','dark'); await theme.click(); await expect(theme).toHaveAttribute('data-theme-mode','light'); await expect(page.locator('html')).toHaveAttribute('data-theme','light'); await expect(page.locator('body')).toHaveCSS('background-color','rgb(246, 245, 242)'); await theme.click(); await expect(theme).toHaveAttribute('data-theme-mode','auto'); await page.reload(); await expect(page.getByRole('button',{name:/Theme: Auto/})).toBeVisible(); });
test('deleting the only saved expedition returns to blank setup', async ({page}) => { await createNew(page); await page.getByRole('button',{name:'View all expeditions'}).click(); await expect(page.getByRole('button',{name:'Delete'})).toBeEnabled(); await page.getByRole('button',{name:'Delete'}).click(); await expect(page.getByRole('dialog',{name:'Delete expedition?'})).toBeVisible(); await page.getByRole('button',{name:'Delete expedition'}).click(); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeVisible(); await expect(page.getByRole('button',{name:'View all expeditions'})).toHaveCount(0); await page.reload(); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeVisible(); await expect(page.getByRole('button',{name:'View all expeditions'})).toHaveCount(0); });
test('keeps advice pending through reload and confirms once', async ({page}) => { await createNew(page); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.reload(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.getByRole('button',{name:"I've applied these"}).click(); await expect(page.getByText('Applied recommendation recorded once.')).toBeVisible(); });
test('dismisses pending advice and persists the dismissal', async ({page}) => { await createNew(page); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.getByRole('button',{name:'Dismiss advice'}).click(); await expect(page.getByText('Pending recommendation')).toHaveCount(0); await page.reload(); await expect(page.getByText('Pending recommendation')).toHaveCount(0); });
test('uses anonymous reveal dialog and preserves cancellation', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.focus(); await add.press('Enter'); await expect(page.getByRole('dialog')).toHaveAccessibleName('Continue your expedition?'); await expect(page.getByText(/Only continue if someone new/)).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await expect(page.getByText(/The next character is/)).toBeVisible(); await page.getByRole('button',{name:'Cancel'}).click(); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(add).toBeVisible(); });
test('does not overwrite malformed saved data', async ({page}) => { await page.evaluate(() => localStorage.setItem('expedition-33-guide.v1','not-json')); await page.reload(); await expect(page.getByRole('alert')).toContainText('saved playthrough could not be read'); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeDisabled(); await expect(page.evaluate(() => localStorage.getItem('expedition-33-guide.v1'))).resolves.toBe('not-json'); });
test('shows an honest failure when storage becomes unwritable', async ({page}) => { await page.evaluate(() => { const original=Storage.prototype.setItem; Storage.prototype.setItem=function(){ throw new Error('blocked'); }; (window as any).__restore=()=>Storage.prototype.setItem=original; }); await createNew(page); await expect(page.getByRole('alert')).toContainText('could not save'); });
test('supports direct catch-up, correction, confirmation and reload', async ({page}) => { await createNew(page); await page.getByRole('button',{name:'Update progress'}).first().click(); await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('15'); await page.getByRole('spinbutton',{name:'Available attribute points',exact:true}).fill('30'); await page.getByRole('button',{name:'Save progress'}).click(); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.getByRole('button',{name:'Update progress'}).first().click(); await page.getByRole('spinbutton',{name:'Available attribute points',exact:true}).fill('5'); await page.getByRole('button',{name:'Save progress'}).click(); await expect(page.getByText('Pending recommendation')).toHaveCount(0); await page.getByRole('button',{name:/Get advice for Gustave/}).click(); await page.reload(); await expect(page.getByText('Pending recommendation')).toBeVisible(); await page.getByRole('button',{name:"I've applied these"}).first().click(); await page.reload(); await expect(page.getByText('Pending recommendation')).toHaveCount(0); });
test('adds sequentially only after setup and keeps terminal add control', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.getByRole('button',{name:'Cancel'}).last().click(); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(0); for(let i=0;i<4;i++){ await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.getByRole('button',{name:'Save progress'}).click(); } await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await expect(page.getByText('No additional character is available right now.')).toBeVisible(); await page.getByRole('button',{name:'Cancel'}).click(); await expect(add).toBeVisible(); });
test('cancelling later-character setup does not append a duplicate on retry', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.getByRole('button',{name:'Cancel'}).last().click(); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.getByRole('button',{name:'Save progress'}).click(); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(1); });
test('recovers later-character setup after a failed save without duplicating or advancing', async ({page}) => { await createNew(page); const add=page.getByRole('button',{name:/Add a character/}); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await page.getByRole('button',{name:'Add to playthrough'}).click(); await page.evaluate(() => { const original=Storage.prototype.setItem; let fail=true; Storage.prototype.setItem=function(key,value){ if(fail){ fail=false; throw new Error('blocked once'); } return original.call(this,key,value); }; (window as any).__restore=()=>Storage.prototype.setItem=original; }); await page.getByRole('button',{name:'Save progress'}).click(); await expect(page.getByRole('alert')).toContainText('could not save'); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(0); await page.evaluate(() => (window as any).__restore()); await page.getByRole('button',{name:'Save progress'}).click(); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(1); await page.reload(); await expect(page.getByRole('heading',{name:'Maelle',exact:true})).toHaveCount(1); await add.click(); await page.getByRole('button',{name:'Reveal character'}).click(); await expect(page.getByText(/The next character is Sciel/)).toBeVisible(); });
test('rejects malformed nested saves without overwriting raw data', async ({page}) => { const raw='{"version":1,"activeId":"p","playthroughs":[{"id":"p","name":"x","characters":[{"id":"gustave","name":"Gustave","level":0}]}]}'; await page.evaluate(raw => localStorage.setItem('expedition-33-guide.v1', raw), raw); await page.reload(); await expect(page.getByRole('alert')).toContainText('unreadable'); await expect(page.getByRole('button',{name:/Start new expedition/})).toBeDisabled(); await expect(page.evaluate(() => localStorage.getItem('expedition-33-guide.v1'))).resolves.toBe(raw); });
test('shows accessible validation for invalid progress and restores focus', async ({page}) => { await createNew(page); const update=page.getByRole('button',{name:'Update progress'}).first(); await update.click(); await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toBeFocused(); await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('0'); await page.getByRole('button',{name:'Save progress'}).click(); await expect(page.getByRole('alert')).toContainText('whole numbers'); await page.getByRole('button',{name:'Cancel'}).click(); await expect(update).toBeFocused(); });
test('starts with a single choice and preserves names when going back', async ({page}) => {
  await expect(page.getByRole('heading',{name:'Where are you starting?'})).toBeVisible();
  await expect(page.getByLabel('Playthrough name')).toHaveCount(0);
  await page.getByRole('button',{name:/Start new expedition/}).click();
  await page.getByLabel('Playthrough name').fill('Evening expedition');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Who’s in your party?'})).toBeFocused();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByLabel('Playthrough name')).toHaveValue('Evening expedition');
  await page.getByLabel('Playthrough name').fill(' ');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Enter a name');
});
test('supports midway entry one character at a time with custom number controls', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
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
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Lune’s progress'})).toBeVisible();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toHaveValue('12');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Create playthrough'}).click();
  await expect(page.getByText('LV 12')).toBeVisible();
  await expect(page.getByText('1 attribute points available')).toBeVisible();
  await page.reload();
  await expect(page.getByText('LV 12')).toBeVisible();
});
test('clears deselected midway drafts before reselecting', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('12');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).check();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  // Re-selected Gustave follows Lune in the chosen party order.
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Gustave’s progress'})).toBeVisible();
  await expect(page.getByRole('spinbutton',{name:'Current level',exact:true})).toHaveValue('1');
});
test('switching midway setup to new restores verified defaults', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('10');
  for (let i=0;i<3;i++) await page.getByRole('button',{name:'Back',exact:true}).click();
  await createNew(page);
  await expect(page.getByText('LV 1')).toHaveCount(2);
  await expect(page.getByText('3 attribute points available')).toHaveCount(2);
});
test('blocks invalid midway progress and requires an initial character', async ({page}) => {
  await chooseStart(page, 'Join midway');
  await page.getByRole('checkbox',{name:'Gustave',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Lune',exact:true}).uncheck();
  await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
  await page.getByRole('checkbox',{name:'Lune',exact:true}).check();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('0');
  await page.getByRole('button',{name:'Create playthrough'}).click();
  await expect(page.getByRole('alert')).toContainText('whole numbers');
  await expect(page.getByRole('heading',{name:'Lune’s progress'})).toBeVisible();
});
test('custom controls support keyboard adjustment without submitting progress', async ({page}) => {
  await createNew(page);
  await page.getByRole('button',{name:'Update progress'}).first().click();
  const level=page.getByRole('spinbutton',{name:'Current level',exact:true});
  await level.press('ArrowUp');
  await expect(level).toHaveValue('2');
  await page.getByRole('button',{name:'Increase Agility',exact:true}).press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('spinbutton',{name:'Agility',exact:true})).toHaveValue('1');
  await page.getByRole('button',{name:'Save progress'}).click();
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
  await expect(page.getByRole('button',{name:'Reveal next character',exact:true})).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('All available characters have been revealed.');
  for (const name of later) await page.getByRole('checkbox',{name,exact:true}).check();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  for (let i=0; i<later.length; i++) {
    await expect(page.getByRole('heading',{name:`${later[i]}’s progress`})).toBeVisible();
    await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill(String(20+i));
    await page.getByRole('spinbutton',{name:'Vitality',exact:true}).fill(String(10+i));
    await page.getByRole('button',{name:i===later.length-1 ? 'Create playthrough' : 'Continue',exact:true}).click();
  }
  await page.reload();
  for (let i=0; i<later.length; i++) {
    await expect(page.getByRole('heading',{name:later[i],exact:true})).toHaveCount(1);
    await expect(page.getByText(`LV ${20+i}`,{exact:true})).toBeVisible();
  }
  await expect(page.getByRole('heading',{name:'Gustave',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Add a character',exact:true}).click();
  await page.getByRole('button',{name:'Reveal character',exact:true}).click();
  await expect(page.getByText('No additional character is available right now.')).toBeVisible();
});

test('skipped revealed characters remain addable without duplicating the advanced party', async ({page}) => {
  await chooseStart(page, 'Join midway');
  for (let i=0;i<3;i++) await page.getByRole('button',{name:'Reveal next character',exact:true}).click();
  await page.getByRole('checkbox',{name:'Verso',exact:true}).check();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Verso',exact:true})).toBeChecked();
  await expect(page.getByRole('checkbox',{name:'Sciel',exact:true})).not.toBeChecked();
  await expect(page.getByText('Monoco',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  for (let i=0;i<2;i++) await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Create playthrough',exact:true}).click();
  await page.reload();
  for (const name of ['Maelle','Sciel','Monoco']) {
    await page.getByRole('button',{name:'Add a character',exact:true}).click();
    await page.getByRole('button',{name:'Reveal character',exact:true}).click();
    await expect(page.getByText(`The next character is ${name}.`)).toBeVisible();
    await page.getByRole('button',{name:'Add to playthrough',exact:true}).click();
    await page.getByRole('button',{name:'Save progress',exact:true}).click();
    await page.reload();
  }
  await expect(page.getByRole('heading',{name:'Verso',exact:true})).toHaveCount(1);
  await expect(page.locator('.character-card')).toHaveCount(6);
});
