import { test, expect, type BrowserContext } from '@playwright/test';
const PLAY = 'https://play.atlesque.dev';
const KEY = 'expedition-33-guide.account';
type Cloud = { rev: number; data: unknown };
async function connect(context: BrowserContext, cloud: Cloud) {
  await context.addInitScript(({key}) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ token: 'test-token', userId: 'test-user', email: 'player@example.com', rev: 0, base: null, syncedAt: null }));
  }, {key:KEY});
  await context.route(`${PLAY}/**`, async route => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET, PUT, POST, OPTIONS','access-control-allow-headers':'content-type, authorization'}});
    expect(req.headers().authorization).toBe('Bearer test-token');
    let status=200;
    if (req.method()==='PUT') {
      const body=req.postDataJSON();
      if (body.rev!==cloud.rev) status=409;
      else {cloud.rev++; cloud.data=body.data;}
    }
    await route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(cloud)});
  });
}
async function create(page: import('@playwright/test').Page) {
  await page.getByRole('button',{name:/Start new expedition/}).click();
  await page.getByLabel('Playthrough name').fill('Across devices');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByLabel('Equipped weapon',{exact:true}).fill('Aby');
  await page.getByRole('option',{name:'Abysseram',exact:true}).click();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByLabel('Equipped weapon',{exact:true}).fill('Col');
  await page.getByRole('option',{name:'Colim',exact:true}).click();
  await page.getByRole('button',{name:'Create playthrough',exact:true}).click();
}
const cloudSave = (cloud:Cloud) => (cloud.data as {save:{playthroughs:{characters:{level:number}[]}[]}})?.save;

test('uploads locally, restores on another device, and pulls later edits', async ({browser,baseURL}) => {
  const cloud:Cloud={rev:0,data:null};
  const deviceA=await browser.newContext(),deviceB=await browser.newContext();
  try {
    await connect(deviceA,cloud); await connect(deviceB,cloud);
    const a=await deviceA.newPage(),b=await deviceB.newPage();
    await a.goto(baseURL!); await create(a);
    await expect.poll(()=>cloud.rev).toBeGreaterThan(0);
    await b.goto(baseURL!);
    await expect(b.getByText('Across devices',{exact:true})).toBeVisible();
    await expect(b.getByRole('heading',{name:'Gustave',exact:true})).toBeVisible();
    await expect(b.locator('.character-weapon strong').first()).toHaveText('Abysseram');
    await b.getByRole('button',{name:'Update progress',exact:true}).first().click();
    await b.getByRole('spinbutton',{name:'Current level',exact:true}).fill('20');
    await b.getByRole('button',{name:'Save progress',exact:true}).click();
    await expect.poll(()=>cloudSave(cloud).playthroughs[0].characters[0].level).toBe(20);
    await a.locator('.account-control summary').click();
    await a.getByRole('button',{name:'Sync now',exact:true}).click();
    await expect(a.getByText('LV 20',{exact:true})).toBeVisible();
    await a.reload(); await expect(a.getByText('LV 20',{exact:true})).toBeVisible();
  } finally { await deviceA.close(); await deviceB.close(); }
});

test('retries offline edits and syncs deletion of the last playthrough', async ({browser,baseURL}) => {
  const cloud:Cloud={rev:0,data:null},context=await browser.newContext();
  try {
    await connect(context,cloud);
    const page=await context.newPage(); await page.goto(baseURL!); await create(page);
    await expect.poll(()=>cloud.rev).toBeGreaterThan(0);
    await page.route(`${PLAY}/api/games/**`,route=>route.abort('failed'));
    await page.getByRole('button',{name:'Update progress',exact:true}).first().click();
    await page.getByRole('spinbutton',{name:'Current level',exact:true}).fill('15');
    await page.getByRole('button',{name:'Save progress',exact:true}).click();
    await expect(page.locator('.account-error')).toContainText('Could not reach Atlesque Play');
    await page.reload(); await expect(page.getByText('LV 15',{exact:true})).toBeVisible();
    await page.unroute(`${PLAY}/api/games/**`);
    await page.getByRole('button',{name:'Sync now',exact:true}).click();
    await expect.poll(()=>cloudSave(cloud).playthroughs[0].characters[0].level).toBe(15);
    await page.getByRole('button',{name:'View all expeditions',exact:true}).click();
    await page.getByRole('button',{name:'Delete',exact:true}).click();
    await page.getByRole('button',{name:'Delete expedition',exact:true}).click();
    await expect.poll(()=>cloud.data).toEqual({version:1,save:null});
  } finally {await context.close();}
});

test('checks callback state before exchanging a sign-in code', async ({page}) => {
  let calls=0;
  await page.route(`${PLAY}/**`,async route=>{calls++;await route.abort();});
  await page.goto('/?mbpg_code=invalid&mbpg_state=wrong');
  await expect(page.getByRole('alert')).toContainText('does not match this browser');
  expect(calls).toBe(0);
  expect(new URL(page.url()).searchParams.has('mbpg_code')).toBe(false);
});

test('finishes PKCE sign-in and keeps an unfinished setup URL', async ({page}) => {
  let exchanged=false;
  await page.route(`${PLAY}/**`,async route=>{
    const req=route.request();
    const headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET, PUT, POST, OPTIONS','access-control-allow-headers':'content-type, authorization'};
    if(req.method()==='OPTIONS') return route.fulfill({status:204,headers});
    if(req.url().endsWith('/api/token')) {
      const body=req.postDataJSON();
      expect(body.client).toBe('expedition-33-guide');
      expect(body.code_verifier).toBe('v'.repeat(43));
      exchanged=true;
      return route.fulfill({headers,contentType:'application/json',body:JSON.stringify({token:'callback-token',user:{id:'callback-user',email:'callback@example.com'}})});
    }
    expect(req.headers().authorization).toBe('Bearer callback-token');
    await route.fulfill({headers,contentType:'application/json',body:JSON.stringify({rev:0,data:null})});
  });
  await page.goto('/');
  await page.getByRole('button',{name:/Start new expedition/}).click();
  await page.getByLabel('Playthrough name').fill('Before signing in');
  await page.evaluate(()=>localStorage.setItem('expedition-33-guide.signin',JSON.stringify({state:'expected',verifier:'v'.repeat(43),redirect:location.origin+'/',returnUrl:location.href,at:Date.now()})));
  await page.goto('/?mbpg_code=one-time-code&mbpg_state=expected');
  await expect(page.getByLabel('Playthrough name')).toHaveValue('Before signing in');
  expect(exchanged).toBe(true);
  expect(new URL(page.url()).searchParams.has('mbpg_code')).toBe(false);
  expect(new URL(page.url()).searchParams.has('setup')).toBe(true);
  await page.locator('.account-control summary').click();
  await expect(page.getByText('callback@example.com',{exact:true})).toBeVisible();
});

test('retries a stale upload and preserves conflicting playthrough edits', async ({browser,baseURL}) => {
  const cloud:Cloud={rev:0,data:null},context=await browser.newContext();
  try {
    await connect(context,cloud);
    const page=await context.newPage(); await page.goto(baseURL!); await create(page);
    await expect.poll(()=>cloud.rev).toBeGreaterThan(0);
    let injected=false;
    await page.route(`${PLAY}/api/games/**`,async route=>{
      if(route.request().method()==='PUT'&&!injected) {
        injected=true;
        const remote=JSON.parse(JSON.stringify(cloud.data));
        remote.save.playthroughs[0].name='Other device';
        cloud.data=remote;cloud.rev++;
        return route.fulfill({status:409,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify(cloud)});
      }
      await route.fallback();
    });
    await page.getByRole('button',{name:'View all expeditions',exact:true}).click();
    await page.getByRole('button',{name:'Rename',exact:true}).click();
    await page.getByLabel('Expedition name').fill('Local renamed');
    await page.getByRole('button',{name:'Save',exact:true}).click();
    await page.getByRole('button',{name:'View all expeditions',exact:true}).click();
    await expect.poll(()=>cloudSave(cloud).playthroughs.length).toBe(2);
    expect(injected).toBe(true);
    await page.getByRole('button',{name:'View all expeditions',exact:true}).click();
    await expect(page.getByRole('button',{name:/Local renamed \(recovered copy\)/})).toBeVisible();
    await expect(page.getByRole('button',{name:/Other device/})).toBeVisible();
  } finally {await context.close();}
});
