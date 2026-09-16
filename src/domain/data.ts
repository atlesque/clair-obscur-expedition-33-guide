import type { CharacterId, Attributes } from './types';
export const INITIAL_CHARACTERS: Record<'gustave'|'lune', {name:string; defaults: Attributes; source:string}> = {
  gustave: { name: 'Gustave', defaults: { vitality: 2, might: 2, agility: 0, defence: 1, luck: 0 }, source: 'In-game level-one character screen (verified locally; editorial priorities are separate).' },
  lune: { name: 'Lune', defaults: { vitality: 2, might: 0, agility: 1, defence: 1, luck: 1 }, source: 'In-game level-one character screen (verified locally; editorial priorities are separate).' }
};
export const LATER_CHARACTER_IDS: CharacterId[] = ['later-1', 'later-2', 'later-3'];
export const attributeLabels: Record<string,string> = { vitality:'Vitality', might:'Might', agility:'Agility', defence:'Defence', luck:'Luck' };
