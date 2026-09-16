## Problem Statement

Players of Clair Obscur: Expedition 33 need practical guidance on where to invest attribute points, which skills to unlock, and which skills to equip as their characters level up. Conventional guides can expose future party members, story developments, equipment, or abilities before the player encounters them. They also commonly assume a particular starting build instead of accommodating points the player has already spent.

A player should be able to start following a guide at the beginning or halfway through a playthrough, return after several levels, and receive advice that fits their actual progress. People sharing a device need separate named playthroughs without their saved choices or character reveals becoming mixed together.

## Solution

Build a simple, responsive single-page leveling companion with static hosting and browser-local persistence. Offer one recommended build per character, aimed at a forgiving first playthrough with a balance of survivability and reliable damage. Adapt future spending to the player's actual attribute allocation rather than requiring a reset.

Start character selection with Gustave and Lune. Introduce later characters individually through an anonymous warning, explicit consent to reveal an identity, and a separate action to add that character. Never present a complete roster, total possible character count, remaining count, or completion badge. Keep the generic add control present even when no further character is available.

Within each named playthrough, record tracked characters, current levels, attribute allocations, and available points. Optional skill setup enables personalized skill purchase and skill loadout guidance; optional weapon-scaling inputs refine attribute guidance. Players report level changes, reconcile choices made in-game, and confirm recommendations only after applying them. Reopen the last selected playthrough and provide a menu to switch playthroughs, restore removed characters, or reset a playthrough.

## User Stories

1. As a first-time player, I want to create a named playthrough, so that I can identify my saved journey later.
2. As a returning player, I want the app to reopen my last selected playthrough, so that I can resume with minimal effort.
3. As a player sharing a device, I want a menu option to switch playthroughs, so that another person's progress stays separate from mine.
4. As a player starting another run, I want to create an independent playthrough, so that I can retain my previous run's progress.
5. As a player sharing a device, I want each playthrough to retain its own character and skill reveals, so that discoveries from another playthrough do not change mine.
6. As a new player, I want initial character selection to offer Gustave and Lune, so that I can track the characters I have encountered without seeing later party members.
7. As a player, I want to select which initial characters to track, so that the party view reflects my current needs.
8. As a spoiler-conscious player, I want one generic anonymous add control, so that I can add a character without seeing identifying features beforehand.
9. As a spoiler-conscious player, I want an anonymous warning before an identity is revealed, so that an accidental click does not disclose a character.
10. As a spoiler-conscious player, I want to cancel the warning without any disclosure, so that I can safely back out.
11. As a player who has encountered someone new, I want to explicitly reveal only the next character, so that I do not see a full roster.
12. As a player, I want revealing a character and adding them to be separate actions, so that I can review the revealed character before tracking them.
13. As a player, I want to cancel after a reveal without adding the character or skipping ahead to another, so that my tracked party remains intentional.
14. As a spoiler-conscious player, I want no total possible roster size or remaining-character count, so that the interface does not reveal how much recruitment lies ahead.
15. As a spoiler-conscious player, I want the add control to keep the same appearance throughout my playthrough, so that its disappearance or a completion badge does not reveal that recruitment is finished.
16. As a player explicitly checking for another character, I want to learn that none is available only after the usual reveal consent, so that routine use remains free of completion clues.
17. As a player starting at level one, I want verified starting values supplied without manual attribute entry, so that setup is quick and accurate.
18. As a player joining the guide partway through a run, I want to enter each character's current level, so that I can start from my actual progress.
19. As a player with existing investments, I want to enter my attribute allocation, so that recommendations respect points already spent.
20. As a player, I want available attribute points recorded and reconciled with my current progress, so that advice does not spend points I do not have.
21. As a player with a different allocation from the recommended build, I want future investments adapted toward that build, so that I do not have to reset my character to use the guide.
22. As a first-time player, I want one clearly identified recommended build, so that I do not need to choose between unfamiliar build options.
23. As a player still learning combat, I want the recommended build to balance survivability and reliable damage, so that it tolerates mistakes.
24. As a player, I want concise reasons for suggested attribute and skill choices, so that I understand what the recommendation helps me achieve.
25. As a player seeking skill advice, I want to record unlocked skills, so that the app does not recommend purchasing a skill I already own.
26. As a player seeking skill advice, I want to record unspent skill points, so that recommendations reflect what I can afford.
27. As a player who wants quick setup, I want a Set up later option for skills, so that I can use attribute guidance immediately.
28. As a player who skipped skill setup, I want to complete it later, so that personalized skill guidance becomes available when I am ready.
29. As a player with incomplete skill information, I want the app to withhold personalized skill spending and loadout advice, so that it does not guess what I own or can afford.
30. As a player planning ahead, I want to see relevant skills already visible in my character's in-game skill tree even if unpurchased, so that I can decide what to save toward.
31. As a spoiler-conscious player, I want story-dependent skills hidden until I confirm discovering them, so that advice does not disclose later progression.
32. As a player, I want an affordable next skill purchase or an explicit recommendation to save points, so that I know what to do with my skill points now.
33. As a player, I want skill purchase recommendations to respect prerequisites, so that every instruction is possible in-game.
34. As a player, I want a suggested skill loadout drawn only from unlocked skills, so that I can use the advice immediately.
35. As a player, I want equipping a skill distinguished from unlocking it, so that changing my loadout does not appear to spend skill points.
36. As a player seeking more tailored attribute advice, I want to optionally enter my equipped weapon's scaling attributes and letter grades, so that its scaling can inform recommendations.
37. As a spoiler-conscious player, I want to supply scaling information without browsing a weapon catalogue, so that I do not discover future equipment through setup.
38. As a player skipping weapon setup, I want useful general attribute advice with its assumptions stated, so that I understand the limits of the recommendation.
39. As a player changing weapons, I want to update scaling inputs, so that subsequent recommendations use my current information.
40. As a player who has gained one level, I want to report that level-up for the relevant character, so that I can see what to invest next.
41. As a player returning after several levels, I want to enter the current level directly, so that I do not have to replay every intermediate level-up.
42. As a player returning after several levels, I want one combined recommendation for available points, so that catching up is straightforward.
43. As a player who spent points while away, I want to correct actual allocations, unlocked skills, and unspent balances, so that the app's records match the game.
44. As a player reviewing advice, I want it to remain a pending recommendation until confirmed, so that simply viewing it does not mark points as spent.
45. As a player interrupted before making changes in-game, I want to return without the app treating those recommendations as applied, so that my records remain accurate.
46. As a player who followed the advice, I want an I've applied these action, so that the app records my new allocation and unlocked skills.
47. As a player who chose differently, I want to enter my actual choices, so that future advice adapts to what I did.
48. As a player, I want a confirmed recommendation to be applied only once, so that repeated clicks do not spend recorded points twice.
49. As a player correcting inputs, I want pending advice recalculated from the revised state, so that stale instructions cannot overwrite my corrections.
50. As a player who added the wrong character, I want to remove their card from my party view, so that I can correct the tracked party.
51. As a player restoring a removed character, I want their recorded level, attributes, and skills restored, so that I do not need to enter them again.
52. As a spoiler-conscious player, I want removing a character to leave future reveals untouched, so that correcting my party does not disclose someone else.
53. As a player restarting a run, I want to reset a selected playthrough, including removed characters and reveal state, so that I can start fresh.
54. As a player with multiple playthroughs, I want resetting one to leave the others intact, so that another run or person's progress is preserved.
55. As a returning player, I want confirmed progress and settings restored after a reload, so that normal browsing does not lose my work.
56. As a player whose browser cannot save, I want a clear save failure instead of a false success, so that I know my changes may not persist.
57. As a player with unreadable saved data, I want the app to avoid silently discarding it, so that a loading problem does not erase my progress.
58. As a player using a phone, I want setup and daily guidance to fit a small screen, so that I can consult the guide while playing.
59. As a keyboard or assistive-technology user, I want usable forms, clear validation, accessible dialogs, and spoiler-safe labels, so that I can use the complete workflow.
60. As a player, I want researched mechanics and honest recommendation limits, so that I can distinguish verified game rules from editorial build advice.

## Implementation Decisions

- **Application shape:** Use Astro for the static page, Vue components for the interactive companion, Tailwind for styling, and TypeScript for game data and progression rules. No server runtime is required for the MVP's normal operation.
- **Component responsibilities:** Separate playthrough management, character setup, party cards, character guidance, and reveal dialogs. Keep components focused on interaction and presentation rather than embedding game rules throughout the interface.
- **Domain responsibilities:** Maintain a small number of cohesive modules for researched game data, recommendations and progression operations, and saved-state handling. Expose behavior for recording actual progress, generating pending recommendations, confirming spending, and managing playthroughs. Keep rule helpers internal; do not create an independent test seam for every helper or component.
- **Saved-state contract:** Use a versioned, validated local-storage record containing independent playthrough identifiers, names, character records, reveal/discovery state, and the last selected playthrough. Each character record distinguishes current level, invested attributes, unspent points, unlocked skills, skill-setup completion, optional scaling inputs, and whether the character is tracked or removed. Keep actual progress distinct from suggestions. Preserve any recorded skill loadout separately from ownership.
- **Local persistence:** Persist confirmed changes and restore the last selected playthrough on opening or reload. Expose switching through the menu rather than requiring a picker at every launch. Handle missing, invalid, or unwritable storage explicitly without silently destroying existing saves or claiming an unsuccessful write succeeded.
- **Initial setup:** Offer Gustave and Lune without listing later characters. Allow selection of the initial characters the player wants to track. Supply level-one defaults only after verifying them; do not equate level one with zero in every attribute. Capture current level and actual investments for later starts.
- **Single recommended build:** Provide one default path per character with no alternative-build selector. Prioritize a forgiving first playthrough. Research and author attribute targets or priorities and skill priorities, adapting future investments to existing choices rather than prescribing a required reset.
- **Point accounting:** Use validated actual allocations and available balances. Reconcile changes made outside the app, including direct multi-level updates. Do not infer all skill points from level alone. Recommendations must respect available points, verified caps, prerequisites, ownership, and character-specific mechanics.
- **Optional skill setup:** Capture unlocked skills and remaining skill points. Set up later enables attribute-only use; personalized skill purchases and skill loadouts remain unavailable until the necessary skill information is recorded. Completing or correcting setup recalculates advice.
- **Skill purchase and loadout guidance:** Recommend what to unlock next, including saving points when appropriate. Recommend equipped skills only from the current unlocked set and within verified equip limits. Purchasing and equipping remain distinct operations; merely suggesting a loadout does not assert that the player equipped it.
- **Weapon scaling:** Accept optional scaling attributes and letter grades entered from the equipped weapon. No weapon catalogue is required. Use these inputs to inform attribute advice, while general guidance explicitly states when equipped-weapon scaling is not considered. This is not a full equipment optimizer.
- **Pending recommendations:** Generating or displaying advice never changes invested attributes, unlocked skills, or available balances. The player confirms applying advice in-game or records different actual choices. Confirmation applies valid changes once. Changes to relevant inputs invalidate or recalculate stale advice; the app must not apply an obsolete plan over newer progress.
- **Combined catch-up:** Accept a new current level directly for each character and produce a combined recommendation from the reconciled state and remaining points. Do not require sequentially acknowledging every missed level-up.
- **Character reveal flow:** Keep one generic, non-identifying add control. First show an anonymous warning. Only explicit Reveal character consent discloses the next identity; Add to playthrough is separate. Cancellation before consent discloses nothing. Cancellation afterward adds nothing and must not silently skip to another candidate.
- **No completion clues:** Keep the same add control even when no further character is available. Disclose that terminal state only after normal reveal consent. Never display a complete roster, total possible size, remaining count, or completion indicator.
- **Skill visibility:** An added character's skills may be shown if already visible in their in-game skill tree, even when unpurchased. Skills disclosed only through later story progress require explicit discovery confirmation. Determine those boundaries from research; do not invent generic level gates that reveal story-dependent skills prematurely.
- **Spoiler isolation:** Reveal and discovery state belongs to a playthrough. Guard visible content, accessibility labels, dialogs, and initial rendering. Switching playthroughs clears open character-specific dialogs and stale display from the previous playthrough. Do not render unrevealed identities into the initial page or generate a public full-roster page.
- **Removal, restoration, and reset:** Removal hides a character while preserving recorded progression within the playthrough. Restoration uses that saved progression. Removal does not advance recruitment or reveal another character. Reset clears the selected playthrough's progression, retained removed-character records, and reveal state, without changing other playthroughs.
- **Research and content:** Before encoding precise recommendations, verify introduction order, starting values, level limits, attribute caps and scaling, point acquisition, skill costs and prerequisites, equip limits, and character-specific progression exceptions. Record sources alongside maintained game data and distinguish mechanics from editorial recommendations. Keep user-facing research summaries spoiler-safe. Do not fabricate uniform mechanics for characters that progress differently.
- **Delivery:** Produce a working local preview and verified static build. Public hosting selection and deployment are separate from completing this specification.

## Testing Decisions

- **Prior art:** The repository currently contains the glossary and design documents, with no application code, test suite, fixtures, or established test boundary. There is no existing seam to reuse. No prototype was produced.
- **Primary boundary:** Exercise the application through browser-visible behavior, using the public UI and reloads to validate complete workflows. This is the highest practical boundary and should carry the bulk of acceptance coverage across the Vue interface, progression behavior, and local persistence.
- **Focused rule coverage:** Where many point, cap, prerequisite, or scaling combinations would make browser cases cumbersome, test the public recommendation/progression interface with representative researched character states. Assert valid outcomes and domain invariants rather than internal helper calls or the exact implementation of a scoring formula. Avoid adding further seams for individual components, storage helpers, or data transformations.
- **What makes a good test:** Reproduce a meaningful player action and assert an externally observable result. Use fixed, researched fixtures and explicit expected outcomes. Tests must not simply mirror the implementation, depend on live guide websites, or snapshot entire pages to verify incidental markup.
- **Setup and recommendations:** Cover verified level-one defaults, mid-playthrough starts, pre-existing allocations that differ from the build, optional skill setup, delayed completion, missing weapon scaling, and updated scaling inputs. Verify that skipped skill setup cannot produce personalized skill purchases or loadouts.
- **Rule validity:** Cover no available points, insufficient skill points, saving toward a prerequisite, already owned skills, attribute caps, legal equip limits, and researched character-specific exceptions. Advice must not spend more than available, purchase an owned skill, skip prerequisites, or equip an unavailable skill. Include an explicit researched case where weapon-scaling input changes appropriate attribute advice.
- **Actual versus suggested progress:** Verify that viewing or leaving advice does not spend points; confirming records the applied choices once; recording different choices changes future guidance; and input changes prevent an old recommendation from being applied. Include reloads before and after confirmation.
- **Catch-up:** Update directly across multiple levels, reconcile points spent while away, and verify a single combined recommendation using only remaining balances. Characters retain independent levels and allocations.
- **Spoiler behavior:** Check rendered content and accessible names before consent, cancellation at both reveal stages, sequential additions, removal without reveal advancement, and later skill discovery gating. Verify the add control remains unchanged at the terminal state and no roster totals or completion badges appear.
- **Playthrough isolation:** Create distinct playthroughs with different progress, switch between them, reload into the last selected one, and verify their records and reveals stay independent. Ensure open dialogs and previous-playthrough details do not survive a switch.
- **Retention and reset:** Remove and restore a character with recorded progression, then reset that playthrough and confirm its retained records and reveals are cleared while another playthrough remains intact.
- **Persistence failures:** Exercise unwritable storage and malformed saved data, verifying an honest visible failure without silent erasure or a misleading saved state. Simulate the environment failure without asserting storage implementation details.
- **Usability and build:** Exercise setup and normal use at phone and desktop sizes, keyboard focus and navigation through dialogs, form validation, and assistive labels. Run the production build. Test implementation is part of the future feature work; this specification does not claim those checks have already passed.

## Out of Scope

- Alternative selectable builds, custom build authoring, and a claim of globally optimal damage.
- Accounts, authentication, databases, cloud synchronization, and automatic game-save integration.
- Runtime AI generation of recommendations or live fetching of guide content during normal use.
- A complete weapon catalogue, equipment inventory, or full equipment optimization.
- Walkthroughs, quest or location guidance, story summaries, and exposure of future party members outside the explicit reveal flow.
- A requirement to reset existing attribute investments to follow the recommended build.
- Per-level manual replay as a prerequisite to catching up after several levels.
- Public deployment or hosting-provider selection as part of the spec-publication task.

## Further Notes

The user confirmed shared understanding of the consolidated MVP after a design interview. This specification synthesizes those decisions; implementation has not begun. The recommended build is editorial advice for a forgiving first playthrough, not a promise of a mathematically optimal build for every encounter or equipment choice.

Reopening the last party is deliberate: on a shared device, the next person may initially see that party until switching. This preference does not authorize sharing reveal state across playthroughs.

Game research is required implementation work. Exact numeric allocations, skill priorities, and character-specific exceptions are not yet verified and must not be presented as established facts in the implementation. The specification intentionally contains no later-character identities or total roster size.

Issue triage: ready-for-agent. Application implementation and its verification belong to the subsequent feature work.
