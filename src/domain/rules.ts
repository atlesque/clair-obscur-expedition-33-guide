import { ATTRIBUTES, cloneAttributes } from './types';
import type { Attributes, Character, Recommendation } from './types';
const priority = (character: Character): (keyof Attributes)[] => character.id === 'lune' ? ['vitality','might','agility','defence','luck'] : ['vitality','might','defence','agility','luck'];
export function recommend(character: Character): Recommendation {
  const spend: Partial<Attributes> = {}; let left = character.points; const order=priority(character);
  while (left) { const attribute=order.find(a=>character.invested[a]+(spend[a]??0)<99); if (!attribute) break; spend[attribute]=(spend[attribute]??0)+1; left--; }
  return { characterId: character.id, base: cloneAttributes(character.invested), basePoints: character.points, spend, points: character.points - left, explanation: character.points ? 'Prioritises survivability first, then reliable damage, while respecting each attribute cap. This general advice does not account for equipped-weapon scaling.' : 'There are no available attribute points to allocate.', revision: character.level };
}
export function applyRecommendation(character: Character, rec: Recommendation): Character { if (rec.revision !== character.level || rec.characterId !== character.id || rec.base.vitality !== character.invested.vitality || rec.base.might !== character.invested.might || rec.base.agility !== character.invested.agility || rec.base.defence !== character.invested.defence || rec.base.luck !== character.invested.luck || rec.points > character.points) return character;
  if (rec.basePoints !== character.points || Object.values(rec.spend).some(v => !Number.isInteger(v) || v! < 0) || rec.points !== Object.values(rec.spend).reduce((a,v)=>a+(v??0),0)) return character;
  const invested = cloneAttributes(character.invested); for (const attr of ATTRIBUTES) invested[attr] += rec.spend[attr] ?? 0; return { ...character, invested, points: character.points - rec.points, pending: undefined };
}
export function updateProgress(character: Character, input: {level:number; invested:Attributes; points:number}): Character { if (!Number.isInteger(input.level)||input.level<1||input.level>99||!Number.isInteger(input.points)||input.points<0||ATTRIBUTES.some(a=>!Number.isInteger(input.invested[a])||input.invested[a]<0||input.invested[a]>99)) throw new Error('Enter whole numbers within the supported level and attribute ranges.'); return { ...character, level: input.level, invested: cloneAttributes(input.invested), points: input.points, pending: undefined }; }
