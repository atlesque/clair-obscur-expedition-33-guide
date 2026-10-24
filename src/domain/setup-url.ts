import { INITIAL_CHARACTERS, LATER_CHARACTERS } from './data';
import { ATTRIBUTES } from './types';
import type { Attributes } from './types';

export type SetupProgress = { level: number; points: number; invested: Attributes; weapon?: string };
export type SetupDraft = {
  version: 1;
  mode: 'new' | 'midway' | null;
  screen: string;
  name: string;
  selected: string[];
  revealed: number;
  revealComplete?: boolean;
  progress: Record<string, SetupProgress>;
};

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function readSetupDraft(search: string): SetupDraft | null {
  try {
    const raw = new URLSearchParams(search).get('setup');
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!isObject(data) || data.version !== 1 || ![null, 'new', 'midway'].includes(data.mode as null | string) || typeof data.name !== 'string' || !Number.isInteger(data.revealed) || (data.revealed as number) < 0 || (data.revealed as number) > LATER_CHARACTERS.length) return null;
    if (data.revealComplete !== undefined && (typeof data.revealComplete !== 'boolean' || (data.revealComplete && data.revealed !== LATER_CHARACTERS.length))) return null;
    const available = [
      ...Object.keys(INITIAL_CHARACTERS),
      ...(data.mode === 'midway' ? LATER_CHARACTERS.slice(0, data.revealed as number).map(item => item.id) : []),
    ];
    if (!Array.isArray(data.selected) || data.selected.some(id => typeof id !== 'string' || !available.includes(id)) || new Set(data.selected).size !== data.selected.length || !isObject(data.progress)) return null;
    const selected = data.selected;
    const screens = ['mode', ...(data.mode ? ['name', 'party', ...data.selected] : [])];
    if (typeof data.screen !== 'string' || !screens.includes(data.screen)) return null;
    if (Object.entries(data.progress).some(([id, progress]) => !selected.includes(id) || !isObject(progress) || !isNumber(progress.level) || !isNumber(progress.points) || (progress.weapon !== undefined && (typeof progress.weapon !== 'string' || progress.weapon.length > 120)) || !isObject(progress.invested) || ATTRIBUTES.some(attribute => !isNumber((progress.invested as Record<string, unknown>)[attribute])))) return null;
    return data as SetupDraft;
  } catch {
    return null;
  }
}

export function writeSetupDraft(draft: SetupDraft | null) {
  const url = new URL(window.location.href);
  if (draft) url.searchParams.set('setup', JSON.stringify(draft));
  else url.searchParams.delete('setup');
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
}
