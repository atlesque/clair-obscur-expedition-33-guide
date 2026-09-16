# Progression research notes

These notes support the skill guidance and weapon-scaling slices. They are
implementation references, not a spoiler-facing guide page.

## Weapon scaling

The accessible weapon references agree on the following mechanic: a weapon can
have up to two attribute affinities, each represented by a letter grade. The
affinity contributes to weapon damage as the matching character attribute
increases. The commonly documented grades run from D through S; a missing
affinity is represented by no input. Weapon upgrades can change affinity grades,
so the guide must accept the values shown on the player's current weapon rather
than identify a weapon by name.

The guide therefore treats scaling as an advisory weighting only. It does not
try to compare weapon power, passives, elemental effects, or upgrade paths. A
scaling input can move an attribute into the recommendation's preferred group,
but it cannot override recorded investments, available points, or the attribute
cap. When no scaling input is supplied, the recommendation explicitly states
that equipped-weapon scaling was not considered.

Sources checked:

- [Clair Obscur Wiki — Weapons](https://clair-obscur.fandom.com/wiki/Weapons)
- [Gamer Guides — Weapon properties and upgrading](https://www.gamerguides.com/clair-obscur-expedition-33/guide/weapons/overview/weapon-properties-and-upgrading-weapons)
- [Gamer Guides — Best attributes and breakpoints](https://www.gamerguides.com/clair-obscur-expedition-33/guide/getting-started/gameplay/best-attributes-and-breakpoints)

These are community references rather than developer documentation. They are
useful for the letter-grade model, but they do not establish a stable numeric
damage formula. The app should preserve the entered grade and explain the
direction of its advice without presenting a calculated damage multiplier.

## Attribute and skill facts used by the interface

The references consistently report five allocatable attributes: Vitality,
Might, Agility, Defense, and Luck. They also report three attribute points and
one skill point per level-up, an attribute hard cap of 99, and six equipped
skill slots. Those values are suitable for validation, while the player's
entered unspent balances remain authoritative for catch-up and reconciliation.

Sources checked:

- [Clair Obscur Wiki — Attributes](https://clair-obscur.fandom.com/wiki/Attributes)
- [Gamer Guides — Using and farming Recoats](https://www.gamerguides.com/clair-obscur-expedition-33/guide/getting-started/gameplay/using-farming-recoats)
- [Meristation — review and systems overview](https://as.com/meristation/reportajes/lo-que-el-rol-moderno-puede-aprender-de-clair-obscur-expedition-33-f202511-r/)

The maintained ordinary skill catalog is `src/domain/skills-catalog.json`.
Costs are skill-point unlock costs, not action-point costs. Prerequisites use
single edges or OR groups as documented by the [community skill table](https://clair-obscur.fandom.com/wiki/Skills).
Individual pages cross-check ambiguous entries, including [Thermal Transfer](https://clair-obscur.fandom.com/wiki/Thermal_Transfer),
[Hell](https://clair-obscur.fandom.com/wiki/Hell), [Thunderfall](https://clair-obscur.fandom.com/wiki/Thunderfall),
and the relevant character-specific skill pages linked from the table.
Every prerequisite identifier resolves within its own character catalog. These
are community-source facts, not a claim that every skill was personally tested
in-game. Gradient abilities use a separate combat system and are outside this
ordinary equipped-skill catalog.

Story-dependent ordinary skills are marked with an explicit discovery gate.
The confirmation is anonymous until the player consents to seeing additional
skill names; discovery does not imply ownership or spend points. Story-granted
skills cannot be recommended as point purchases.

One character learns skills from encounters while present in the active party,
rather than purchasing them with skill points. That workflow accepts only the
names the player enters as already learned, and never exposes a future enemy
catalog. The source is the acquisition explanation in the community skill
table; [Gamer Guides' skill-acquisition reference](https://www.gamerguides.com/clair-obscur-expedition-33/guide/characters/playable/all-monoco-skill-locations)
corroborates the distinct mechanic. Manual learned names are user assertions;
the guide cannot verify a game save. Suggestions are limited to six recorded
owned skills, and recording a loadout spends no points.

## Editorial recommendation boundary

The forgiving build uses survivability and reliable damage as the baseline. A
weapon's entered affinity grades can prioritize its matching attributes among
the next legal investments; the advice remains a recommendation, not an
optimizer or a claim of a universally best build. Existing investments are
never rewritten, and clearing or changing scaling invalidates pending advice
without changing actual progression.

The skill catalog order is an editorial preference for accessible early utility,
healing, protection, and damage coverage. Recommendations take the first legal,
affordable unowned entry. Loadout suggestions use that order among recorded
owned and discovered skills. For manually entered learned skills, the player's
entry order is retained; the app does not claim to optimize unknown names.

Attribute priorities remain proportional during catch-up. Existing investments
are included in the target deficit, so overinvested attributes receive fewer
new points. Entered scaling grades add increasing editorial weight before
normalization; the coefficient is a recommendation heuristic, not a game damage
multiplier. Caps and actual point balances always take precedence.
