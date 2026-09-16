import { describe, expect, it } from 'vitest';
import { createPlaythrough, removeCharacter, resetPlaythrough, restoreCharacter, switchPlaythrough } from './playthroughs';
import type { Character, SaveData } from './types';

const character: Character = { id: 'gustave', name: 'Gustave', level: 6, invested: { vitality: 4, might: 2, agility: 0, defence: 1, luck: 0 }, points: 3, tracked: true, revealed: true };
const data = (): SaveData => ({ version: 1, playthroughs: [{ id: 'one', name: 'First run', characters: [character], nextRevealIndex: 2, revision: 4 }], activeId: 'one' });

describe('playthrough management', () => {
  it('creates and switches independent named records', () => {
    const withSecond = createPlaythrough(data(), 'Second run', []);
    expect(withSecond.playthroughs).toHaveLength(2);
    expect(withSecond.activeId).toBe(withSecond.playthroughs[1].id);
    expect(switchPlaythrough(withSecond, 'one').activeId).toBe('one');
    expect(withSecond.playthroughs[0].characters[0].level).toBe(6);
  });

  it('clones nested character state when creating a run', () => {
    const source: Character = {
      ...character,
      invested: { ...character.invested },
      unlockedSkills: ['overcharge'],
      loadout: ['overcharge'],
      scaling: { attributes: { might: 'S' } },
      pending: {
        characterId: character.id,
        base: { ...character.invested },
        spend: { vitality: 1 },
        points: 1,
        revision: character.level,
        explanation: 'Test advice',
      },
    };
    const created = createPlaythrough(data(), 'Independent', [source]);
    source.invested.vitality = 99;
    source.unlockedSkills?.push('marking shot');
    source.loadout?.splice(0, 1);
    source.scaling!.attributes.might = 'D';
    source.pending!.base.vitality = 99;
    source.pending!.spend.vitality = 4;

    const saved = created.playthroughs[1].characters[0];
    expect(saved.invested.vitality).toBe(4);
    expect(saved.unlockedSkills).toEqual(['overcharge']);
    expect(saved.loadout).toEqual(['overcharge']);
    expect(saved.scaling?.attributes.might).toBe('S');
    expect(saved.pending?.base.vitality).toBe(4);
    expect(saved.pending?.spend.vitality).toBe(1);
  });

  it('removes and restores the same record without advancing reveals', () => {
    const first = data().playthroughs[0];
    const removed = removeCharacter(first, 'gustave');
    expect(removed.characters[0]).toMatchObject({ tracked: false, level: 6, points: 3 });
    expect(removed.nextRevealIndex).toBe(2);
    expect(restoreCharacter(removed, 'gustave').characters[0].tracked).toBe(true);
  });

  it('resets only the selected playthrough, including removed records and reveals', () => {
    const initial = data();
    const withSecond = createPlaythrough(initial, 'Second run', [character]);
    const reset = resetPlaythrough(withSecond, 'one');
    expect(reset.playthroughs[0]).toMatchObject({ characters: [], nextRevealIndex: 0 });
    expect(reset.playthroughs[1].characters[0].level).toBe(6);
  });
});
