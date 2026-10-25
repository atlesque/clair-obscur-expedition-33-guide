import type { Attribute, Attributes, Character, CharacterId } from './types';
import { attributeLabels } from './data';
import { findWeapon, gradeAtLevel, nextGradeUpgrade } from './weapons';
import type { ScalingGrade } from './weapons';

/** Each attribute's own effect, as the in-game attribute screen describes it. */
const ATTRIBUTE_EFFECTS: Record<Attribute, string> = {
  vitality: 'raises Health', might: 'raises attack power', agility: 'raises speed, so turns come round sooner', defence: 'raises Defence', luck: 'raises critical rate',
};

/**
 * Editorial, spoiler-free build direction per character: the two attributes that suit how the
 * character fights, best first. Used for the extra advice beside the weapon's scaling and as the
 * whole plan when no listed weapon is equipped. Not a sourced game statistic.
 */
type BuildProfile = { focus: [Attribute, Attribute]; guide: string };
const BUILD_PROFILES: Record<string, BuildProfile> = {
  gustave: { focus: ['might', 'vitality'], guide: 'Gustave fights up front and pays off with big single hits, so Might and enough Vitality to stay standing make a reliable base.' },
  lune: { focus: ['agility', 'luck'], guide: 'Lune does most of the work through skills, so more turns from Agility and more critical hits from Luck matter more than raw Might.' },
  maelle: { focus: ['might', 'luck'], guide: 'Maelle hits hardest against a single target, so Might and critical hits from Luck pay off most.' },
  sciel: { focus: ['agility', 'luck'], guide: 'Sciel sets the pace for the party, so acting often (Agility) and landing critical hits (Luck) suit the role best.' },
  verso: { focus: ['might', 'agility'], guide: 'Verso rewards steady, consistent attacks, so Might for damage and Agility for more turns make a strong base.' },
  monoco: { focus: ['agility', 'might'], guide: 'Monoco is flexible, so Agility for more turns and Might for damage keep every option useful.' },
};
const DEFAULT_PROFILE: BuildProfile = { focus: ['might', 'vitality'], guide: 'A balance of Might for damage and Vitality to survive is a forgiving default.' };

// Shares of the target allocation. With a listed weapon most points follow its scaling;
// without one the character's build direction leads, backed by survivability.
const SCALING_SHARE = 0.65, FOCUS_SHARE = 0.25, SURVIVAL_SHARE = 0.1;
const FOCUS_ONLY_SHARE = 0.55, FOCUS_ONLY_VITALITY = 0.35, FOCUS_ONLY_DEFENCE = 0.1;
const FOCUS_SPLIT = [0.6, 0.4];
const GRADE_VALUE: Record<ScalingGrade, number> = { D: 1, C: 2, B: 3, A: 4, S: 5 };

export const buildProfile = (characterId: CharacterId): BuildProfile => BUILD_PROFILES[characterId] ?? DEFAULT_PROFILE;

export type AttributePlan = { weights: Attributes; explanation: string; notes: string[] };

const list = (items: string[]) => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/** Target attribute ratios plus the reasoning shown to the player. */
export function attributePlan(character: Character): AttributePlan {
  const profile = buildProfile(character.id);
  const weapon = findWeapon(character.id, character.weapon);
  const weights: Attributes = { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 };
  profile.focus.forEach((attribute, index) => { weights[attribute] += (weapon?.scaling.length ? FOCUS_SHARE : FOCUS_ONLY_SHARE) * FOCUS_SPLIT[index]; });
  const notes: string[] = [];
  if (!weapon?.scaling.length) {
    weights.vitality += FOCUS_ONLY_VITALITY; weights.defence += FOCUS_ONLY_DEFENCE;
    const explanation = character.weapon
      ? `${character.weapon} isn’t in the guide’s weapon list, so its scaling isn’t considered. Points follow ${character.name}’s general build instead, with Vitality for survivability.`
      : `No equipped weapon is recorded, so its scaling isn’t considered. Points follow ${character.name}’s general build instead, with Vitality for survivability.`;
    notes.push(profile.guide);
    if (character.weapon) notes.push('Check the weapon screen for the attributes it scales with, then pick the weapon from the list for advice built around them.');
    return { weights, explanation, notes };
  }

  const grades = weapon.scaling.map(entry => ({ attribute: entry.attribute, grade: gradeAtLevel(entry.grade, character.weaponLevel) }))
    .sort((a, b) => GRADE_VALUE[b.grade] - GRADE_VALUE[a.grade]);
  const gradeTotal = grades.reduce((sum, entry) => sum + GRADE_VALUE[entry.grade], 0);
  for (const entry of grades) weights[entry.attribute] += SCALING_SHARE * GRADE_VALUE[entry.grade] / gradeTotal;
  weights.vitality += SURVIVAL_SHARE;

  const scaled = grades.map(entry => entry.attribute);
  const atLevel = character.weaponLevel ? ` at weapon level ${character.weaponLevel}` : '';
  const explanation = `${weapon.name} scales with ${list(grades.map(entry => `${attributeLabels[entry.attribute]} (${entry.grade})`))}${atLevel}, so most points go there${grades.length > 1 ? `, ${attributeLabels[grades[0].attribute]} first` : ''}. `
    + `Each point in a scaling attribute adds attack power on top of its own effect: ${list(grades.map(entry => `${attributeLabels[entry.attribute]} ${ATTRIBUTE_EFFECTS[entry.attribute]}`))}.`;

  const extra = profile.focus.filter(attribute => !scaled.includes(attribute));
  if (extra.length) notes.push(`Over the coming levels a smaller share goes to ${list(extra.map(attribute => attributeLabels[attribute]))}, which ${extra.length > 1 ? 'suit' : 'suits'} how ${character.name} fights${scaled.includes('vitality') || extra.includes('vitality') ? '' : ', plus a little Vitality to survive mistakes'}.`);
  else if (!scaled.includes('vitality')) notes.push(`The weapon already matches ${character.name}’s build, so a smaller share goes to Vitality to survive mistakes.`);
  else notes.push(`The weapon already matches ${character.name}’s build, so nearly every point goes to its scaling.`);
  notes.push(profile.guide);
  if (!character.weaponLevel) notes.push('The weapon level isn’t recorded, so these are the level 1 grades. Record it for advice that matches the weapon screen.');
  else {
    const upgrade = nextGradeUpgrade(character.weaponLevel);
    if (upgrade && grades.some(entry => entry.grade !== 'S')) notes.push(`Upgrading the weapon to level ${upgrade} raises every grade one step, which makes these points count for more.`);
  }
  return { weights, explanation, notes };
}
