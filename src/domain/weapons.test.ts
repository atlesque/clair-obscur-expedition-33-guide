import { describe, expect, it } from 'vitest';
import { findWeapon, gradeAtLevel, searchWeapons, weaponScaling, weaponsFor } from './weapons';

describe('weapons', () => {
  it('gives every character their own weapon pool', () => {
    for (const id of ['gustave', 'lune', 'maelle', 'sciel', 'verso', 'monoco']) expect(weaponsFor(id).length).toBeGreaterThan(0);
    expect(weaponsFor('verso').some(w => w.name === 'Noahram')).toBe(false);
    expect(weaponsFor('unknown')).toEqual([]);
  });

  it('only searches after three letters and matches name prefixes for that character', () => {
    expect(searchWeapons('lune', 'co')).toEqual([]);
    expect(searchWeapons('lune', 'Col').map(w => w.name)).toEqual(['Colim']);
    expect(searchWeapons('gustave', 'col')).toEqual([]);
    expect(searchWeapons('lune', 'lim')).toEqual([]);
  });

  it('raises grades by one at weapon levels 4, 20 and 33, capped at S', () => {
    expect([1, 3, 4, 19, 20, 32, 33].map(level => gradeAtLevel('D', level))).toEqual(['D', 'D', 'C', 'C', 'B', 'B', 'A']);
    expect(gradeAtLevel('C', 33)).toBe('S');
    expect(gradeAtLevel('A', 20)).toBe('S');
    expect(gradeAtLevel('A')).toBe('A');
  });

  it('reports the scaling attributes and grades of a recorded weapon', () => {
    expect(findWeapon('lune', '  colim ')?.name).toBe('Colim');
    expect(weaponScaling('lune', 'Colim')).toEqual({ vitality: 'C', agility: 'D' });
    expect(weaponScaling('lune', 'Colim', 20)).toEqual({ vitality: 'A', agility: 'B' });
    expect(weaponScaling('lune', 'Recorded weapon')).toEqual({});
    expect(weaponScaling('lune')).toEqual({});
  });
});
