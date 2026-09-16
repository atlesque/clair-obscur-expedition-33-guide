import type { CharacterId, Attributes, SkillRecord } from './types';
import SKILLS_CATALOG from './skills-catalog.json';
export const INITIAL_CHARACTERS: Record<'gustave'|'lune', {name:string; defaults: Attributes; source:string}> = {
  gustave: { name: 'Gustave', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'In-game level-one character screen (verified locally; editorial priorities are separate).' },
  lune: { name: 'Lune', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'In-game level-one character screen (verified locally; editorial priorities are separate).' }
};
export const CHARACTER_PORTRAITS: Record<string, string> = {
  gustave: 'https://static.wixstatic.com/media/98aef2_d21a46be1f56485b88e9270477f79683~mv2.png/v1/crop/x_8%2Cy_4%2Cw_489%2Ch_717/fill/w_494%2Ch_724%2Cal_c%2Clg_1%2Cq_85%2Cenc_avif%2Cquality_auto/Gustave_edited.png',
  lune: 'https://static.wixstatic.com/media/98aef2_a4e45142853b44f192f94f050a15131c~mv2.png/v1/crop/x_152%2Cy_0%2Cw_346%2Ch_724/fill/w_346%2Ch_724%2Cal_c%2Cq_85%2Cenc_avif%2Cquality_auto/Lune_edited.png',
};
export const LATER_CHARACTERS: {id: CharacterId; name: string; defaults: Attributes; source: string}[] = [
  { id: 'maelle', name: 'Maelle', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; verify level-one screen before publication.' },
  { id: 'sciel', name: 'Sciel', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; verify level-one screen before publication.' },
  { id: 'verso', name: 'Verso', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; verify level-one screen before publication.' },
  { id: 'monoco', name: 'Monoco', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; verify level-one screen before publication.' }
];
export const LATER_CHARACTER_IDS: CharacterId[] = LATER_CHARACTERS.map((character) => character.id);
export const attributeLabels: Record<string,string> = { vitality:'Vitality', might:'Might', agility:'Agility', defence:'Defence', luck:'Luck' };
export const SKILLS: Record<string, SkillRecord[]> = SKILLS_CATALOG as Record<string, SkillRecord[]>;
export const ATTRIBUTE_PRIORITIES = {
  gustave: { weights: { vitality: 0.4, might: 0.3, agility: 0.15, defence: 0.1, luck: 0.05 }, source: 'Editorial first-playthrough priority recorded from the Gustave guide research notes.' },
  lune: { weights: { vitality: 0.4, might: 0.2, agility: 0.2, defence: 0.1, luck: 0.1 }, source: 'Editorial first-playthrough priority; confirm against the character guide before publishing.' },
  default: { weights: { vitality: 0.4, might: 0.3, agility: 0.15, defence: 0.1, luck: 0.05 }, source: 'General forgiving first-playthrough priority.' }
} as const;
