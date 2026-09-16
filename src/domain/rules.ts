import { ATTRIBUTES, cloneAttributes } from './types';
import type { Attributes, Character, Recommendation, SkillRecommendation } from './types';
import { SKILLS } from './data';
const priority = (character: Character): (keyof Attributes)[] => {
  const general: (keyof Attributes)[] = character.id === 'lune' ? ['vitality','might','agility','defence','luck'] : ['vitality','might','defence','agility','luck'];
  const gradeScore: Record<string, number> = { D: 1, C: 2, B: 3, A: 4, S: 5 };
  const scaling = Object.entries(character.weaponScaling ?? Object.fromEntries(Object.entries(character.scaling?.attributes ?? {}).map(([key, value]) => [key, value.toUpperCase()])))
    .sort(([, a], [, b]) => (gradeScore[b] ?? 0) - (gradeScore[a] ?? 0))
    .map(([attribute]) => attribute as keyof Attributes);
  return [...new Set([...scaling, ...general])];
};
export function recommend(character: Character): Recommendation {
  const spend: Partial<Attributes> = {}; let left = Math.max(0, character.points);
  for (const attribute of priority(character)) { if (!left) break; const room = Math.max(0, 99 - character.invested[attribute]); const amount = Math.min(left, room, attribute === 'vitality' ? 2 : 1); if (amount) { spend[attribute] = amount; left -= amount; } }
  const hasScaling = Object.keys(character.weaponScaling ?? {}).length > 0;
  const explanation = character.points
    ? hasScaling ? 'Prioritises your entered weapon-scaling attributes, then survivability and reliable damage. Scaling is directional advice, not a full equipment optimiser.' : 'Prioritises a little survivability, then reliable damage. Equipped-weapon scaling is not considered until you enter it.'
    : 'There are no available attribute points to allocate.';
  return { characterId: character.id, base: cloneAttributes(character.invested), spend, points: character.points - left, explanation, revision: character.level };
}
export function applyRecommendation(character: Character, rec: Recommendation): Character { if (rec.revision !== character.level || rec.characterId !== character.id || rec.base.vitality !== character.invested.vitality || rec.base.might !== character.invested.might || rec.base.agility !== character.invested.agility || rec.base.defence !== character.invested.defence || rec.base.luck !== character.invested.luck || rec.points > character.points) return character;
  if (!Number.isInteger(rec.points) || rec.points < 0 || Object.values(rec.spend).some((value) => !Number.isInteger(value) || value! < 0) || rec.points !== Object.values(rec.spend).reduce((sum, value) => sum + (value ?? 0), 0)) return character;
  const invested = cloneAttributes(character.invested); for (const attr of ATTRIBUTES) { const amount = rec.spend[attr] ?? 0; if (invested[attr] + amount > 99) return character; invested[attr] += amount; } return { ...character, invested, points: character.points - rec.points, pending: undefined };
}
export function updateProgress(character: Character, input: {level:number; invested:Attributes; points:number}): Character { return { ...character, level: Math.max(1, input.level), invested: cloneAttributes(input.invested), points: Math.max(0, input.points), pending: undefined, pendingSkill: undefined }; }

export function recommendSkill(character: Character): SkillRecommendation | null {
  if (!character.skillSetupComplete || character.skillPoints === undefined || !character.unlockedSkills) return null;
  if (character.skillAcquisition === 'learned') return { characterId: character.id, save: true, points: 0, explanation: 'This character learns skills through discovered encounters. Record a skill after you confirm learning it; no skill-point purchase is suggested.', revision: character.level, baseSkillPoints: character.skillPoints, baseUnlockedSkills: [...character.unlockedSkills] };
  const owned = new Set(character.unlockedSkills);
  const discovered = new Set(character.discoveredSkillIds ?? []);
  const available = (SKILLS[character.id] ?? []).find(skill => !skill.starting && !skill.unsupportedPurchase && (!skill.storyGated || discovered.has(skill.id)) && !owned.has(skill.id) && (skill.requires ?? []).every(id => owned.has(id)) && skill.cost <= character.skillPoints!);
  return { characterId: character.id, skillId: available?.id, save: !available, points: available?.cost ?? 0, explanation: available ? `Save ${available.cost} skill point${available.cost === 1 ? '' : 's'} to unlock ${available.name}.` : 'Save your skill points until a visible skill is affordable and its prerequisites are met.', revision: character.level, baseSkillPoints: character.skillPoints, baseUnlockedSkills: [...character.unlockedSkills] };
}

export function applySkillRecommendation(character: Character, recommendation: SkillRecommendation): Character {
  if (recommendation.characterId !== character.id || recommendation.revision !== character.level || !character.skillSetupComplete || character.skillPoints === undefined || !character.unlockedSkills || recommendation.baseSkillPoints !== character.skillPoints || JSON.stringify(recommendation.baseUnlockedSkills) !== JSON.stringify(character.unlockedSkills)) return character;
  if (recommendation.save || !recommendation.skillId) return { ...character, pendingSkill: undefined };
  const skill = (SKILLS[character.id] ?? []).find(candidate => candidate.id === recommendation.skillId);
  if (!skill || skill.starting || skill.unsupportedPurchase || recommendation.points !== skill.cost || (skill.storyGated && !(character.discoveredSkillIds ?? []).includes(skill.id)) || character.unlockedSkills.includes(skill.id) || !(skill.requires ?? []).every(id => character.unlockedSkills!.includes(id)) || skill.cost > character.skillPoints) return character;
  return { ...character, unlockedSkills: [...character.unlockedSkills, skill.id], skillPoints: character.skillPoints - skill.cost, pendingSkill: undefined };
}

export function suggestLoadout(character: Character): string[] { if (!character.skillSetupComplete) return []; const owned = new Set(character.unlockedSkills ?? []); const discovered = new Set(character.discoveredSkillIds ?? []); const known = new Set((SKILLS[character.id] ?? []).filter((skill) => !skill.storyGated || discovered.has(skill.id)).map((skill) => skill.id)); return [...owned].filter((id) => known.size === 0 || known.has(id)).slice(0, 6); }
export function recordLoadout(character: Character, loadout: string[]): Character { const owned = new Set(character.unlockedSkills ?? []); return { ...character, loadout: [...new Set(loadout)].filter((id) => owned.has(id)).slice(0, 6) }; }
