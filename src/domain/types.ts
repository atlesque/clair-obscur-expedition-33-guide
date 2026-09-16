export type Attribute = 'vitality' | 'might' | 'agility' | 'defence' | 'luck';
export type CharacterId = 'gustave' | 'lune' | string;
export type Attributes = Record<Attribute, number>;
export type ScalingGrade = 'D' | 'C' | 'B' | 'A' | 'S';
export type WeaponScaling = Partial<Record<Attribute, ScalingGrade>>;
export type SkillRecord = { id: string; name: string; cost: number; requires?: string[]; storyGated?: boolean; acquisition?: 'points' | 'learned'; source?: string };
export type SkillRecommendation = { characterId: CharacterId; skillId?: string; save: boolean; points: number; explanation: string; revision: number; baseSkillPoints?: number; baseUnlockedSkills?: string[] };
export type Character = { id: CharacterId; name: string; level: number; invested: Attributes; points: number; tracked: boolean; revealed: boolean; pending?: Recommendation; weaponScaling?: WeaponScaling; scaling?: { attributes: Partial<Record<Attribute, string>> }; skillSetupComplete?: boolean; unlockedSkills?: string[]; discoveredSkillIds?: string[]; skillPoints?: number; loadout?: string[]; pendingSkill?: SkillRecommendation; skillAcquisition?: 'points' | 'learned'; };
export type Recommendation = { characterId: CharacterId; base: Attributes; spend: Partial<Attributes>; points: number; explanation: string; revision: number };
export type Playthrough = { id: string; name: string; characters: Character[]; nextRevealIndex: number; revision: number };
export type SaveData = { version: 1; playthroughs: Playthrough[]; activeId: string };

export const ATTRIBUTES: Attribute[] = ['vitality', 'might', 'agility', 'defence', 'luck'];
export const emptyAttributes = (): Attributes => ({ vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 });
export const cloneAttributes = (value: Attributes): Attributes => ({ ...value });
