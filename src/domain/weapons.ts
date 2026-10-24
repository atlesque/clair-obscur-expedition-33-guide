import type { Attribute, CharacterId } from './types';

export type ScalingGrade = 'D' | 'C' | 'B' | 'A' | 'S';
export type WeaponScaling = { attribute: Attribute; grade: ScalingGrade };
export type Weapon = { name: string; scaling: WeaponScaling[] };

export const WEAPON_SOURCE = 'Game8 "List of All Weapons" table (grades shown at weapon level 33). In-game grades start lower and rise as a weapon is upgraded.';
export const WEAPON_GRADE_LEVEL = 33;

// Gustave and Verso share the sword pool.
const WEAPON_POOLS: Record<string, Weapon[]> = {
  sword: [
    { name: 'Abysseram', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Blodam', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Chevalam', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Confuso', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Contorso', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Corpeso', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Cruleram', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Cultam', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Danseso', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Delaram', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Demonam', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Dreameso', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Dualiso', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Esquiso', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Gaulteram', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Gesam', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Glaceso', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Lanceram', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Liteso', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Noahram', scaling: [{ attribute: 'vitality', grade: 'S' }] },
    { name: 'Nosaram', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Sakaram', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Seeram', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Simoso', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Sireso', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Sucreso', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Tireso', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Verleso', scaling: [{ attribute: 'vitality', grade: 'S' }] },
  ],
  lune: [
    { name: 'Angerim', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Benisim', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Betelim', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Bonbim', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Braselim', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Chapelim', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Choralim', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Cleim', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Colim', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Coralim', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Deminerim', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Elerim', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Esquim', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Kralim', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Lighterim', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Lithelim', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Lunerim', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Painerim', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Potierim', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Redalim', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Saperim', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Scaverim', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Snowim', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Trebuchim', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Troubadim', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
  ],
  maelle: [
    { name: 'Barrier Breaker', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Battlum', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Brulerum', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Chalium', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Chantenum', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Clierum', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Coldum', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Duenum', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Esquium', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Facesum', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Glaisum', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Jarum', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Licorum', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Lithum', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Maellum', scaling: [{ attribute: 'vitality', grade: 'S' }] },
    { name: 'Medalum', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Melarum', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Plenum', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Seashelum', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Sekarum', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Stalum', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Tissenum', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Veremum', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Volesterum', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Yeverum', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
  ],
  sciel: [
    { name: 'Algueron', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Blizzon', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Bourgelon', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Charnon', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Chation', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Corderon', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Direton', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Duollison', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Esquion', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Garganon', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Gobluson', scaling: [{ attribute: 'defence', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Guleson', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Hevason', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Litheson', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Lusteson', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Martenon', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Minason', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Moisson', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Ramasson', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Rangeson', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Sadon', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Scieleson', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Sucetton', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Tisseron', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
  ],
  monoco: [
    { name: 'Baguettaro', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Ballaro', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Boucharo', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Brumaro', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'agility', grade: 'A' }] },
    { name: 'Chromaro', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Esquiaro', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Fragaro', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Grandaro', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Joyaro', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'defence', grade: 'A' }] },
    { name: 'Monocaro', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
    { name: 'Nusaro', scaling: [{ attribute: 'agility', grade: 'S' }, { attribute: 'vitality', grade: 'A' }] },
    { name: 'Sidaro', scaling: [{ attribute: 'luck', grade: 'S' }, { attribute: 'might', grade: 'A' }] },
    { name: 'Urnaro', scaling: [{ attribute: 'vitality', grade: 'S' }, { attribute: 'luck', grade: 'A' }] },
  ],
};
const CHARACTER_WEAPON_POOL: Record<string, string> = { gustave: 'sword', verso: 'sword', lune: 'lune', maelle: 'maelle', sciel: 'sciel', monoco: 'monoco' };

/** Shortest query that starts a weapon search, so the list never spoils weapons the player hasn't found. */
export const WEAPON_SEARCH_MIN_LENGTH = 3;

export const weaponsFor = (characterId: CharacterId): Weapon[] => WEAPON_POOLS[CHARACTER_WEAPON_POOL[characterId]] ?? [];

export function searchWeapons(characterId: CharacterId, query: string): Weapon[] {
  const needle = query.trim().toLocaleLowerCase();
  if (needle.length < WEAPON_SEARCH_MIN_LENGTH) return [];
  return weaponsFor(characterId).filter(weapon => weapon.name.toLocaleLowerCase().startsWith(needle));
}

export function findWeapon(characterId: CharacterId, name?: string): Weapon | undefined {
  const needle = name?.trim().toLocaleLowerCase();
  return needle ? weaponsFor(characterId).find(weapon => weapon.name.toLocaleLowerCase() === needle) : undefined;
}

export const weaponScaling = (characterId: CharacterId, name?: string): Partial<Record<Attribute, ScalingGrade>> =>
  Object.fromEntries((findWeapon(characterId, name)?.scaling ?? []).map(entry => [entry.attribute, entry.grade]));
