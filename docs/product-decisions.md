# Leveling companion — design interview

## Requirements supplied by the user

- A simple single-page app with static hosting and interactive leveling guidance.
- The first version offers only the recommended build for each character.
- Begin setup with Gustave and Lune available; additional characters must be disclosed deliberately, one at a time.
- Never display a full roster or the total possible character count.
- Use a generic anonymous icon for adding a character, without identifying features.
- Let players supply a character's current level and attribute allocation; skip manual allocation entry for a level-one start.
- After a reported level-up, recommend attribute and skill choices.
- Let players add characters, remove characters added by mistake, and reset a playthrough.
- Support multiple named, independent playthroughs, including different people sharing a device.
- Persist progress in local storage; no database in the MVP.
- Favor simple components and styling. The user delegated the framework choice; the build plan selects Astro with Vue components and Tailwind.

## Accepted: reveal consent

Revealing a character and adding that character are separate actions:

1. The player selects a generic "Add character" question mark.
2. An anonymous warning asks whether to reveal the next character, advising continuation only if someone new has joined the party.
3. Only selecting "Reveal character" discloses the identity.
4. The player can then add the character to the playthrough or cancel.

Before explicit reveal consent, show no identifying name, portrait, silhouette, or roster count. Cancelling after disclosure does not add the character.

## Accepted: existing allocations

Preserve a character's existing attribute investments and adapt future spending to move toward the recommended build. Starting to use the guide partway through a playthrough must not require resetting those points.

## Accepted: skill setup

For a character added partway through a playthrough, level and attribute allocation do not describe which skills the player has already unlocked or how many skill points remain unspent.

Capture unlocked skills and unspent skill points during setup. Allow players to defer this step using "Set up later" and receive attribute guidance, but withhold personalized skill-spending instructions until the skill information is supplied. The skill selection interface must follow the accepted skill spoiler boundary below.

## Accepted: recommended build objective

Target a forgiving first playthrough, balancing survivability with reliable damage rather than maximizing damage at the expense of survivability. Specific allocations and skill priorities still require researched game data.

## Accepted: confirming point spending

Showing a recommendation does not change recorded attribute allocations or unlocked skills. Keep it pending until the player confirms applying it in-game, and let the player record different choices if they deviated from the recommendation.

## Accepted: weapon scaling input

Weapon stat scaling can affect which attribute investments improve damage. See [Weapon Scaling Guide](https://game8.co/games/Clair-Obscur-Expedition-33/archives/517399).

Optionally capture the equipped weapon's scaling attributes and letter grades as shown in-game, without displaying a weapon catalogue. Use these to inform attribute guidance; if skipped, provide general guidance with the assumption stated clearly. This is not a full equipment optimizer.

## Accepted: skill spoiler boundary

For an added character, allow guidance to show skills already visible in that character's in-game skill tree, even if the player has not purchased them. Keep anything revealed only through later story progress hidden until the player explicitly confirms discovering it. Research must establish which skills meet each condition without exposing those details in the interview.

## Accepted: catching up between visits

Allow a player to enter each character's current level directly, including a jump of several levels. Let them update actual allocations and unspent point balances if they spent points while away, then generate one combined pending recommendation for the points still available. Do not require replaying every intermediate level-up.

## Accepted: opening the app on a shared device

On opening or reloading the app, reopen the last selected playthrough and its party. Provide a menu option to switch playthroughs. Each playthrough keeps its own reveal state. The user prefers this convenience over requiring a playthrough choice on every visit.

## Accepted: removing a tracked character

Removing a character hides their card but retains their recorded progression within that playthrough, allowing restoration without re-entering level, attributes, and skills. Removal does not reveal or advance to another character automatically. Resetting the playthrough clears the retained records too.

## Accepted: skill guidance scope

Recommend both which skill to unlock next (or when to save points) and which already unlocked skills to equip for the recommended build. Equipping a skill is distinct from unlocking it, and all advice remains subject to the accepted spoiler boundary.

## Accepted: avoiding roster-completion clues

Always retain the same generic "Add character" control, even when there are no further characters to reveal. Only after the usual explicit reveal consent may the app explain that no further character is available. Never display roster totals, remaining counts, or completion badges.

## Interview status

The user confirmed shared understanding of the consolidated MVP and requested synthesis into a specification using the to-spec skill. The [specification](spec.md) expands these decisions into user stories, implementation decisions, and testing decisions. Application implementation has not started.

Published as [GitHub issue #1](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1) with the `ready-for-agent` label.
