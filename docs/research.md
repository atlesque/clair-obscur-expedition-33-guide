# Research notes

The public guide uses only generic attribute labels and does not fetch these pages at runtime. The following evidence was inspected on 2026-09-16:

- [Destructoid: attributes guide](https://www.destructoid.com/all-clair-obscur-expedition-33-attributes/) and its [Gustave attributes screenshot](https://www.destructoid.com/wp-content/uploads/2025/04/Clair-Obscur-Expedition-33-attributes.jpg): the displayed level-one Gustave record has zero invested points in every tracked attribute and three available points.
- [The Nerd Stash: attributes guide](https://thenerdstash.com/best-attributes-in-clair-obscur-expedition-33-heres-our-pick/) and its [Lune attributes screenshot](https://image.thenerdstash.com/2025/04/attributes-lune.jpg): the displayed level-one Lune record has zero invested points in every tracked attribute and three available points.
- [Clair Obscur Wiki: Attributes](https://clair-obscur.fandom.com/wiki/Attributes): the inspected rules reference a level cap of 99, a hard cap of 99 per attribute, and three attribute points per level.
- [Game8: List of All Characters](https://game8.co/games/Clair-Obscur-Expedition-33/archives/513768): square portrait assets for Gustave, Lune, Maelle, Sciel, Verso, and Monoco. The portraits are bundled locally under `public/avatars/` so the guide does not depend on a runtime image host.

Combat statistics are not silently converted into invested attributes. Gustave and Lune use the screenshot-backed level-one records above. The zero values held for later characters are blank entry placeholders used when a player records actual progress after the consent-gated reveal; they are not claims about those characters' starting allocations. Later-character names remain inside the consent-gated data map and are never rendered before reveal.

The numerical ratios in `ATTRIBUTE_PRIORITIES` are editorial advice, not sourced game facts. Gustave and Lune use separate forgiving first-playthrough priorities; the shared fallback for later characters balances health and reliable damage when equipped-weapon scaling is unknown. Recommendations respect recorded allocations and the 99-point cap, but they are not a damage optimizer and do not account for weapon scaling unless a later slice supplies those inputs.
