import { describe, it, expect } from 'vitest';
import { mergeSaves } from './sync-merge';
import type { SaveData } from './types';
const save = (name = 'Run', id = 'run'): SaveData => ({ version: 1, activeId: id, playthroughs: [{ id, name, characters: [], nextRevealIndex: 0, revision: 0 }] });
describe('cross-device playthrough merge', () => {
  it('recovers cloud saves on a fresh device and uploads a first local save', () => {
    expect(mergeSaves(null, save(), null)).toEqual(save());
    expect(mergeSaves(save(), null, null)).toEqual(save());
  });
  it('combines independent playthroughs', () => {
    const result = mergeSaves(save('Local','local'), save('Cloud','cloud'), null)!;
    expect(result.playthroughs.map(run => run.id)).toEqual(['local','cloud']);
    expect(result.activeId).toBe('local');
  });
  it('adopts a remote edit when the local copy has not changed', () => {
    expect(mergeSaves(save(), save('Remote edit'), save())).toEqual(save('Remote edit'));
  });
  it('keeps a local edit when the remote copy has not changed', () => {
    expect(mergeSaves(save('Offline edit'), save(), save())).toEqual(save('Offline edit'));
  });
  it('honors deletions without resurrecting stale copies', () => {
    expect(mergeSaves(null, save(), save())).toBe(null);
    expect(mergeSaves(save(), null, save())).toBe(null);
  });
  it('preserves both concurrent edits with separate identities', () => {
    const result = mergeSaves(save('Local edit'), save('Remote edit'), save())!;
    expect(result.playthroughs).toHaveLength(2);
    expect(result.playthroughs[0].name).toBe('Remote edit');
    expect(result.playthroughs[1].name).toBe('Local edit (recovered copy)');
    expect(result.playthroughs[1].id).not.toBe('run');
  });
  it('preserves an edit made concurrently with deletion', () => {
    expect(mergeSaves(save('Offline edit'), null, save())).toEqual(save('Offline edit'));
    expect(mergeSaves(null, save('Remote edit'), save())).toEqual(save('Remote edit'));
  });
});
