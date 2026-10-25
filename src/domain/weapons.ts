import type { Attribute, CharacterId } from './types';

export type ScalingGrade = 'D' | 'C' | 'B' | 'A' | 'S';
export type WeaponScaling = { attribute: Attribute; grade: ScalingGrade };
export type Weapon = { name: string; scaling: WeaponScaling[] };

export const WEAPON_SOURCE = 'Extracted from the game data (DT_WeaponDefinitions AttributeScaling, names via ST_Items). Grades are the base grades at weapon level 1.';
export const MAX_WEAPON_LEVEL = 33;
const GRADES: ScalingGrade[] = ['D', 'C', 'B', 'A', 'S'];
// BP_ItemInstance_Gear_Weapon raises every scaling grade by one at each of these upgrade levels.
const GRADE_UPGRADE_LEVELS = [4, 20, 33];

// Pools follow each weapon's item subtype: gustave holds the Noah Weapon swords, verso the Verso Weapon ones.
const WEAPON_POOLS: Record<string, Weapon[]> = {
  gustave: [
    { name: 'Abysseram', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Blodam', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Chevalam', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Cruleram', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Cultam', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Delaram', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Demonam', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Gaulteram', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Gesam', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Lanceram', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Noahram', scaling: [{ attribute: 'vitality', grade: 'C' }] },
    { name: 'Nosaram', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Sakaram', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Seeram', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Velokan', scaling: [{ attribute: 'agility', grade: 'B' }] },
  ],
  lune: [
    { name: 'Angerim', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Benisim', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Betelim', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Braselim', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Chapelim', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Choralim', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Colim', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Coralim', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Deminerim', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Elerim', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Gelerim', scaling: [] },
    { name: 'Kralim', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Lighterim', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Lithelim', scaling: [{ attribute: 'vitality', grade: 'A' }] },
    { name: 'Lunerim', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Painerim', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Potierim', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Redalim', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Saperim', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Scaverim', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Snowim', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Telarim', scaling: [] },
    { name: 'Trebuchim', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Troubadim', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
  ],
  maelle: [
    { name: 'Barrier Breaker', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Battlum', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Beselbum', scaling: [] },
    { name: 'Brulerum', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Chalium', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Chantenum', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Clierum', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Coldum', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Duenum', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Facesum', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Glaisum', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Jarum', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Lithum', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Maellum', scaling: [{ attribute: 'vitality', grade: 'C' }] },
    { name: 'Medalum', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Melarum', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Milerim', scaling: [] },
    { name: 'Nibalum', scaling: [] },
    { name: 'Plenum', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Seashelum', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Sekarum', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Stalum', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Tissenum', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Veremum', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Volesterum', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Yeverum', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
  ],
  sciel: [
    { name: 'Algueron', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Blizzon', scaling: [{ attribute: 'luck', grade: 'B' }] },
    { name: 'Bourgelon', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Charnon', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Chation', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Corderon', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Direton', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Garganon', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Gobluson', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Guleson', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Hevason', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Litheson', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Lusteson', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Martenon', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Minason', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Moisson', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Ramasson', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Rangeson', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Sadon', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Scieleson', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Tisseron', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
  ],
  verso: [
    { name: 'Confuso', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Contorso', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Corpeso', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Danseso', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Dreameso', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Dualiso', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Glaceso', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Liteso', scaling: [{ attribute: 'defence', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Simoso', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Sireso', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Tireso', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Verleso', scaling: [{ attribute: 'vitality', grade: 'C' }] },
  ],
  monoco: [
    { name: 'Ballaro', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Boucharo', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Brumaro', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'agility', grade: 'D' }] },
    { name: 'Chromaro', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Fragaro', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Grandaro', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Joyaro', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'defence', grade: 'D' }] },
    { name: 'Monocaro', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
    { name: 'Nusaro', scaling: [{ attribute: 'agility', grade: 'C' }, { attribute: 'vitality', grade: 'D' }] },
    { name: 'Sidaro', scaling: [{ attribute: 'luck', grade: 'C' }, { attribute: 'might', grade: 'D' }] },
    { name: 'Urnaro', scaling: [{ attribute: 'vitality', grade: 'C' }, { attribute: 'luck', grade: 'D' }] },
  ],
};

/** Shortest query that starts a weapon search, so the list never spoils weapons the player hasn't found. */
export const WEAPON_SEARCH_MIN_LENGTH = 3;

// DT_jRPG_CharacterDefinitions AllowedEquipmentSubtypes lets Gustave and Verso both equip Noah and Verso weapons.
const EQUIPPABLE_POOLS: Record<string, string[]> = { gustave: ['gustave', 'verso'], verso: ['gustave', 'verso'] };

export const weaponsFor = (characterId: CharacterId): Weapon[] =>
  (EQUIPPABLE_POOLS[characterId] ?? [characterId])
    .flatMap(pool => WEAPON_POOLS[pool] ?? [])
    .sort((a, b) => a.name.localeCompare(b.name));

export function searchWeapons(characterId: CharacterId, query: string): Weapon[] {
  const needle = query.trim().toLocaleLowerCase();
  if (needle.length < WEAPON_SEARCH_MIN_LENGTH) return [];
  return weaponsFor(characterId).filter(weapon => weapon.name.toLocaleLowerCase().startsWith(needle));
}

export function findWeapon(characterId: CharacterId, name?: string): Weapon | undefined {
  const needle = name?.trim().toLocaleLowerCase();
  return needle ? weaponsFor(characterId).find(weapon => weapon.name.toLocaleLowerCase() === needle) : undefined;
}

export const isWeaponLevel = (level: unknown): level is number => Number.isInteger(level) && (level as number) >= 1 && (level as number) <= MAX_WEAPON_LEVEL;

/** The grade the game shows for a base grade at the given upgrade level, capped at S. */
export function gradeAtLevel(base: ScalingGrade, weaponLevel = 1): ScalingGrade {
  const upgrades = GRADE_UPGRADE_LEVELS.filter(level => weaponLevel >= level).length;
  return GRADES[Math.min(GRADES.indexOf(base) + upgrades, GRADES.length - 1)];
}

/** The next upgrade level that raises every grade, if any remain. */
export const nextGradeUpgrade = (weaponLevel = 1): number | undefined => GRADE_UPGRADE_LEVELS.find(level => level > weaponLevel);

export const weaponScaling = (characterId: CharacterId, name?: string, weaponLevel?: number): Partial<Record<Attribute, ScalingGrade>> =>
  Object.fromEntries((findWeapon(characterId, name)?.scaling ?? []).map(entry => [entry.attribute, gradeAtLevel(entry.grade, weaponLevel)]));
