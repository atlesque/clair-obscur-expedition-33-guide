# Research notes

The public guide uses only generic attribute labels and does not fetch these pages at runtime. The following evidence was inspected on 2026-09-16:

- [Destructoid: attributes guide](https://www.destructoid.com/all-clair-obscur-expedition-33-attributes/) and its [Gustave attributes screenshot](https://www.destructoid.com/wp-content/uploads/2025/04/Clair-Obscur-Expedition-33-attributes.jpg): the displayed level-one Gustave record has zero invested points in every tracked attribute and three available points.
- [The Nerd Stash: attributes guide](https://thenerdstash.com/best-attributes-in-clair-obscur-expedition-33-heres-our-pick/) and its [Lune attributes screenshot](https://image.thenerdstash.com/2025/04/attributes-lune.jpg): the displayed level-one Lune record has zero invested points in every tracked attribute and three available points.
- [Clair Obscur Wiki: Attributes](https://clair-obscur.fandom.com/wiki/Attributes): the inspected rules reference a level cap of 99, a hard cap of 99 per attribute, and three attribute points per level.
- [Game8: List of All Characters](https://game8.co/games/Clair-Obscur-Expedition-33/archives/513768): square portrait assets for Gustave, Lune, Maelle, Sciel, Verso, and Monoco. The portraits are bundled locally under `public/avatars/` so the guide does not depend on a runtime image host.

Combat statistics are not silently converted into invested attributes. Gustave and Lune use the screenshot-backed level-one records above. The zero values held for later characters are blank entry placeholders used when a player records actual progress after the consent-gated reveal; they are not claims about those characters' starting allocations. Later-character names remain inside the consent-gated data map and are never rendered before reveal.

## Attribute advice

Attribute advice lives in `src/domain/advice.ts` and is built around the equipped weapon:

- **Weapon scaling (game data).** When the equipped weapon is in the guide's list, about two thirds of the target allocation goes to its scaling attributes, split by their grade at the recorded weapon level (D=1 up to S=5), so the best grade leads. Each point in a scaling attribute adds attack power on top of the attribute's own effect, which is why these points do double duty. Grades come from the game files and rise one step at weapon levels 4, 20 and 33 (see `weapons.ts`). Without a recorded weapon level the level 1 grades are used and the advice says so.
- **Attribute effects.** The advice names each attribute's main effect only: Vitality raises Health, Might raises attack power, Agility raises speed, Defence raises Defence and Luck raises critical rate. [Destructoid](https://www.destructoid.com/all-clair-obscur-expedition-33-attributes/), [NME](https://www.nme.com/guides/gaming-guides/expedition-33-attributes-3858352) and [Deltia's Gaming](https://deltiasgaming.com/?p=212740) also list secondary effects, which the advice leaves out because the sources were not checked against the game.
- **Build direction (editorial).** Each character has two attributes that suit how they fight, plus a one-line, spoiler-free build summary. These take about a quarter of the allocation next to the weapon, and a tenth stays in Vitality for survivability. When no listed weapon is equipped, the build direction leads and Vitality and some Defence back it up. These ratios are editorial advice for a forgiving first playthrough, not sourced game statistics.

Recommendations respect recorded allocations and the 99-point cap. They are not a damage optimizer: the game's grade multipliers are not modelled, only the order of the grades.
