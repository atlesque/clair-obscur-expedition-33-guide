export type Attribute = 'vitality' | 'might' | 'agility' | 'defence' | 'luck';
export type CharacterId = 'gustave' | 'lune' | string;
export type Attributes = Record<Attribute, number>;
export type Lumina = { total: number; spent: number };
export type Character = { id: CharacterId; name: string; weapon?: string; weaponLevel?: number; level: number; invested: Attributes; points: number; tracked: boolean; revealed: boolean; pending?: Recommendation; lumina?: Lumina; inParty?: boolean; };
export type Recommendation = { characterId: CharacterId; base: Attributes; basePoints: number; spend: Partial<Attributes>; points: number; explanation: string; revision: number };
export type ColourPlan = { colours: number; base: Record<CharacterId, number>; give: Record<CharacterId, number>; explanation: string };
export type Playthrough = { id: string; name: string; characters: Character[]; nextRevealIndex: number; revealComplete?: boolean; revision: number; colours?: number; colourPlan?: ColourPlan };
export type SaveData = { version: 1; playthroughs: Playthrough[]; activeId: string };

export const ATTRIBUTES: Attribute[] = ['vitality', 'might', 'agility', 'defence', 'luck'];
export const emptyAttributes = (): Attributes => ({ vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 });
export const cloneAttributes = (value: Attributes): Attributes => ({ ...value });
