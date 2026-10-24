import { reactive } from 'vue';
import { isSaveData, STORAGE_KEY } from './storage';
import { mergeSaves } from './sync-merge';
import type { SaveData } from './types';

export const PLAY_URL = 'https://play.atlesque.dev';
export const PLAY_CLIENT = 'expedition-33-guide';
export const ACCOUNT_KEY = 'expedition-33-guide.account';
const PENDING_KEY = 'expedition-33-guide.signin';
const OWNER_KEY = 'expedition-33-guide.owner';
const PROGRESS_URL = `${PLAY_URL}/api/games/${PLAY_CLIENT}/progress`;
type Session = { token: string; userId: string; email: string; rev: number; base: SaveData | null; syncedAt: number | null };
type CloudSave = { version: 1; save: SaveData | null };
type Remote = { data: unknown; rev: number };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
function read(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; }
}
function session(): Session | null {
  const value = read(ACCOUNT_KEY) as Partial<Session> | null;
  return value && typeof value.token === 'string' && typeof value.userId === 'string' && typeof value.email === 'string' && Number.isInteger(value.rev) && (value.base === null || isSaveData(value.base)) ? value as Session : null;
}
function decode(remote: Remote): SaveData | null {
  if (!Number.isInteger(remote.rev) || remote.rev < 0) throw new Error('The account returned an invalid save revision.');
  if (remote.data === null) return null;
  const data = remote.data as Partial<CloudSave>;
  if (data?.version !== 1 || (data.save !== null && !isSaveData(data.save))) throw new Error('The account save could not be read. Your local progress is unchanged.');
  return data.save;
}
class ApiError extends Error {
  constructor(readonly status: number, readonly body: Record<string, unknown>) {
    super(typeof body.message === 'string' ? body.message : `Atlesque Play could not sync (${status}).`);
  }
}
async function api(path: string, token: string | null, method = 'GET', body?: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(path, {
    method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const random = () => b64(crypto.getRandomValues(new Uint8Array(32)));

export function createPlaySync(options: {
  get: () => SaveData | null;
  apply: (save: SaveData | null) => boolean;
  canSync: () => boolean;
}) {
  const account = reactive({ email: null as string | null, busy: false, error: '', syncedAt: null as number | null });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let poll: ReturnType<typeof setInterval> | undefined;
  let running: Promise<void> | null = null;
  let again = false;
  let stopped = false;
  let generation = 0;
  let tokenSeen: string | null = null;
  function show() { const s = session(); tokenSeen = s?.token ?? null; account.email = s?.email ?? null; account.syncedAt = s?.syncedAt ?? null; }
  function schedule(delay = 800) {
    clearTimeout(timer);
    if (!stopped && session()) timer = setTimeout(() => { void sync(); }, delay);
  }
  function fail(error: unknown) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      localStorage.removeItem(ACCOUNT_KEY); show();
      account.error = 'Your Atlesque Play sign-in expired or is unavailable. Sign in again. Progress is kept on this device.';
    } else {
      account.error = error instanceof TypeError ? 'Could not reach Atlesque Play. Progress is saved on this device and will sync when the connection returns.' : error instanceof Error ? error.message : 'Could not sync. Progress is kept on this device.';
      schedule(15_000);
    }
  }
  async function signIn() {
    try {
      account.error = '';
      const verifier = random(), state = random(), redirect = `${location.origin}${location.pathname}`;
      const challenge = b64(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
      // Preserve the setup query separately; authentication uses a clean, stable callback URL.
      localStorage.setItem(PENDING_KEY, JSON.stringify({ verifier, state, redirect, returnUrl: location.href, at: Date.now() }));
      location.assign(`${PLAY_URL}/signin?${new URLSearchParams({ client: PLAY_CLIENT, redirect_uri: redirect, state, code_challenge: challenge })}`);
    } catch { account.error = 'Could not start sign-in. Allow browser storage and try again.'; }
  }
  async function finishSignIn(code: string, state: string | null) {
    const pending = read(PENDING_KEY) as { verifier?: string; state?: string; redirect?: string; returnUrl?: string; at?: number } | null;
    const clean = new URL(location.href);
    clean.searchParams.delete('mbpg_code'); clean.searchParams.delete('mbpg_state');
    history.replaceState(history.state, '', clean);
    if (!pending || pending.state !== state || typeof pending.verifier !== 'string' || pending.redirect !== `${location.origin}${location.pathname}` || typeof pending.at !== 'number' || Date.now() - pending.at > 15 * 60_000) {
      account.error = 'This sign-in does not match this browser. Please sign in again.'; return;
    }
    localStorage.removeItem(PENDING_KEY);
    account.busy = true;
    try {
      const result = await api(`${PLAY_URL}/api/token`, null, 'POST', { code, code_verifier: pending.verifier, client: PLAY_CLIENT, redirect_uri: pending.redirect });
      const user = result.user as { id?: string; email?: string } | undefined;
      if (typeof result.token !== 'string' || typeof user?.id !== 'string' || typeof user.email !== 'string') throw new Error('Atlesque Play returned an invalid sign-in.');
      const owner = localStorage.getItem(OWNER_KEY);
      if (owner && owner !== user.id) {
        // Do not silently upload the previous account's local data into a different account.
        localStorage.setItem(`expedition-33-guide.account-backup.${owner}`, JSON.stringify(options.get()));
        if (!options.apply(null)) throw new Error('Could not switch accounts while browser storage is unavailable.');
      }
      localStorage.setItem(OWNER_KEY, user.id);
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ token: result.token, userId: user.id, email: user.email, rev: 0, base: null, syncedAt: null } satisfies Session));
      show();
      if (typeof pending.returnUrl === 'string') {
        const back = new URL(pending.returnUrl);
        if (back.origin === location.origin && back.pathname === location.pathname) {
          history.replaceState(history.state, '', back);
          if (back.searchParams.has('setup')) { location.replace(back.href); return; }
        }
      }
    } catch (error) { fail(error); }
    finally { account.busy = false; }
    if (session()) await sync();
  }
  async function run() {
    const s = session(), epoch = generation;
    if (!s || stopped) return;
    if (!options.canSync()) { schedule(2000); return; }
    account.busy = true;
    try {
      const before = copy(options.get());
      let remote = await api(PROGRESS_URL, s.token) as Remote;
      for (let attempt = 0; attempt < 4; attempt++) {
        const cloud = decode(remote);
        if (epoch !== generation || session()?.token !== s.token || stopped) return;
        if (!options.canSync()) { schedule(2000); return; }
        const local = copy(options.get());
        // A server-side reset wins over the last agreed copy, but preserves genuinely new local edits.
        const base = s.base;
        const merged = mergeSaves(local, cloud, base);
        let rev = remote.rev;
        if (!same(merged, cloud)) {
          try {
            const saved = await api(PROGRESS_URL, s.token, 'PUT', { data: { version: 1, save: merged } satisfies CloudSave, rev });
            if (!Number.isInteger(saved.rev)) throw new Error('Atlesque Play returned an invalid save revision.');
            rev = saved.rev as number;
          } catch (error) {
            if (!(error instanceof ApiError) || error.status !== 409) throw error;
            remote = error.body as Remote;
            continue;
          }
        }
        if (epoch !== generation || session()?.token !== s.token || stopped) return;
        if (!options.canSync()) { schedule(2000); return; }
        // Changes made while the upload was in flight stay local and are queued for another sync.
        const current = copy(options.get());
        const result = same(current, local) ? merged : mergeSaves(current, merged, local);
        if (!same(result, current) && !options.apply(result)) throw new Error('Cloud progress is safe, but could not be saved on this device.');
        const meta: Session = { ...s, rev, base: merged, syncedAt: Date.now() };
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(meta));
        show(); account.error = '';
        if (!same(result, merged) || !same(before, local)) schedule();
        return;
      }
      throw new Error('Another device is saving frequently. Your local progress is safe; sync will retry.');
    } catch (error) { if (epoch === generation && !stopped) fail(error); }
    finally { account.busy = false; }
  }
  function sync(): Promise<void> {
    clearTimeout(timer);
    if (running) { again = true; return running; }
    running = run().finally(() => { running = null; if (again) { again = false; schedule(); } });
    return running;
  }
  async function signOut() {
    generation++; clearTimeout(timer);
    const s = session(); localStorage.removeItem(ACCOUNT_KEY); show(); account.error = '';
    if (s) await api(`${PLAY_URL}/api/logout`, s.token, 'POST', {}).catch(() => {});
  }
  const resume = () => { if (document.visibilityState !== 'hidden') void sync(); };
  const storage = (event: StorageEvent) => {
    if (event.key === ACCOUNT_KEY) { const changed = (session()?.token ?? null) !== tokenSeen; show(); if (changed) { generation++; void sync(); } }
    if (event.key === STORAGE_KEY && options.canSync()) {
      const raw = read(STORAGE_KEY);
      if (raw === null || isSaveData(raw)) { options.apply(raw); void sync(); }
    }
  };
  async function start() {
    show();
    addEventListener('online', resume); addEventListener('focus', resume); addEventListener('storage', storage);
    document.addEventListener('visibilitychange', resume);
    poll = setInterval(() => { void sync(); }, 30_000);
    const params = new URLSearchParams(location.search), code = params.get('mbpg_code');
    if (code) await finishSignIn(code, params.get('mbpg_state'));
    else if (session()) await sync();
  }
  function stop() {
    stopped = true; generation++; clearTimeout(timer); clearInterval(poll);
    removeEventListener('online', resume); removeEventListener('focus', resume); removeEventListener('storage', storage);
    document.removeEventListener('visibilitychange', resume);
  }
  return { account, start, stop, signIn, signOut, sync, changed: () => { account.syncedAt = null; schedule(); } };
}
