import { ATTRIBUTES } from './types';
import type { Attributes, Character, Playthrough, Recommendation, SaveData } from './types';
export const STORAGE_KEY = 'expedition-33-guide.v1';
export type LoadResult = { kind: 'missing' } | { kind: 'loaded'; data: SaveData } | { kind: 'invalid'; error: string };
const isAttributes = (value: unknown): value is Attributes => typeof value === 'object' && value !== null && ATTRIBUTES.every(a => Number.isInteger((value as Record<string, unknown>)[a]) && (value as Record<string, number>)[a] >= 0 && (value as Record<string, number>)[a] <= 99);
const isRecommendation = (value: unknown): value is Recommendation => {
  if (!value || typeof value !== 'object') return false;
  const r = value as Partial<Recommendation>;
  const basePoints = r.basePoints; const points = r.points; return typeof r.characterId === 'string' && isAttributes(r.base) && typeof basePoints === 'number' && Number.isInteger(basePoints) && basePoints >= 0 && !!r.spend && typeof r.spend === 'object' && Object.entries(r.spend).every(([key, amount]) => ATTRIBUTES.includes(key as typeof ATTRIBUTES[number]) && Number.isInteger(amount) && (amount as number) >= 0) && typeof points === 'number' && Number.isInteger(points) && points >= 0 && Number.isInteger(r.revision) && typeof r.explanation === 'string';
};
const isCharacter = (value: unknown): value is Character => {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<Character>;
  const level = c.level; const points = c.points; return typeof c.id === 'string' && typeof c.name === 'string' && typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 99 && isAttributes(c.invested) && typeof points === 'number' && Number.isInteger(points) && points >= 0 && typeof c.tracked === 'boolean' && typeof c.revealed === 'boolean' && (c.pending === undefined || isRecommendation(c.pending));
};
const isPlaythrough = (value: unknown): value is Playthrough => {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<Playthrough>;
  const nextRevealIndex = p.nextRevealIndex; const revision = p.revision; return typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.characters) && p.characters.every(isCharacter) && typeof nextRevealIndex === 'number' && Number.isInteger(nextRevealIndex) && nextRevealIndex >= 0 && typeof revision === 'number' && Number.isInteger(revision) && revision >= 0;
};
function valid(data: unknown): data is SaveData { if (!data || typeof data !== 'object') return false; const d=data as Partial<SaveData>; return d.version===1 && Array.isArray(d.playthroughs) && typeof d.activeId==='string' && d.playthroughs.length>0 && d.playthroughs.every(isPlaythrough) && d.playthroughs.some(p=>p.id===d.activeId); }
export function load(): LoadResult { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return {kind:'missing'}; const parsed: unknown = JSON.parse(raw); if (!valid(parsed)) return {kind:'invalid', error:'The saved playthrough is unreadable or from an unsupported version. It was kept intact; review browser storage before continuing.'}; return {kind:'loaded', data: parsed}; } catch { return {kind:'invalid', error:'The saved playthrough could not be read. It was kept intact; check browser storage before continuing.'}; } }
export function save(data: SaveData): {ok:boolean; error?:string} { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return {ok:true}; } catch { return {ok:false, error:'Your browser could not save this change. Check storage permissions and try again.'}; } }
export function clear(): {ok:boolean; error?:string} { try { localStorage.removeItem(STORAGE_KEY); return {ok:true}; } catch { return {ok:false, error:'Your browser could not clear this expedition. Check storage permissions and try again.'}; } }
export function id(prefix: string): string { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
