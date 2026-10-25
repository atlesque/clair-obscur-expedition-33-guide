import { describe, expect, it } from 'vitest';
import { applyRecommendation, recommend, setStat, setWeapon, updateProgress } from './rules';
import { characterAvatar } from './data';
import type { Character } from './types';
const base: Character = { id:'gustave', name:'Gustave', weapon:'Recorded weapon', level:10, invested:{vitality:3,might:2,agility:0,defence:0,luck:0}, points:0, tracked:true, revealed:true };
describe('progression public rules', () => {
  it('requires and preserves an equipped weapon when recording progress', () => {
    const legacy = { ...base, weapon: undefined };
    expect(() => updateProgress(legacy, {level:10, points:0, invested:base.invested})).toThrow('equipped weapon');
    const updated = updateProgress(legacy, {level:10, points:0, invested:base.invested, weapon:'  Recorded weapon  '});
    expect(updated.weapon).toBe('Recorded weapon');
    expect(updateProgress(updated, {level:11, points:3, invested:base.invested}).weapon).toBe('Recorded weapon');
  });
  it('records and preserves the weapon level within the game range', () => {
    const levelled = updateProgress(base, {level:10, points:0, invested:base.invested, weaponLevel:20});
    expect(levelled.weaponLevel).toBe(20);
    expect(updateProgress(levelled, {level:11, points:3, invested:base.invested}).weaponLevel).toBe(20);
    expect(updateProgress(base, {level:10, points:0, invested:base.invested}).weaponLevel).toBeUndefined();
    expect(() => updateProgress(base, {level:10, points:0, invested:base.invested, weaponLevel:34})).toThrow('weapon level');
  });
  it('maps every playable character to a bundled portrait', () => {
    for (const characterId of ['gustave', 'lune', 'maelle', 'sciel', 'verso', 'monoco']) {
      expect(characterAvatar(characterId)).toBe(`/avatars/${characterId}.png`);
    }
  });
  it('reconciles a direct catch-up and recommends only remaining points', () => { const c=updateProgress(base,{level:16, invested:{...base.invested}, points:6}); const rec=recommend(c); expect(rec.points).toBeLessThanOrEqual(6); expect(Object.values(rec.spend).reduce((a,b)=>a+(b??0),0)).toBeLessThanOrEqual(6); });
  it('allocates all available points while respecting caps', () => { const c=updateProgress(base,{level:30,invested:{vitality:98,might:99,agility:0,defence:0,luck:0},points:30}); const rec=recommend(c); expect(rec.points).toBe(30); expect(rec.spend.might).toBeUndefined(); expect(c.invested.vitality+(rec.spend.vitality??0)).toBeLessThanOrEqual(99); });
  it('keeps zero-point advice explanatory', () => expect(recommend(base).explanation).toContain('no available'));
  it('rejects stale confirmation without changing actual state', () => { const c={...base,points:2}; const rec=recommend(c); const newer={...c,level:11}; expect(applyRecommendation(newer,rec)).toBe(newer); });
  it('applies a recommendation once', () => { const c={...base,points:2}; const rec=recommend(c); const applied=applyRecommendation(c,rec); expect(applied.points).toBe(0); expect(applyRecommendation(applied,rec)).toBe(applied); });
  it('rejects changed balances and invalid progress explicitly', () => { const c={...base,points:2}; const rec=recommend(c); expect(applyRecommendation({...c,points:1},rec)).toEqual({...c,points:1}); expect(()=>updateProgress(c,{level:0,invested:c.invested,points:0})).toThrow(); expect(()=>updateProgress(c,{level:10,invested:{...c.invested,vitality:100},points:0})).toThrow(); });
  it('sets one recorded value directly and clears stale advice', () => {
    const advised = { ...base, points: 2, pending: recommend({ ...base, points: 2 }) };
    const levelled = setStat(advised, 'level', 25);
    expect(levelled).toMatchObject({ level: 25, points: 2, weapon: 'Recorded weapon', pending: undefined });
    expect(setStat(base, 'points', 7).points).toBe(7);
    const might = setStat(base, 'might', 40);
    expect(might.invested).toEqual({ ...base.invested, might: 40 });
    expect(base.invested.might).toBe(2);
    // Older saves without a weapon can still have a single value set.
    expect(setStat({ ...base, weapon: undefined }, 'luck', 5).invested.luck).toBe(5);
    expect(() => setStat(base, 'level', 0)).toThrow('1 to 99');
    expect(() => setStat(base, 'vitality', 100)).toThrow('0 to 99');
    expect(() => setStat(base, 'points', -1)).toThrow('zero or more');
    expect(() => setStat(base, 'agility', 1.5)).toThrow('whole number');
  });
  it('sets the weapon on its own and clears advice built around the old one', () => {
    const advised = { ...base, points: 2, pending: recommend({ ...base, points: 2 }) };
    expect(setWeapon(advised, '  Abysseram ', 20)).toMatchObject({ weapon: 'Abysseram', weaponLevel: 20, level: 10, pending: undefined });
    expect(() => setWeapon(base, ' ', 1)).toThrow('equipped weapon');
    expect(() => setWeapon(base, 'Abysseram', 34)).toThrow('weapon level');
  });
});
