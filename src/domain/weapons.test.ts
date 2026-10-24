import { describe, expect, it } from 'vitest';
import { findWeapon, searchWeapons, weaponScaling, weaponsFor } from './weapons';

describe('weapons', () => {
  it('gives every character a weapon pool, with Verso sharing Gustave’s swords', () => {
    for (const id of ['gustave', 'lune', 'maelle', 'sciel', 'verso', 'monoco']) expect(weaponsFor(id).length).toBeGreaterThan(0);
    expect(weaponsFor('verso')).toBe(weaponsFor('gustave'));
    expect(weaponsFor('unknown')).toEqual([]);
  });

  it('only searches after three letters and matches name prefixes for that character', () => {
    expect(searchWeapons('lune', 'co')).toEqual([]);
    expect(searchWeapons('lune', 'Col').map(w => w.name)).toEqual(['Colim']);
    expect(searchWeapons('gustave', 'col')).toEqual([]);
    expect(searchWeapons('lune', 'lim')).toEqual([]);
  });

  it('reports the scaling attributes and grades of a recorded weapon', () => {
    expect(findWeapon('lune', '  colim ')?.name).toBe('Colim');
    expect(weaponScaling('lune', 'Colim')).toEqual({ vitality: 'S', agility: 'A' });
    expect(weaponScaling('lune', 'Recorded weapon')).toEqual({});
    expect(weaponScaling('lune')).toEqual({});
  });
});
