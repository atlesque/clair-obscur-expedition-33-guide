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

The sources do not provide a dependable, complete, spoiler-safe table of every
skill prerequisite or every story-gated skill. Skill guidance must therefore be
data-driven and only expose skills whose visibility and prerequisites have been
verified. Unknown or story-dependent skills stay unavailable until the user
records their discovery.

For the initial skill data, the cross-checked tables are [Gamer Guides' Gustave
database](https://www.gamerguides.com/clair-obscur-expedition-33/database/skills/gustave),
[Gamer Guides' Lune database](https://www.gamerguides.com/clair-obscur-expedition-33/database/skills/lune),
and the [Gustave page on the community wiki](https://clairobscur.wiki.gg/wiki/Gustave).
The tables distinguish action-point cost from skill-point unlock cost. The app
stores only the latter, and uses the reported visible starting skills as the
initial ownership boundary. Some pages expose a larger late-game table without
reliably stating story gates; those entries are omitted until the discovery
boundary is verified rather than shown prematurely.

The final recruit's skill system is a separate acquisition path: skills are
learned from confirmed encounters rather than purchased from the ordinary
skill-point tree. The model marks that path explicitly, so setup can record
owned skills while purchase advice remains withheld. Loadout suggestions are
always filtered to recorded ownership and capped at six slots.

## Editorial recommendation boundary

The forgiving build uses survivability and reliable damage as the baseline. A
weapon's entered affinity grades can prioritize its matching attributes among
the next legal investments; the advice remains a recommendation, not an
optimizer or a claim of a universally best build. Existing investments are
never rewritten, and clearing or changing scaling invalidates pending advice
without changing actual progression.
