import { ATTRIBUTES, cloneAttributes } from './types';
import type { Attributes, Character, Recommendation } from './types';
const priority = (character: Character): (keyof Attributes)[] => character.id === 'lune' ? ['vitality','might','agility','defence','luck'] : ['vitality','might','defence','agility','luck'];
export function recommend(character: Character): Recommendation {
  const spend: Partial<Attributes> = {}; let left = Math.max(0, character.points);
  for (const attribute of priority(character)) { if (!left) break; const room = Math.max(0, 99 - character.invested[attribute]); const amount = Math.min(left, room, attribute === 'vitality' ? 2 : 1); if (amount) { spend[attribute] = amount; left -= amount; } }
  return { characterId: character.id, base: cloneAttributes(character.invested), spend, points: character.points - left, explanation: character.points ? 'Prioritises a little survivability, then reliable damage. This general advice does not account for equipped-weapon scaling.' : 'There are no available attribute points to allocate.', revision: character.level };
}
export function applyRecommendation(character: Character, rec: Recommendation): Character { if (rec.revision !== character.level || rec.characterId !== character.id || rec.base.vitality !== character.invested.vitality || rec.base.might !== character.invested.might || rec.base.agility !== character.invested.agility || rec.base.defence !== character.invested.defence || rec.base.luck !== character.invested.luck || rec.points > character.points) return character;
  const invested = cloneAttributes(character.invested); for (const attr of ATTRIBUTES) invested[attr] += rec.spend[attr] ?? 0; return { ...character, invested, points: character.points - rec.points, pending: undefined };
}
export function updateProgress(character: Character, input: {level:number; invested:Attributes; points:number}): Character { return { ...character, level: Math.max(1, input.level), invested: cloneAttributes(input.invested), points: Math.max(0, input.points), pending: undefined }; }
