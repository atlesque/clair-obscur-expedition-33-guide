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
