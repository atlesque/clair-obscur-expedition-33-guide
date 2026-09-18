import type { CharacterId, Attributes } from './types';
export const INITIAL_CHARACTERS: Record<'gustave'|'lune', {name:string; defaults: Attributes; source:string}> = {
  gustave: { name: 'Gustave', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Destructoid level-one attributes screenshot: all investments zero and three points available.' },
  lune: { name: 'Lune', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'The Nerd Stash level-one attributes screenshot: all investments zero and three points available.' }
};
export const LATER_CHARACTERS: {id: CharacterId; name: string; defaults: Attributes; source: string}[] = [
  { id: 'maelle', name: 'Maelle', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Blank entry placeholders for recording the player\'s actual values after consent-gated reveal; not a claim about level-one allocation.' },
  { id: 'sciel', name: 'Sciel', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Blank entry placeholders for recording the player\'s actual values after consent-gated reveal; not a claim about level-one allocation.' },
  { id: 'verso', name: 'Verso', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Blank entry placeholders for recording the player\'s actual values after consent-gated reveal; not a claim about level-one allocation.' },
  { id: 'monoco', name: 'Monoco', defaults: { vitality: 0, might: 0, agility: 0, defence: 0, luck: 0 }, source: 'Blank entry placeholders for recording the player\'s actual values after consent-gated reveal; not a claim about level-one allocation.' }
];
export const LATER_CHARACTER_IDS: CharacterId[] = LATER_CHARACTERS.map(c=>c.id);
const CHARACTER_AVATARS: Record<string, string> = {
  gustave: '/avatars/gustave.png',
  lune: '/avatars/lune.png',
  maelle: '/avatars/maelle.png',
  sciel: '/avatars/sciel.png',
  verso: '/avatars/verso.png',
  monoco: '/avatars/monoco.png',
};
export const characterAvatar = (characterId: CharacterId): string => {
  return CHARACTER_AVATARS[characterId] ?? '/avatars/default.svg';
};
export const attributeLabels: Record<string,string> = { vitality:'Vitality', might:'Might', agility:'Agility', defence:'Defence', luck:'Luck' };
export const ATTRIBUTE_PRIORITIES = {
  gustave: { weights: { vitality: 0.4, might: 0.3, agility: 0.15, defence: 0.1, luck: 0.05 }, source: 'Editorial forgiving first-playthrough ratio; not a sourced game statistic and does not account for equipped-weapon scaling.' },
  lune: { weights: { vitality: 0.4, might: 0.2, agility: 0.2, defence: 0.1, luck: 0.1 }, source: 'Editorial forgiving first-playthrough ratio; not a sourced game statistic and does not account for equipped-weapon scaling.' },
  default: { weights: { vitality: 0.4, might: 0.3, agility: 0.15, defence: 0.1, luck: 0.05 }, source: 'Shared editorial fallback for later characters: balances health and reliable damage when equipped-weapon scaling is unknown; not a sourced game statistic.' }
} as const;
