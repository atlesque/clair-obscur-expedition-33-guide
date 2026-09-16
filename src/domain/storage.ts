import type { SaveData } from './types';
export const STORAGE_KEY = 'expedition-33-guide.v1';
export function load(): SaveData | null { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; const parsed: unknown = JSON.parse(raw); if (!parsed || typeof parsed !== 'object' || (parsed as {version?:unknown}).version !== 1 || !Array.isArray((parsed as {playthroughs?:unknown}).playthroughs)) return null; return parsed as SaveData; } catch { return null; } }
export function save(data: SaveData): {ok:boolean; error?:string} { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return {ok:true}; } catch { return {ok:false, error:'Your browser could not save this change. Check storage permissions and try again.'}; } }
export function id(prefix: string): string { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
