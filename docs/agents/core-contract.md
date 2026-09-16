# Core progression contract

The foundation exposes the following stable state shape for later slices:

```ts
type Character = {
  id: string; name: string; level: number;
  invested: Record<'vitality'|'might'|'agility'|'defence'|'luck', number>;
  points: number; tracked: boolean; revealed: boolean;
  pending?: Recommendation;
};
type Recommendation = {
  characterId: string; base: Attributes; spend: Partial<Attributes>;
  points: number; explanation: string; revision: number;
};
type Playthrough = {
  id: string; name: string; characters: Character[];
  nextRevealIndex: number; revision: number;
};
```

Use `src/domain/rules.ts` for progression operations. `recommend(character)` is pure and returns pending advice; `applyRecommendation(character, recommendation)` rejects stale or over-budget advice by returning the unchanged record; `updateProgress(character, input)` replaces actual in-game inputs and clears pending advice. `src/domain/storage.ts` owns the versioned `localStorage` record. Skill work should extend `Character` with optional fields (`skillSetupComplete`, `unlockedSkills`, `skillPoints`, `loadout`, `pendingSkill`) and preserve these operations' actual-versus-pending semantics.

The Vue composition in `src/components/Guide.vue` renders setup, tracked party cards, progress correction, advice confirmation, and anonymous recruitment consent. Later work can add skill panels to each character card and keep dialogs outside the card's rule logic.
