import type { CharacterId, Attributes, SkillRecord } from './types';
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
export const SKILLS: Record<string, SkillRecord[]> = {
  gustave: [
    { id: 'marking-shot', name: 'Marking Shot', cost: 1 },
    { id: 'lumiere-assault', name: 'Lumière Assault', cost: 0, starting: true },
    { id: 'overcharge', name: 'Overcharge', cost: 0, starting: true },
    { id: 'from-fire', name: 'From Fire', cost: 2, requires: ['marking-shot'] },
    { id: 'powerful', name: 'Powerful', cost: 1, requires: ['lumiere-assault'] },
    { id: 'recovery', name: 'Recovery', cost: 2, requires: ['powerful'] },
    { id: 'shatter', name: 'Shatter', cost: 6, requires: ['recovery'] },
    { id: 'strike-storm', name: 'Strike Storm', cost: 10, requires: ['from-fire'] }
  ],
  lune: [
    { id: 'immolation', name: 'Immolation', cost: 0, starting: true },
    { id: 'ice-lance', name: 'Ice Lance', cost: 0, starting: true },
    { id: 'wildfire', name: 'Wildfire', cost: 2 },
    { id: 'thermal-transfer', name: 'Thermal Transfer', cost: 2 },
    { id: 'healing-light', name: 'Healing Light', cost: 1 },
    { id: 'electrify', name: 'Electrify', cost: 1 },
    { id: 'earth-rising', name: 'Earth Rising', cost: 1 },
    { id: 'thunderfall', name: 'Thunderfall', cost: 1 },
    { id: 'rebirth', name: 'Rebirth', cost: 4 },
    { id: 'fire-rage', name: 'Fire Rage', cost: 6 },
    { id: 'revitalization', name: 'Revitalization', cost: 6 },
    { id: 'storm-caller', name: 'Storm Caller', cost: 8 },
    { id: 'crippling-tsunami', name: 'Crippling Tsunami', cost: 6 },
    { id: 'crustal-crush', name: 'Crustal Crush', cost: 6 },
    { id: 'hell', name: 'Hell', cost: 10 },
    { id: 'terraquake', name: 'Terraquake', cost: 10 },
    { id: 'mayhem', name: 'Mayhem', cost: 4 }
  ],
  maelle: [
    { id: 'maelle-degagement', name: 'Degagement', cost: 2 },
    { id: 'maelle-spark', name: 'Spark', cost: 0, starting: true },
    { id: 'maelle-breaking-rules', name: 'Breaking Rules', cost: 4, requires: ['maelle-fleuret-fury'], unsupportedPurchase: true },
    { id: 'maelle-burning-canvas', name: 'Burning Canvas', cost: 6, storyGated: true, unsupportedPurchase: true },
    { id: 'maelle-fleuret-fury', name: 'Fleuret Fury', cost: 2, requires: ['maelle-guard-up'], unsupportedPurchase: true }
  ],
  sciel: [
    { id: 'sciel-dark-cleansing', name: 'Dark Cleansing', cost: 2, unsupportedPurchase: true },
    { id: 'sciel-firing-shadow', name: 'Firing Shadow', cost: 2, unsupportedPurchase: true },
    { id: 'sciel-bad-omen', name: 'Bad Omen', cost: 4, unsupportedPurchase: true },
    { id: 'sciel-dark-wave', name: 'Dark Wave', cost: 10, unsupportedPurchase: true },
    { id: 'sciel-fortunes-fury', name: "Fortune's Fury", cost: 6, unsupportedPurchase: true }
  ],
  verso: [
    { id: 'verso-assault-zero', name: 'Assault Zero', cost: 1, unsupportedPurchase: true },
    { id: 'verso-ascending-assault', name: 'Ascending Assault', cost: 1, unsupportedPurchase: true },
    { id: 'verso-blitz', name: 'Blitz', cost: 5, unsupportedPurchase: true },
    { id: 'verso-perfect-break', name: 'Perfect Break', cost: 4, unsupportedPurchase: true },
    { id: 'verso-steeled-strike', name: 'Steeled Strike', cost: 10, unsupportedPurchase: true }
  ],
  // This character has no ordinary SP tree; learned skills are entered after discovery.
  monoco: []
};
