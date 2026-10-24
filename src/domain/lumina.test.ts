import { describe, expect, it } from 'vitest';
import { applyColourPlan, planColours } from './lumina';
import { updateProgress } from './rules';
import { isSaveData } from './storage';
import type { Character, Playthrough } from './types';

const fighter = (id: string, total: number, spent = total, inParty = false): Character => ({
  id, name: id, weapon: 'Recorded weapon', level: 10, invested: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, points: 0,
  tracked: true, revealed: true, lumina: { total, spent }, inParty,
});
const run = (characters: Character[], colours: number): Playthrough => ({ id: 'p', name: 'Run', characters, nextRevealIndex: 0, revision: 0, colours });

describe('Lumina points and Colours of Lumina', () => {
  it('gives Colours only to the active combat party, evening out their totals', () => {
    const plan = planColours(run([fighter('gustave', 10, 10, true), fighter('lune', 6, 6, true), fighter('maelle', 0)], 6));
    expect(plan.give).toEqual({ gustave: 1, lune: 5 });
    expect(plan.explanation).toContain('active combat party');
  });
  it('spreads Colours across everyone tracked when no combat party is marked', () => {
    const plan = planColours(run([fighter('gustave', 4), fighter('lune', 4)], 3));
    expect(plan.give).toEqual({ gustave: 2, lune: 1 });
    expect(plan.explanation).toContain('No active combat party');
  });
  it('prefers the fighter with fewer free points on equal totals', () => {
    expect(planColours(run([fighter('gustave', 5, 2, true), fighter('lune', 5, 5, true)], 1)).give).toEqual({ lune: 1 });
  });
  it('applies a plan once and rejects it after progress changes', () => {
    const playthrough = run([fighter('gustave', 2, 2, true)], 2);
    const plan = planColours(playthrough);
    const applied = applyColourPlan(playthrough, plan);
    expect(applied.characters[0].lumina).toEqual({ total: 4, spent: 2 });
    expect(applied.colours).toBe(0);
    expect(applyColourPlan(applied, plan)).toBe(applied);
  });
  it('records Lumina points through progress updates and keeps them when omitted', () => {
    const legacy = { ...fighter('gustave', 0), lumina: undefined };
    expect(updateProgress(legacy, { level: 10, points: 0, invested: legacy.invested, lumina: { total: 0, spent: 0 } }).lumina).toBeUndefined();
    const recorded = updateProgress(legacy, { level: 10, points: 0, invested: legacy.invested, lumina: { total: 12, spent: 9 } });
    expect(recorded.lumina).toEqual({ total: 12, spent: 9 });
    expect(updateProgress(recorded, { level: 11, points: 3, invested: legacy.invested }).lumina).toEqual({ total: 12, spent: 9 });
    expect(() => updateProgress(recorded, { level: 11, points: 3, invested: legacy.invested, lumina: { total: 4, spent: 9 } })).toThrow('cannot exceed');
  });
  it('accepts saves with and without Lumina data', () => {
    const playthrough = run([fighter('gustave', 3, 1, true)], 2);
    expect(isSaveData({ version: 1, playthroughs: [playthrough], activeId: 'p' })).toBe(true);
    expect(isSaveData({ version: 1, playthroughs: [{ ...playthrough, colourPlan: planColours(playthrough) }], activeId: 'p' })).toBe(true);
    expect(isSaveData({ version: 1, playthroughs: [{ ...playthrough, colours: -1 }], activeId: 'p' })).toBe(false);
  });
});
