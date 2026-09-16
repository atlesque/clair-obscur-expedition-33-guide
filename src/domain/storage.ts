import { ATTRIBUTES } from './types';
import { INITIAL_CHARACTERS, LATER_CHARACTERS } from './data';
import type { Attributes, Character, Playthrough, Recommendation, SaveData } from './types';

export const STORAGE_KEY = 'expedition-33-guide.v1';
export type LoadResult = { kind: 'missing' } | { kind: 'loaded'; data: SaveData } | { kind: 'invalid'; error: string };
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const whole = (value: unknown, max = Number.MAX_SAFE_INTEGER): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const optional = (value: unknown, predicate: (value: unknown) => boolean) => value === undefined || predicate(value);
const attributes = (value: unknown): value is Attributes => record(value) && ATTRIBUTES.every(a => whole(value[a], 99));
const scaling = (value: unknown): boolean => record(value) && Object.keys(value).length <= 2 && Object.entries(value).every(([key, grade]) => ATTRIBUTES.includes(key as typeof ATTRIBUTES[number]) && typeof grade === 'string' && ['D', 'C', 'B', 'A', 'S'].includes(grade.toUpperCase()));

function recommendation(value: unknown): value is Recommendation {
  if (!record(value) || !attributes(value.base) || !record(value.spend)) return false;
  const spend = value.spend;
  const base = value.base;
  return text(value.characterId) && optional(value.basePoints, whole) && whole(value.points) && whole(value.revision, 99) && typeof value.explanation === 'string'
    && Object.entries(spend).every(([key, amount]) => ATTRIBUTES.includes(key as typeof ATTRIBUTES[number]) && whole(amount, 99) && base[key as keyof Attributes] + amount <= 99)
    && Object.values(spend).reduce<number>((sum, amount) => sum + Number(amount), 0) === value.points;
}
function skillRecommendation(value: unknown): boolean {
  return record(value) && text(value.characterId) && optional(value.skillId, text) && typeof value.save === 'boolean' && whole(value.points) && whole(value.revision, 99) && typeof value.explanation === 'string' && optional(value.baseSkillPoints, whole) && optional(value.baseUnlockedSkills, strings);
}
const characterNames = new Map<string, string>([...Object.entries(INITIAL_CHARACTERS).map(([id, data]) => [id, data.name] as [string, string]), ...LATER_CHARACTERS.map(c => [c.id, c.name] as [string, string])]);
function character(value: unknown): value is Character {
  if (!record(value) || !text(value.id) || characterNames.get(value.id) !== value.name || !whole(value.level, 99) || value.level < 1 || !attributes(value.invested) || !whole(value.points) || typeof value.tracked !== 'boolean' || typeof value.revealed !== 'boolean') return false;
  if (!optional(value.pending, recommendation) || !optional(value.weaponScaling, scaling) || !optional(value.scaling, v => record(v) && scaling(v.attributes))) return false;
  if (!optional(value.skillSetupComplete, v => typeof v === 'boolean') || !optional(value.unlockedSkills, strings) || !optional(value.discoveredSkillIds, strings) || !optional(value.skillPoints, whole) || !optional(value.loadout, strings) || !optional(value.pendingSkill, skillRecommendation) || !optional(value.skillAcquisition, v => v === 'points' || v === 'learned')) return false;
  if (value.skillSetupComplete === true && (!strings(value.unlockedSkills) || (value.id !== 'monoco' && !whole(value.skillPoints)))) return false;
  if (Array.isArray(value.loadout) && (value.loadout.length > 6 || !value.loadout.every(id => Array.isArray(value.unlockedSkills) && value.unlockedSkills.includes(id)))) return false;
  if (record(value.pending) && value.pending.characterId !== value.id) return false;
  if (record(value.pendingSkill) && value.pendingSkill.characterId !== value.id) return false;
  return true;
}
function playthrough(value: unknown): value is Playthrough {
  if (!record(value) || !text(value.id) || !text(value.name) || !Array.isArray(value.characters) || !value.characters.every(character) || !whole(value.nextRevealIndex, LATER_CHARACTERS.length) || !whole(value.revision)) return false;
  return new Set(value.characters.map(c => c.id)).size === value.characters.length;
}
function valid(value: unknown): value is SaveData {
  return record(value) && value.version === 1 && text(value.activeId) && Array.isArray(value.playthroughs) && value.playthroughs.length > 0 && value.playthroughs.every(playthrough) && new Set(value.playthroughs.map(p => p.id)).size === value.playthroughs.length && value.playthroughs.some(p => p.id === value.activeId);
}
export function load(): LoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { kind: 'missing' };
    const parsed: unknown = JSON.parse(raw);
    if (!valid(parsed)) return { kind: 'invalid', error: 'The saved playthrough is unreadable or from an unsupported version. It was kept intact; review browser storage before continuing.' };
    // Older advice lacks exact snapshots. Keep actual progress and discard only
    // these unverifiable suggestions in memory; never overwrite storage on load.
    for (const p of parsed.playthroughs) for (const c of p.characters) {
      if (c.pending && c.pending.basePoints === undefined) delete c.pending;
      if (c.pendingSkill && (c.pendingSkill.baseSkillPoints === undefined || c.pendingSkill.baseUnlockedSkills === undefined)) delete c.pendingSkill;
    }
    return { kind: 'loaded', data: parsed };
  } catch {
    return { kind: 'invalid', error: 'The saved playthrough could not be read. It was kept intact; check browser storage before continuing.' };
  }
}
export function save(data: SaveData): { ok: boolean; error?: string } {
  if (!valid(data)) return { ok: false, error: 'This change contains invalid progress and was not saved. Check the entered values and try again.' };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return { ok: true }; }
  catch { return { ok: false, error: 'Your browser could not save this change. Check storage permissions and try again.' }; }
}
export function id(prefix: string): string { return `${prefix}-${crypto.randomUUID()}`; }
