import type { CharacterId, Attributes, SkillRecord } from './types';
import SKILLS_CATALOG from './skills-catalog.json';
export const INITIAL_CHARACTERS: Record<'gustave'|'lune', {name:string; defaults: Attributes; source:string}> = {
  gustave: { name: 'Gustave', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'In-game level-one character screen (verified locally; editorial priorities are separate).' },
  lune: { name: 'Lune', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'In-game level-one character screen (verified locally; editorial priorities are separate).' }
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
