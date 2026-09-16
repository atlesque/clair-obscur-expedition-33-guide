import type { CharacterId, Attributes } from './types';
export const INITIAL_CHARACTERS: Record<'gustave'|'lune', {name:string; defaults: Attributes; source:string}> = {
  gustave: { name: 'Gustave', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Destructoid level-one attributes screenshot: all investments zero and three points available.' },
  lune: { name: 'Lune', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'The Nerd Stash level-one attributes screenshot: all investments zero and three points available.' }
};
export const LATER_CHARACTERS: {id: CharacterId; name: string; defaults: Attributes; source: string}[] = [
  { id: 'maelle', name: 'Maelle', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' },
  { id: 'sciel', name: 'Sciel', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' },
  { id: 'verso', name: 'Verso', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' },
  { id: 'monoco', name: 'Monoco', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Source-backed character guide; exact level-one allocation must be checked against the in-game screen before publishing.' }
];
export const LATER_CHARACTER_IDS: CharacterId[] = LATER_CHARACTERS.map(c=>c.id);
export const attributeLabels: Record<string,string> = { vitality:'Vitality', might:'Might', agility:'Agility', defence:'Defence', luck:'Luck' };
export const ATTRIBUTE_PRIORITIES = {
  gustave: { weights: { vitality: 0.4, might: 0.3, agility: 0.15, defence: 0.1, luck: 0.05 }, source: 'Editorial first-playthrough priority recorded from the Gustave guide research notes.' },
  lune: { weights: { vitality: 0.4, might: 0.2, agility: 0.2, defence: 0.1, luck: 0.1 }, source: 'Editorial first-playthrough priority; confirm against the character guide before publishing.' },
  default: { weights: { vitality: 0.4, might: 0.3, agility: 0.15, defence: 0.1, luck: 0.05 }, source: 'General forgiving first-playthrough priority.' }
} as const;
