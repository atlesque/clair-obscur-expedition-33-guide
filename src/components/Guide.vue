<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  INITIAL_CHARACTERS,
  LATER_CHARACTERS,
  attributeLabels,
} from "../domain/data";
import { ATTRIBUTES, emptyAttributes } from "../domain/types";
import type {
  Attributes,
  Character,
  Playthrough,
  SaveData,
} from "../domain/types";
import {
  applyRecommendation,
  recommend,
  updateProgress,
} from "../domain/rules";
import { id, load, save } from "../domain/storage";
import {
  createPlaythrough,
  removeCharacter,
  resetPlaythrough,
  restoreCharacter,
  switchPlaythrough,
} from "../domain/playthroughs";

const loaded =
  typeof localStorage !== "undefined" ? load() : { kind: "missing" as const };
const state = ref<SaveData | null>(
  loaded.kind === "loaded" ? loaded.data : null,
);
const setupName = ref("My Expedition");
const selected = ref<("gustave" | "lune")[]>(["gustave", "lune"]);
const newSelected = ref<("gustave" | "lune")[]>(["gustave", "lune"]);
const saveError = ref("");
const notice = ref("");
const managementOpen = ref(false);
const newName = ref("");
const freshSetup = ref(false);
const revealStage = ref<"warning" | "identity" | "terminal" | null>(null);
const setupCharacter = ref<Character | null>(null);
const draft = ref<{ level: number; points: number; invested: Attributes }>({
  level: 1,
  points: 0,
  invested: emptyAttributes(),
});
const active = computed(
  () =>
    state.value?.playthroughs.find((p) => p.id === state.value?.activeId) ??
    null,
);
const tracked = computed(
  () => active.value?.characters.filter((c) => c.tracked) ?? [],
);
const removed = computed(
  () => active.value?.characters.filter((c) => !c.tracked) ?? [],
);
function closeDialogs(event: KeyboardEvent) {
  if (event.key === "Escape") {
    managementOpen.value = false;
    revealStage.value = null;
    setupCharacter.value = null;
  }
}
onMounted(() => window.addEventListener("keydown", closeDialogs));
onUnmounted(() => window.removeEventListener("keydown", closeDialogs));
if (loaded.kind === "invalid") saveError.value = loaded.error;
function persist() {
  if (!state.value) return;
  const result = save(state.value);
  saveError.value = result.error ?? "";
  notice.value = result.ok ? "Saved" : "";
}
function initialCharacters(ids = selected.value) {
  return ids.map((characterId) => {
    const d = INITIAL_CHARACTERS[characterId];
    return {
      id: characterId,
      name: d.name,
      level: 1,
      invested: { ...d.defaults },
      points: 3,
      tracked: true,
      revealed: true,
    };
  });
}
function start() {
  if (freshSetup.value && state.value && active.value) {
    active.value.characters = initialCharacters();
    active.value.name = setupName.value.trim() || active.value.name;
    active.value.nextRevealIndex = 0;
    active.value.revision++;
    freshSetup.value = false;
    persist();
    return;
  }
  const p: Playthrough = {
    id: id("playthrough"),
    name: setupName.value.trim() || "My Expedition",
    characters: initialCharacters(),
    nextRevealIndex: 0,
    revision: 0,
  };
  state.value = { version: 1, playthroughs: [p], activeId: p.id };
  persist();
}
function beginSetup(c: Character) {
  setupCharacter.value = c;
  draft.value = {
    level: c.level,
    points: c.points,
    invested: { ...c.invested },
  };
}
function submitProgress() {
  if (!active.value || !setupCharacter.value) return;
  const i = active.value.characters.findIndex(
    (c) => c.id === setupCharacter.value?.id,
  );
  if (i < 0) return;
  active.value.characters[i] = updateProgress(
    active.value.characters[i],
    draft.value,
  );
  active.value.revision++;
  setupCharacter.value = null;
  persist();
}
function advise(c: Character) {
  c.pending = recommend(c);
  persist();
}
function confirm(c: Character) {
  if (!c.pending || !active.value) return;
  const changed = applyRecommendation(c, c.pending);
  if (changed !== c) {
    Object.assign(c, changed);
    active.value.revision++;
    notice.value = "Applied recommendation recorded once.";
    persist();
  } else
    notice.value = "That advice is stale; update progress before applying it.";
}
function openReveal() {
  revealStage.value = "warning";
}
function consentReveal() {
  revealStage.value =
    active.value && active.value.nextRevealIndex < LATER_CHARACTERS.length
      ? "identity"
      : "terminal";
}
function cancelReveal() {
  revealStage.value = null;
}
function addLater() {
  if (!active.value) return;
  const n = active.value.nextRevealIndex;
  const candidate = LATER_CHARACTERS[n];
  if (!candidate) {
    revealStage.value = null;
    return;
  }
  const c: Character = {
    id: candidate.id,
    name: candidate.name,
    level: 1,
    invested: { ...candidate.defaults },
    points: 0,
    tracked: true,
    revealed: true,
  };
  active.value.characters.push(c);
  active.value.nextRevealIndex++;
  active.value.revision++;
  revealStage.value = null;
  beginSetup(c);
  persist();
}
function hide(c: Character) {
  if (!state.value || !active.value) return;
  const next = removeCharacter(active.value, c.id);
  state.value.playthroughs = state.value.playthroughs.map((p) =>
    p.id === next.id ? next : p,
  );
  setupCharacter.value = null;
  persist();
}
function restore(c: Character) {
  if (!state.value || !active.value) return;
  const next = restoreCharacter(active.value, c.id);
  state.value.playthroughs = state.value.playthroughs.map((p) =>
    p.id === next.id ? next : p,
  );
  managementOpen.value = false;
  persist();
}
function resetSelected() {
  if (!state.value || !active.value) return;
  state.value = resetPlaythrough(state.value, active.value.id);
  setupCharacter.value = null;
  revealStage.value = null;
  managementOpen.value = false;
  setupName.value = active.value.name;
  freshSetup.value = true;
  persist();
}
function switchTo(id0: string) {
  if (!state.value) return;
  state.value = switchPlaythrough(state.value, id0);
  setupCharacter.value = null;
  revealStage.value = null;
  managementOpen.value = false;
  persist();
}
function createAnother() {
  if (!state.value) return;
  state.value = createPlaythrough(
    state.value,
    newName.value,
    initialCharacters(newSelected.value),
  );
  newName.value = "";
  managementOpen.value = false;
  persist();
}
function chooseInitialCharacters() {
  if (!state.value || !active.value) return;
  active.value.characters = initialCharacters();
  active.value.revision++;
  persist();
}
</script>
<template>
  <section v-if="freshSetup" class="modal-backdrop">
    <form class="modal setup" @submit.prevent="start">
      <h2>Start this playthrough again</h2>
      <p>
        Choose the initial characters for this fresh run. Its previous progress
        and discoveries have been cleared.
      </p>
      <label
        >Playthrough name<input
          v-model="setupName"
          aria-label="Playthrough name"
      /></label>
      <fieldset>
        <legend>Initial characters</legend>
        <label v-for="(d, key) in INITIAL_CHARACTERS" :key="key" class="check"
          ><input v-model="selected" type="checkbox" :value="key" />
          {{ d.name }}</label
        >
      </fieldset>
      <div class="actions">
        <button class="primary">Begin fresh setup</button>
      </div>
    </form>
  </section>
  <main class="shell">
    <header>
      <p class="eyebrow">EXPEDITION 33 · FIELD GUIDE</p>
      <h1>Keep your build on course.</h1>
      <p class="lede">
        A quiet companion for recording real progress and choosing the next safe
        step.
      </p>
    </header>
    <section v-if="!state" class="card setup">
      <h2>Start a playthrough</h2>
      <p>Name this run and choose only the characters you want to track now.</p>
      <label
        >Playthrough name<input
          v-model="setupName"
          aria-label="Playthrough name"
      /></label>
      <fieldset>
        <legend>Initial characters</legend>
        <label v-for="(d, key) in INITIAL_CHARACTERS" :key="key" class="check"
          ><input v-model="selected" type="checkbox" :value="key" />
          {{ d.name }}</label
        >
      </fieldset>
      <button class="primary" @click="start">Create playthrough</button>
    </section>
    <template v-else-if="active"
      ><nav class="bar">
        <strong>{{ active.name }}</strong
        ><span class="save-state" aria-live="polite">{{
          saveError || notice
        }}</span
        ><button class="link" @click="managementOpen = true">
          Playthrough menu
        </button>
      </nav>
      <section v-if="!tracked.length" class="card empty">
        <h2>No characters are tracked yet</h2>
        <p>
          Choose initial characters from the playthrough menu to begin this run.
        </p>
        <button class="primary" @click="managementOpen = true">
          Open playthrough menu
        </button>
      </section>
      <section class="party">
        <article v-for="c in tracked" :key="c.id" class="card character">
          <div class="card-head">
            <div>
              <p class="eyebrow">TRACKED CHARACTER</p>
              <h2>{{ c.name }}</h2>
            </div>
            <span class="level">LV {{ c.level }}</span>
          </div>
          <div class="stats">
            <div v-for="a in ATTRIBUTES" :key="a">
              <span>{{ attributeLabels[a] }}</span
              ><b>{{ c.invested[a] }}</b>
            </div>
          </div>
          <p v-if="c.pending" class="advice">
            <strong>Pending recommendation</strong><br /><span
              v-for="(amount, a) in c.pending.spend"
              :key="a"
              >+{{ amount }} {{ attributeLabels[a] }} </span
            ><br /><small>{{ c.pending.explanation }}</small>
          </p>
          <div class="actions">
            <button @click="beginSetup(c)">Update progress</button
            ><button @click="advise(c)">
              Get advice <span class="sr-only">for {{ c.name }}</span></button
            ><button v-if="c.pending" class="primary" @click="confirm(c)">
              I've applied these</button
            ><button class="quiet" @click="hide(c)">Remove</button>
          </div>
          <p class="points">{{ c.points }} attribute points available</p>
        </article>
      </section>
      <button class="add" @click="openReveal">＋ Add a character</button>
      <p class="research">
        Guidance is based on recorded in-game progress. Recommendations are
        editorial advice, not a claim of optimality.
      </p></template
    >
    <div v-if="managementOpen" class="modal-backdrop">
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        <h2 id="menu-title">Playthroughs</h2>
        <p>
          Each named playthrough keeps its own party, progress, and discoveries.
        </p>
        <label
          >New playthrough name<input
            v-model="newName"
            aria-label="New playthrough name"
            placeholder="Another run" /></label
        ><button class="primary" @click="createAnother">
          Create independent playthrough
        </button>
        <fieldset><legend>Initial characters for the new run</legend><label v-for="(d,key) in INITIAL_CHARACTERS" :key="key" class="check"><input v-model="newSelected" type="checkbox" :value="key"> {{d.name}}</label></fieldset>
        <div class="run-list">
          <button
            v-for="p in state.playthroughs"
            :key="p.id"
            :class="{ selected: p.id === active.id }"
            @click="switchTo(p.id)"
          >
            {{ p.name }}
          </button>
        </div>
        <div v-if="removed.length" class="removed">
          <h3>Removed characters</h3>
          <button v-for="c in removed" :key="c.id" @click="restore(c)">
            Restore {{ c.name }}
          </button>
        </div>
        <button class="danger" @click="resetSelected">
          Reset this playthrough
        </button>
        <div class="actions">
          <button @click="managementOpen = false">Close</button>
        </div>
      </section>
    </div>
    <div v-if="setupCharacter" class="modal-backdrop">
      <form class="modal" @submit.prevent="submitProgress">
        <h2>Update {{ setupCharacter.name }}</h2>
        <p>
          Enter what is true in-game. This replaces the recorded inputs and
          clears old advice.
        </p>
        <label
          >Current level<input
            v-model.number="draft.level"
            type="number"
            min="1" /></label
        ><label
          >Available attribute points<input
            v-model.number="draft.points"
            type="number"
            min="0"
        /></label>
        <div class="edit-grid">
          <label v-for="a in ATTRIBUTES" :key="a"
            >{{ attributeLabels[a]
            }}<input
              v-model.number="draft.invested[a]"
              type="number"
              min="0"
              max="99"
          /></label>
        </div>
        <div class="actions">
          <button type="button" @click="setupCharacter = null">Cancel</button
          ><button class="primary">Save progress</button>
        </div>
      </form>
    </div>
    <div v-if="revealStage" class="modal-backdrop">
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reveal-title"
      >
        <h2 id="reveal-title">Continue your expedition?</h2>
        <p v-if="revealStage === 'warning'">
          Only continue if someone new has joined your party. The next identity
          stays hidden until you choose to reveal it.
        </p>
        <p v-else-if="revealStage === 'identity'">
          The next character is ready to be revealed.
        </p>
        <p v-else>No additional character is available right now.</p>
        <div class="actions">
          <button @click="cancelReveal">Cancel</button
          ><button
            v-if="revealStage === 'warning'"
            class="primary"
            @click="consentReveal"
          >
            Reveal character</button
          ><button
            v-else-if="revealStage === 'identity'"
            class="primary"
            @click="addLater"
          >
            Reveal and add to playthrough
          </button>
        </div>
      </section>
    </div>
  </main>
</template>
<style>
:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #f6f1e8;
  background: #171717;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background:
    radial-gradient(circle at 20% 0, #3b2b28, transparent 45%), #171717;
  min-height: 100vh;
}
.shell {
  max-width: 960px;
  margin: auto;
  padding: 48px 22px 80px;
}
header {
  max-width: 650px;
  margin-bottom: 32px;
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #d5a477;
  margin: 0 0 10px;
}
.lede {
  font-size: 18px;
  color: #c4bdb4;
  line-height: 1.5;
}
h1 {
  font-size: clamp(34px, 6vw, 64px);
  line-height: 0.98;
  margin: 0;
  letter-spacing: -0.05em;
}
h2 {
  margin: 0 0 12px;
}
.card {
  background: #242322;
  border: 1px solid #514942;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 15px 50px #0004;
}
.setup {
  max-width: 560px;
}
label {
  display: grid;
  gap: 7px;
  color: #cfc6bb;
  margin: 16px 0;
}
input {
  background: #171717;
  color: #fff;
  border: 1px solid #655d55;
  border-radius: 8px;
  padding: 10px;
  font: inherit;
  width: 100%;
}
fieldset {
  border: 1px solid #514942;
  border-radius: 12px;
  margin: 24px 0;
  padding: 10px 16px;
}
.check {
  display: flex;
  align-items: center;
  gap: 10px;
}
.check input {
  width: auto;
}
.primary,
button {
  border: 1px solid #88705d;
  background: transparent;
  color: #fff;
  border-radius: 9px;
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}
.primary {
  background: #c77f4e;
  border-color: #e0a071;
  color: #1b1410;
}
.bar {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}
.save-state {
  color: #b8d7b0;
  flex: 1;
}
.link {
  border: 0;
  color: #d5a477;
}
.party {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}
.card-head {
  display: flex;
  justify-content: space-between;
}
.level {
  color: #d5a477;
  font-weight: 700;
}
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  margin: 22px 0;
}
.stats div {
  background: #171717;
  border-radius: 7px;
  padding: 8px 4px;
  text-align: center;
}
.stats span {
  display: block;
  font-size: 10px;
  color: #aaa;
}
.advice {
  background: #32271f;
  padding: 13px;
  border-radius: 9px;
  line-height: 1.5;
}
.advice small {
  color: #d0c2b5;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.points,
.research {
  color: #aaa;
  font-size: 13px;
}
.add {
  display: block;
  width: 100%;
  margin: 22px 0;
  padding: 16px;
  border: 1px dashed #776452;
  background: transparent;
  color: #ddac7d;
  border-radius: 13px;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: #000b;
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 2;
}
.modal {
  background: #242322;
  border: 1px solid #776452;
  border-radius: 18px;
  padding: 26px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}
.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.edit-grid label {
  margin: 4px 0;
}
.run-list {
  display: grid;
  gap: 8px;
  margin: 22px 0;
}
.run-list button {
  text-align: left;
}
.run-list .selected {
  border-color: #e0a071;
  background: #32271f;
}
.removed {
  border-top: 1px solid #514942;
  padding-top: 16px;
  display: grid;
  gap: 8px;
}
.danger {
  border-color: #a76b63;
  color: #f0b1a7;
  margin-top: 18px;
}
.quiet {
  border: 0;
  color: #d1a69b;
  padding-left: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@media (max-width: 600px) {
  .shell {
    padding: 32px 15px;
  }
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
  .bar {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .save-state {
    order: 3;
    flex-basis: 100%;
  }
}
</style>
