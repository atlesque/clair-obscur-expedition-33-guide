import type { CharacterId, Attributes } from './types';
export const INITIAL_CHARACTERS: Record<'gustave'|'lune', {name:string; defaults: Attributes; source:string}> = {
  gustave: { name: 'Gustave', defaults: { vitality: 2, might: 2, agility: 0, defence: 1, luck: 0 }, source: 'Research note required before release: verify level-one screen values separately from editorial priorities.' },
  lune: { name: 'Lune', defaults: { vitality: 2, might: 0, agility: 1, defence: 1, luck: 1 }, source: 'Research note required before release: verify level-one screen values separately from editorial priorities.' }
};
export const LATER_CHARACTERS: {id: CharacterId; name: string; defaults: Attributes; source: string}[] = [
  { id: 'maelle', name: 'Maelle', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' },
  { id: 'sciel', name: 'Sciel', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' },
  { id: 'verso', name: 'Verso', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' },
  { id: 'monoco', name: 'Monoco', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' }
];
export const LATER_CHARACTER_IDS: CharacterId[] = LATER_CHARACTERS.map(c=>c.id);
export const attributeLabels: Record<string,string> = { vitality:'Vitality', might:'Might', agility:'Agility', defence:'Defence', luck:'Luck' };
