import { describe, expect, it } from 'vitest';
import { recommend } from './rules';
import type { Character } from './types';
const blank = { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 };
const sciel: Character = { id: 'sciel', name: 'Sciel', weapon: 'Ramasson', weaponLevel: 12, level: 20, invested: { ...blank }, points: 30, tracked: true, revealed: true };
const top = (spend: Partial<Record<string, number>>) => Object.entries(spend).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)).map(([attribute]) => attribute);

describe('weapon-aware attribute advice', () => {
  it('centres the plan on the equipped weapon’s scaling attributes, best grade first', () => {
    const rec = recommend(sciel);
    expect(rec.points).toBe(30);
    expect(top(rec.spend).slice(0, 2)).toEqual(['luck', 'vitality']);
    expect((rec.spend.luck ?? 0) + (rec.spend.vitality ?? 0)).toBeGreaterThanOrEqual(24);
    expect(rec.explanation).toContain('Ramasson scales with Luck (B) and Vitality (C) at weapon level 12');
  });
  it('adds a little of the character’s own build direction on top', () => {
    const rec = recommend(sciel);
    expect(rec.spend.agility).toBeGreaterThan(0);
    expect(rec.notes?.join(' ')).toContain('Agility');
  });
  it('changes the advice when the weapon changes', () => {
    const vitalityLed = recommend({ ...sciel, weapon: 'Ramasson' });
    const gustave = recommend({ ...sciel, id: 'gustave', name: 'Gustave', weapon: 'Velokan' });
    expect(top(gustave.spend)[0]).toBe('agility');
    expect(top(vitalityLed.spend)[0]).not.toBe('agility');
  });
  it('uses level 1 grades and says so when the weapon level is missing', () => {
    const rec = recommend({ ...sciel, weaponLevel: undefined });
    expect(rec.explanation).toContain('Luck (C) and Vitality (D)');
    expect(rec.notes?.join(' ')).toContain('weapon level isn’t recorded');
  });
  it('points out the next grade upgrade', () => {
    expect(recommend(sciel).notes?.join(' ')).toContain('level 20');
    expect(recommend({ ...sciel, weaponLevel: 33 }).notes?.join(' ')).not.toContain('raises every grade');
  });
  it('falls back to the character’s general build when the weapon is unknown', () => {
    const rec = recommend({ ...sciel, weapon: 'Something homemade' });
    expect(rec.explanation).toContain('isn’t in the guide’s weapon list');
    expect(top(rec.spend)).toContain('agility');
    expect(rec.spend.vitality).toBeGreaterThan(0);
  });
  it('keeps building around scaling once an attribute is capped', () => {
    const rec = recommend({ ...sciel, invested: { ...blank, luck: 99 } });
    expect(rec.spend.luck).toBeUndefined();
    expect(top(rec.spend)[0]).toBe('vitality');
  });
});
