import type { Playthrough, SaveData } from './types';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Three-way merge: independent playthroughs combine; conflicting edits remain as two recoverable runs. */
export function mergeSaves(local: SaveData | null, remote: SaveData | null, base: SaveData | null): SaveData | null {
  const runs = new Map<string, Playthrough>();
  const mine = new Map(local?.playthroughs.map(run => [run.id, run]) ?? []);
  const theirs = new Map(remote?.playthroughs.map(run => [run.id, run]) ?? []);
  const previous = new Map(base?.playthroughs.map(run => [run.id, run]) ?? []);
  for (const id of new Set([...mine.keys(), ...theirs.keys(), ...previous.keys()])) {
    const l = mine.get(id), r = theirs.get(id), b = previous.get(id);
    if (same(l, r)) { if (l) runs.set(id, l); }
    else if (same(l, b)) { if (r) runs.set(id, r); }
    else if (same(r, b)) { if (l) runs.set(id, l); }
    else {
      // An edit beats a concurrent deletion. Two different edits keep both versions.
      if (r) runs.set(id, r);
      if (l && !r) runs.set(id, l);
      else if (l && r) {
        const recovered = { ...l, id: crypto.randomUUID(), name: `${l.name} (recovered copy)` };
        runs.set(recovered.id, recovered);
      }
    }
  }
  if (!runs.size) return null;
  const activeId = [local?.activeId, remote?.activeId].find(id => id && runs.has(id)) ?? [...runs.keys()][0];
  return { version: 1, activeId, playthroughs: [...runs.values()] };
}
