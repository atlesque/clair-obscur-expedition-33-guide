import { compareCharacterIds } from './data';
import type { Character, ColourPlan, Lumina, Playthrough } from './types';

/** The game fields three fighters at a time. */
export const MAX_ACTIVE_PARTY = 3;
export const MAX_LUMINA_POINTS = 999;

export const isLumina = (value: unknown): value is Lumina => {
  if (!value || typeof value !== 'object') return false;
  const { total, spent } = value as Partial<Lumina>;
  return Number.isInteger(total) && Number.isInteger(spent) && spent! >= 0 && total! >= spent! && total! <= MAX_LUMINA_POINTS;
};

export const freeLumina = (character: Character): number | undefined => character.lumina ? character.lumina.total - character.lumina.spent : undefined;

export function validateLumina(total: number, spent: number): Lumina {
  if (!Number.isInteger(total) || !Number.isInteger(spent) || total < 0 || spent < 0 || total > MAX_LUMINA_POINTS) throw new Error(`Enter whole Lumina points from 0 to ${MAX_LUMINA_POINTS}.`);
  if (spent > total) throw new Error('Spent Lumina points cannot exceed the total.');
  return { total, spent };
}

export const activeParty = (characters: Character[]): Character[] => characters.filter(item => item.tracked && item.inParty);

/**
 * Hands out unused Colours of Lumina one at a time. The active combat party is served first; benched
 * characters only receive Colours when nobody is marked as active. Each Colour goes to the recipient with
 * the smallest Lumina total, so the fighters even out, then to whoever has fewer free points.
 */
export function planColours(playthrough: Playthrough): ColourPlan {
  const colours = playthrough.colours ?? 0;
  const tracked = playthrough.characters.filter(item => item.tracked);
  const party = activeParty(tracked);
  const recipients = party.length ? party : tracked;
  const base = Object.fromEntries(tracked.map(item => [item.id, item.lumina?.total ?? 0]));
  const free = (item: Character) => freeLumina(item) ?? 0;
  const give: Record<string, number> = {};
  for (let left = colours; left > 0 && recipients.length; left--) {
    const next = [...recipients].sort((a, b) =>
      (base[a.id] + (give[a.id] ?? 0)) - (base[b.id] + (give[b.id] ?? 0))
      || (free(a) + (give[a.id] ?? 0)) - (free(b) + (give[b.id] ?? 0))
      || compareCharacterIds(a.id, b.id))[0];
    if (base[next.id] + (give[next.id] ?? 0) >= MAX_LUMINA_POINTS) break;
    give[next.id] = (give[next.id] ?? 0) + 1;
  }
  const explanation = !colours ? 'There are no unused Colours of Lumina to hand out.'
    : !tracked.length ? 'Track a character before handing out Colours of Lumina.'
    : party.length ? 'Your active combat party comes first: each Colour goes to the fighter with the lowest Lumina total, so everyone fighting can equip more Luminas. Benched characters wait until they join the fight.'
    : 'No active combat party is marked, so the Colours are spread across everyone you track, lowest Lumina total first. Mark who is fighting to focus them.';
  return { colours, base, give, explanation };
}

/** Records a confirmed Colour plan once. Returns the same object when the plan no longer matches the save. */
export function applyColourPlan(playthrough: Playthrough, plan: ColourPlan): Playthrough {
  const handed = Object.values(plan.give).reduce((sum, amount) => sum + amount, 0);
  if ((playthrough.colours ?? 0) !== plan.colours || handed > plan.colours) return playthrough;
  for (const [id, amount] of Object.entries(plan.give)) {
    const character = playthrough.characters.find(item => item.id === id);
    if (!character || !Number.isInteger(amount) || amount < 0 || (character.lumina?.total ?? 0) !== plan.base[id]) return playthrough;
  }
  const characters = playthrough.characters.map(item => {
    const amount = plan.give[item.id];
    if (!amount) return item;
    const lumina = item.lumina ?? { total: 0, spent: 0 };
    return { ...item, lumina: { ...lumina, total: lumina.total + amount } };
  });
  return { ...playthrough, characters, colours: plan.colours - handed, colourPlan: undefined };
}

export const isColourPlan = (value: unknown): value is ColourPlan => {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Partial<ColourPlan>;
  const counts = (record: unknown) => !!record && typeof record === 'object' && Object.values(record).every(amount => Number.isInteger(amount) && (amount as number) >= 0);
  return Number.isInteger(plan.colours) && plan.colours! >= 0 && counts(plan.base) && counts(plan.give) && typeof plan.explanation === 'string';
};

/** Records a character's Lumina points on their own. Attribute advice does not depend on them, so it stays pending. */
export function setLumina(character: Character, total: number, spent: number): Character {
  return { ...character, lumina: validateLumina(total, spent) };
}
