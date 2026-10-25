import { ATTRIBUTES, cloneAttributes } from './types';
import type { Attribute, Attributes, Character, Lumina, Recommendation } from './types';
import { attributePlan } from './advice';
import { MAX_WEAPON_LEVEL, isWeaponLevel } from './weapons';
import { validateLumina } from './lumina';
export function recommend(character: Character): Recommendation {
  const spend: Partial<Attributes> = {}; let left = character.points; const plan = attributePlan(character); const target = plan.weights;
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
  return { characterId: character.id, base: cloneAttributes(character.invested), basePoints: character.points, spend, points: character.points - left, explanation: character.points ? plan.explanation : `There are no available attribute points to allocate. ${plan.explanation}`, notes: plan.notes, revision: character.level };
}
export function applyRecommendation(character: Character, rec: Recommendation): Character { if (rec.revision !== character.level || rec.characterId !== character.id || rec.base.vitality !== character.invested.vitality || rec.base.might !== character.invested.might || rec.base.agility !== character.invested.agility || rec.base.defence !== character.invested.defence || rec.base.luck !== character.invested.luck || rec.points > character.points) return character;
  if (rec.basePoints !== character.points || Object.values(rec.spend).some(v => !Number.isInteger(v) || v! < 0) || rec.points !== Object.values(rec.spend).reduce((a,v)=>a+(v??0),0)) return character;
  const invested = cloneAttributes(character.invested); for (const attr of ATTRIBUTES) { const amount=rec.spend[attr]??0; if (invested[attr]+amount>99) return character; invested[attr]+=amount; } return { ...character, invested, points: character.points - rec.points, pending: undefined };
}
export function updateProgress(character: Character, input: {level:number; invested:Attributes; points:number; weapon?:string; weaponLevel?:number; lumina?:Lumina}): Character { if (!Number.isInteger(input.level)||input.level<1||input.level>99||!Number.isInteger(input.points)||input.points<0||ATTRIBUTES.some(a=>!Number.isInteger(input.invested[a])||input.invested[a]<0||input.invested[a]>99)) throw new Error('Enter whole numbers within the supported level and attribute ranges.'); const weapon = (input.weapon ?? character.weapon ?? '').trim(); if (!weapon || weapon.length > 120) throw new Error('Enter the equipped weapon name (up to 120 characters).'); const weaponLevel = input.weaponLevel ?? character.weaponLevel; if (weaponLevel !== undefined && !isWeaponLevel(weaponLevel)) throw new Error(`Enter a weapon level from 1 to ${MAX_WEAPON_LEVEL}.`); // An untouched 0 / 0 entry means the player hasn't recorded Lumina points yet.
  const recorded = input.lumina && (character.lumina || input.lumina.total || input.lumina.spent); const lumina = recorded ? validateLumina(input.lumina!.total, input.lumina!.spent) : character.lumina; return { ...character, weapon, ...(weaponLevel === undefined ? {} : { weaponLevel }), ...(lumina === undefined ? {} : { lumina: { ...lumina } }), level: input.level, invested: cloneAttributes(input.invested), points: input.points, pending: undefined }; }

/** A single recorded value the player can set straight from the character card. */
export type StatField = 'level' | 'points' | Attribute;
export const statLimits = (field: StatField) => field === 'level' ? { min: 1, max: 99 } : field === 'points' ? { min: 0, max: Number.MAX_SAFE_INTEGER } : { min: 0, max: 99 };

/** Sets one recorded value without touching the weapon or Lumina. Pending advice is cleared, because it was based on the old value. */
export function setStat(character: Character, field: StatField, value: number): Character {
  const { min, max } = statLimits(field);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(field === 'points' ? 'Enter zero or more available points, as a whole number.' : `Enter a whole number from ${min} to ${max}.`);
  if (field === 'level' || field === 'points') return { ...character, [field]: value, pending: undefined };
  return { ...character, invested: { ...cloneAttributes(character.invested), [field]: value }, pending: undefined };
}

/** Records the equipped weapon and its level on their own. Advice is built around the weapon, so pending advice is cleared. */
export function setWeapon(character: Character, name: string, weaponLevel: number): Character {
  const weapon = name.trim();
  if (!weapon || weapon.length > 120) throw new Error('Enter the equipped weapon name (up to 120 characters).');
  if (!isWeaponLevel(weaponLevel)) throw new Error(`Enter a weapon level from 1 to ${MAX_WEAPON_LEVEL}.`);
  return { ...character, weapon, weaponLevel, pending: undefined };
}
