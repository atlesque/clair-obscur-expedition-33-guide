import { id } from './storage';
import type { Character, Playthrough, SaveData } from './types';

/** The selected playthrough is the only record these operations ever mutate. */
export function createPlaythrough(data: SaveData, name: string, characters: Character[] = []): SaveData {
  const playthrough: Playthrough = {
    id: id('playthrough'),
    name: name.trim() || 'My Expedition',
    characters: characters.map((character) => ({ ...character, tracked: true })),
    nextRevealIndex: 0,
    revision: 0,
  };
  return { ...data, playthroughs: [...data.playthroughs, playthrough], activeId: playthrough.id };
}

export function switchPlaythrough(data: SaveData, playthroughId: string): SaveData {
  return data.playthroughs.some((playthrough) => playthrough.id === playthroughId)
    ? { ...data, activeId: playthroughId }
    : data;
}

export function removeCharacter(playthrough: Playthrough, characterId: string): Playthrough {
  const character = playthrough.characters.find((candidate) => candidate.id === characterId);
  if (!character || !character.tracked) return playthrough;
  return {
    ...playthrough,
    revision: playthrough.revision + 1,
    characters: playthrough.characters.map((candidate) =>
      candidate.id === characterId ? { ...candidate, tracked: false, pending: undefined, pendingSkill: undefined } : candidate,
    ),
  };
}

export function restoreCharacter(playthrough: Playthrough, characterId: string): Playthrough {
  const character = playthrough.characters.find((candidate) => candidate.id === characterId);
  if (!character || character.tracked) return playthrough;
  return {
    ...playthrough,
    revision: playthrough.revision + 1,
    characters: playthrough.characters.map((candidate) =>
      candidate.id === characterId ? { ...candidate, tracked: true, pending: undefined, pendingSkill: undefined } : candidate,
    ),
  };
}

export function resetPlaythrough(data: SaveData, playthroughId: string): SaveData {
  const target = data.playthroughs.find((playthrough) => playthrough.id === playthroughId);
  if (!target) return data;
  return {
    ...data,
    playthroughs: data.playthroughs.map((playthrough) =>
      playthrough.id === playthroughId ? { ...playthrough, characters: [], nextRevealIndex: 0, revision: playthrough.revision + 1 } : playthrough,
    ),
  };
}
