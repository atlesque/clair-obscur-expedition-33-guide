import { ATTRIBUTES, cloneAttributes } from './types';
import type { Attributes, Character, Lumina, Recommendation } from './types';
import { ATTRIBUTE_PRIORITIES } from './data';
import { MAX_WEAPON_LEVEL, isWeaponLevel } from './weapons';
import { validateLumina } from './lumina';
const weights = (character: Character): Record<keyof Attributes, number> => (ATTRIBUTE_PRIORITIES[character.id as keyof typeof ATTRIBUTE_PRIORITIES] ?? ATTRIBUTE_PRIORITIES.default).weights;
export function recommend(character: Character): Recommendation {
  const spend: Partial<Attributes> = {}; let left = character.points; const target=weights(character);
  while (left) {
    const candidates = ATTRIBUTES.filter(a => character.invested[a] + (spend[a] ?? 0) < 99);
    const attribute = candidates.sort((a,b) => {
      const total = ATTRIBUTES.reduce((sum, key) => sum + character.invested[key] + (spend[key] ?? 0), 0);
      const deficit = (a: keyof Attributes) => target[a] * (total + 1) - (character.invested[a] + (spend[a] ?? 0));
      return deficit(b) - deficit(a);
    })[0];
    if (!attribute) break;
    spend[attribute]=(spend[attribute]??0)+1; left--;
  }
  return { characterId: character.id, base: cloneAttributes(character.invested), basePoints: character.points, spend, points: character.points - left, explanation: character.points ? 'Prioritises survivability first, then reliable damage, while respecting each attribute cap. This general advice does not account for equipped-weapon scaling.' : 'There are no available attribute points to allocate.', revision: character.level };
}
export function applyRecommendation(character: Character, rec: Recommendation): Character { if (rec.revision !== character.level || rec.characterId !== character.id || rec.base.vitality !== character.invested.vitality || rec.base.might !== character.invested.might || rec.base.agility !== character.invested.agility || rec.base.defence !== character.invested.defence || rec.base.luck !== character.invested.luck || rec.points > character.points) return character;
  if (rec.basePoints !== character.points || Object.values(rec.spend).some(v => !Number.isInteger(v) || v! < 0) || rec.points !== Object.values(rec.spend).reduce((a,v)=>a+(v??0),0)) return character;
  const invested = cloneAttributes(character.invested); for (const attr of ATTRIBUTES) { const amount=rec.spend[attr]??0; if (invested[attr]+amount>99) return character; invested[attr]+=amount; } return { ...character, invested, points: character.points - rec.points, pending: undefined };
}
export function updateProgress(character: Character, input: {level:number; invested:Attributes; points:number; weapon?:string; weaponLevel?:number; lumina?:Lumina}): Character { if (!Number.isInteger(input.level)||input.level<1||input.level>99||!Number.isInteger(input.points)||input.points<0||ATTRIBUTES.some(a=>!Number.isInteger(input.invested[a])||input.invested[a]<0||input.invested[a]>99)) throw new Error('Enter whole numbers within the supported level and attribute ranges.'); const weapon = (input.weapon ?? character.weapon ?? '').trim(); if (!weapon || weapon.length > 120) throw new Error('Enter the equipped weapon name (up to 120 characters).'); const weaponLevel = input.weaponLevel ?? character.weaponLevel; if (weaponLevel !== undefined && !isWeaponLevel(weaponLevel)) throw new Error(`Enter a weapon level from 1 to ${MAX_WEAPON_LEVEL}.`); // An untouched 0 / 0 entry means the player hasn't recorded Lumina points yet.
  const recorded = input.lumina && (character.lumina || input.lumina.total || input.lumina.spent); const lumina = recorded ? validateLumina(input.lumina!.total, input.lumina!.spent) : character.lumina; return { ...character, weapon, ...(weaponLevel === undefined ? {} : { weaponLevel }), ...(lumina === undefined ? {} : { lumina: { ...lumina } }), level: input.level, invested: cloneAttributes(input.invested), points: input.points, pending: undefined }; }
