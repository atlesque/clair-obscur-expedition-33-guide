import { test, expect } from '@playwright/test';
const order=['Sciel','Lune','Verso','Maelle','Monoco'];
test.beforeEach(async ({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    localStorage.clear();
    const names=['Monoco','Maelle','Verso','Lune','Sciel'];
    const characters=names.map(name=>({id:name.toLowerCase(),name,weapon:`${name}'s recorded weapon`,level:10,points:3,invested:{vitality:0,might:0,agility:0,defence:0,luck:0},tracked:true,revealed:true}));
    localStorage.setItem('expedition-33-guide.v1',JSON.stringify({version:1,activeId:'party',playthroughs:[{id:'party',name:'Full party',characters,nextRevealIndex:4,revision:0}]}));
  });
  await page.reload();
});

test('updates the whole party in game-menu order and persists each step',async({page})=>{
  const start=page.getByRole('button',{name:'Update progress for all characters',exact:true});
  await start.click();
  for(let i=0;i<order.length;i++){
    const dialog=page.getByRole('dialog',{name:`Update ${order[i]}`,exact:true});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(`Character ${i+1} of 5`,{exact:true})).toBeVisible();
    await expect(dialog.getByRole('spinbutton',{name:'Current level',exact:true})).toBeFocused();
    await dialog.getByRole('spinbutton',{name:'Current level',exact:true}).fill(String(20+i));
    await dialog.getByRole('spinbutton',{name:'Available attribute points',exact:true}).fill('5');
    await dialog.getByRole('button',{name:i===order.length-1?'Save and finish':'Save and next',exact:true}).click();
  }
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(start).toBeFocused();
  await page.reload();
  const cards=page.locator('.character-card');
  await expect(cards.locator('h2')).toHaveText(order);
  for(let i=0;i<order.length;i++){
    await expect(cards.nth(i).locator('.level-tag')).toHaveText(`LV ${20+i}`);
    await expect(cards.nth(i).locator('.points-tag')).toHaveText('5 AP');
  }
});

test('reviews party advice one at a time and applies only explicitly confirmed points',async({page})=>{
  const start=page.getByRole('button',{name:'Get advice for all characters',exact:true});
  await start.click();
  let dialog=page.getByRole('dialog',{name:'Advice for Sciel',exact:true});
  await expect(dialog.getByText('Pending recommendation',{exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:'Next character',exact:true}).click();
  dialog=page.getByRole('dialog',{name:'Advice for Lune',exact:true});
  await dialog.getByRole('button',{name:"I've applied these",exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Advice for Verso',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await expect(start).toBeFocused();
  await page.reload();
  const cards=page.locator('.character-card');
  await expect(cards.nth(0).locator('.points-tag')).toHaveText('3 AP');
  await expect(cards.nth(1).locator('.points-tag')).toHaveText('0 AP');
  await expect(cards.nth(2).locator('.points-tag')).toHaveText('3 AP');
  await expect(cards.nth(3).getByText('Pending recommendation',{exact:true})).toHaveCount(0);
  await start.click();
  for(let i=0;i<order.length;i++){
    dialog=page.getByRole('dialog',{name:`Advice for ${order[i]}`,exact:true});
    await expect(dialog).toBeVisible();
    if(order[i]==='Lune') await expect(dialog.getByRole('button',{name:"I've applied these",exact:true})).toHaveCount(0);
    await dialog.getByRole('button',{name:i===order.length-1?'Finish':'Next character',exact:true}).click();
  }
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(cards.nth(0).locator('.points-tag')).toHaveText('3 AP');
});

test('keeps invalid or unsaved entries on the current step and allows skipping or cancellation',async({page})=>{
  await page.getByRole('button',{name:'Update progress for all characters',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('spinbutton',{name:'Current level',exact:true}).fill('0');
  await dialog.getByRole('button',{name:'Save and next',exact:true}).click();
  await expect(dialog.getByRole('alert')).toContainText('whole numbers');
  await expect(dialog).toHaveAccessibleName('Update Sciel');
  await dialog.getByRole('spinbutton',{name:'Current level',exact:true}).fill('20');
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;let once=true;
    Storage.prototype.setItem=function(key,value){if(once){once=false;throw new Error('blocked once');}return original.call(this,key,value);};
  });
  await dialog.getByRole('button',{name:'Save and next',exact:true}).click();
  await expect(dialog.getByRole('alert')).toContainText('Could not save progress');
  await expect(dialog).toHaveAccessibleName('Update Sciel');
  await expect(dialog.getByRole('spinbutton',{name:'Current level',exact:true})).toHaveValue('20');
  await dialog.getByRole('button',{name:'Save and next',exact:true}).click();
  await expect(dialog).toHaveAccessibleName('Update Lune');
  await dialog.getByRole('button',{name:'Skip character',exact:true}).click();
  await expect(dialog).toHaveAccessibleName('Update Verso');
  await dialog.getByRole('spinbutton',{name:'Current level',exact:true}).fill('99');
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.reload();
  await expect(page.locator('.character-card').nth(0).locator('.level-tag')).toHaveText('LV 20');
  await expect(page.locator('.character-card').nth(1).locator('.level-tag')).toHaveText('LV 10');
  await expect(page.locator('.character-card').nth(2).locator('.level-tag')).toHaveText('LV 10');
});
