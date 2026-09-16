<script setup lang="ts">
import { computed, ref } from "vue";
import {
  INITIAL_CHARACTERS,
  LATER_CHARACTERS,
  attributeLabels,
} from "../domain/data";
import { ATTRIBUTES, emptyAttributes } from "../domain/types";
import type { Character, Playthrough, SaveData } from "../domain/types";
import {
  applyRecommendation,
  recommend,
  updateProgress,
} from "../domain/rules";
import { id, load, save } from "../domain/storage";
import CharacterCard from "./CharacterCard.vue";
import FocusDialog from "./FocusDialog.vue";
import SetupPanel from "./SetupPanel.vue";
import { createPlaythrough, removeCharacter, resetPlaythrough, restoreCharacter, switchPlaythrough } from "../domain/playthroughs";
const loaded =
  typeof localStorage !== "undefined" ? load() : { kind: "missing" as const };
const state = ref<SaveData | null>(
  loaded.kind === "loaded" ? loaded.data : null,
);
const unreadableSave = loaded.kind === "invalid";
const setupName = ref("My Expedition");
const selected = ref<string[]>(["gustave", "lune"]);
const saveError = ref(loaded.kind === "invalid" ? loaded.error : "");
const notice = ref("");
const revealStage = ref<"warning" | "identity" | "terminal" | null>(null);
const setupCharacter = ref<Character | null>(null);
const freshSetup = ref(false);
const formError = ref("");
const addingCandidate = ref(false);
const revealedCandidate = ref<(typeof LATER_CHARACTERS)[number] | null>(null);
const draft = ref({ level: 1, points: 0, invested: emptyAttributes() });
const managementOpen = ref(false); const newName = ref(""); const newSelected = ref<string[]>(["gustave", "lune"]);
const active = computed(
  () =>
    state.value?.playthroughs.find((p) => p.id === state.value?.activeId) ??
    null,
);
const removed = computed(() => active.value?.characters.filter((c) => !c.tracked) ?? []);
function manageSwitch(id0:string){if(!state.value)return;const before=snapshot();state.value=switchPlaythrough(state.value,id0);setupCharacter.value=null;revealStage.value=null;managementOpen.value=false;if(!persist(before))managementOpen.value=true}
function manageCreate(){if(!state.value||!newSelected.value.length)return;const before=snapshot();const chars=newSelected.value.map((key)=>{const d=INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS];return {id:key,name:d.name,level:1,invested:{...d.defaults},points:3,tracked:true,revealed:true}});state.value=createPlaythrough(state.value,newName.value,chars);newName.value="";managementOpen.value=false;if(!persist(before))managementOpen.value=true}
function manageRemove(c:Character){if(!state.value||!active.value)return;const before=snapshot();const next=removeCharacter(active.value,c.id);state.value.playthroughs=state.value.playthroughs.map((p)=>p.id===next.id?next:p);persist(before)}
function manageRestore(c:Character){if(!state.value||!active.value)return;const before=snapshot();const next=restoreCharacter(active.value,c.id);state.value.playthroughs=state.value.playthroughs.map((p)=>p.id===next.id?next:p);managementOpen.value=false;if(!persist(before))managementOpen.value=true}
function manageReset(){if(!state.value||!active.value)return;const before=snapshot();state.value=resetPlaythrough(state.value,active.value.id);managementOpen.value=false;if(!persist(before))managementOpen.value=true}
function beginFreshSetup(){
  if (!state.value || !active.value) return;
  const before = snapshot();
  const characters = ["gustave", "lune"].map((key) => {
    const d = INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS];
    return { id: key, name: d.name, level: 1, invested: { ...d.defaults }, points: 3, tracked: true, revealed: true };
  });
  const current = active.value;
  state.value = { ...state.value, playthroughs: state.value.playthroughs.map((p) => p.id === current.id ? { ...p, characters, nextRevealIndex: 0, revision: p.revision + 1 } : p) };
  freshSetup.value = false;
  persist(before);
}
const snapshot = () =>
  state.value ? (JSON.parse(JSON.stringify(state.value)) as SaveData) : null;
function persist(before: SaveData | null) {
  if (!state.value) return true;
  const result = save(state.value);
  if (!result.ok) {
    state.value = before;
    saveError.value =
      result.error ?? "Your browser could not save this change.";
    return false;
  }
  saveError.value = "";
  notice.value = "Saved";
  return true;
}
function start(
  actual: Record<
    string,
    {
      level: number;
      points: number;
      invested: typeof draft.value.invested;
    } | null
  > = {},
) {
  if (unreadableSave || !selected.value.length) return;
  const before = snapshot();
  try {
    const characters = selected.value.map((key) => {
      const d = INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS];
      const input = actual[key];
      if (input)
        return updateProgress(
          {
            id: key,
            name: d.name,
            level: 1,
            invested: { ...d.defaults },
            points: 3,
            tracked: true,
            revealed: true,
          },
          input,
        );
      return {
        id: key,
        name: d.name,
        level: 1,
        invested: { ...d.defaults },
        points: 3,
        tracked: true,
        revealed: true,
      };
    });
    if (state.value && active.value && freshSetup.value) {
      const current = active.value;
      const updated: Playthrough = {
        ...current,
        name: setupName.value.trim() || current.name,
        characters,
        nextRevealIndex: 0,
        revision: current.revision + 1,
      };
      state.value = {
        ...state.value,
        playthroughs: state.value.playthroughs.map((p) =>
          p.id === current.id ? updated : p,
        ),
      };
      freshSetup.value = false;
    } else {
      const p: Playthrough = {
        id: id("playthrough"),
        name: setupName.value.trim() || "My Expedition",
        characters,
        nextRevealIndex: 0,
        revision: 0,
      };
      state.value = { version: 1, playthroughs: [p], activeId: p.id };
    }
    persist(before);
  } catch (e) {
    saveError.value =
      e instanceof Error ? e.message : "Enter valid in-game progress.";
  }
}
function beginSetup(c: Character) {
  formError.value = "";
  setupCharacter.value = c;
  draft.value = {
    level: c.level,
    points: c.points,
    invested: { ...c.invested },
  };
}
function submitProgress() {
  if (!active.value || !setupCharacter.value) return;
  try {
    const before = snapshot();
    const c = updateProgress({ ...setupCharacter.value }, draft.value);
    if (addingCandidate.value && revealedCandidate.value) {
      active.value.characters.push(c);
      active.value.nextRevealIndex++;
      addingCandidate.value = false;
      revealedCandidate.value = null;
    } else {
      const i = active.value.characters.findIndex(
        (x) => x.id === setupCharacter.value?.id,
      );
      active.value.characters[i] = c;
    }
    active.value.revision++;
    if (persist(before)) setupCharacter.value = null;
    formError.value = "";
  } catch (e) {
    formError.value =
      e instanceof Error ? e.message : "Enter valid in-game progress.";
  }
}
function advise(c: Character) {
  const before = snapshot();
  c.pending = recommend(c);
  persist(before);
}
function confirm(c: Character) {
  if (!c.pending || !active.value) return;
  const before = snapshot();
  const changed = applyRecommendation(c, c.pending);
  if (changed === c) {
    notice.value = "That advice is stale; update progress before applying it.";
    return;
  }
  Object.assign(c, changed);
  active.value.revision++;
  if (persist(before)) notice.value = "Applied recommendation recorded once.";
}
function openReveal() {
  revealStage.value = "warning";
}
function consentReveal() {
  if (!active.value) return;
  const n = active.value.nextRevealIndex;
  revealStage.value = n < LATER_CHARACTERS.length ? "identity" : "terminal";
  if (n < LATER_CHARACTERS.length)
    revealedCandidate.value = LATER_CHARACTERS[n];
}
function addLater() {
  if (!revealedCandidate.value) return;
  const d = revealedCandidate.value;
  addingCandidate.value = true;
  revealStage.value = null;
  beginSetup({
    id: d.id,
    name: d.name,
    level: 1,
    invested: { ...d.defaults },
    points: 0,
    tracked: true,
    revealed: true,
  });
}
function cancelReveal() {
  revealStage.value = null;
  if (addingCandidate.value) {
    addingCandidate.value = false;
    setupCharacter.value = null;
  }
}
</script>
<template>
  <main class="shell">
    <p v-if="saveError" class="error" role="alert">{{ saveError }}</p>
    <header>
      <p class="eyebrow">EXPEDITION 33 · FIELD GUIDE</p>
      <h1>Keep your build on course.</h1>
      <p class="lede">
        A quiet companion for recording real progress and choosing the next safe
        step.
      </p>
    </header>
    <SetupPanel
      v-if="!state || (active && active.characters.length === 0 && freshSetup)"
      v-model:name="setupName"
      :selected="selected"
      :disabled="unreadableSave || !!saveError"
      @update:selected="selected = $event"
      @start="start"
    /><section v-else-if="active && active.characters.length === 0" class="card setup-empty">
      <h2>Start this playthrough again</h2>
      <p>This playthrough has been reset. Begin fresh setup when you are ready.</p>
      <button class="primary" @click="beginFreshSetup">Begin fresh setup</button>
    </section><template v-else-if="active"
      ><nav class="bar">
        <strong>{{ active.name }}</strong
        ><span aria-live="polite">{{ notice }}</span>
        <button class="link" @click="managementOpen=true">Playthrough menu</button>
      </nav>
      <section class="party">
        <CharacterCard
          v-for="c in active.characters.filter((x) => x.tracked)"
          :key="c.id"
          :character="c"
          @update="beginSetup"
          @advise="advise"
          @confirm="confirm"
          @remove="manageRemove"
        />
      </section>
      <button class="add" @click="openReveal">＋ Add a character</button>
      <p class="research">
        Guidance is based on recorded in-game progress. Initial defaults and
        priorities are kept with the guide's research notes; recommendations are
        editorial advice.
      </p></template
    >
    <FocusDialog
      v-if="setupCharacter"
      :title="`Update ${setupCharacter.name}`"
      @close="setupCharacter = null"
      ><p>
        Enter what is true in-game. This replaces the recorded inputs and clears
        old advice.
      </p>
      <p v-if="formError" class="error" role="alert">{{ formError }}</p>
      <form @submit.prevent="submitProgress">
        <label
          >Current level<input
            type="number"
            min="1"
            max="99"
            v-model.number="draft.level" /></label
        ><label
          >Available attribute points<input
            type="number"
            min="0"
            v-model.number="draft.points"
        /></label>
        <div class="edit-grid">
          <label v-for="a in ATTRIBUTES" :key="a"
            >{{ attributeLabels[a]
            }}<input
              type="number"
              min="0"
              max="99"
              v-model.number="draft.invested[a]"
          /></label>
        </div>
        <div class="actions">
          <button type="button" @click="setupCharacter = null">Cancel</button
          ><button class="primary">Save progress</button>
        </div>
      </form></FocusDialog
    >
    <FocusDialog
      v-if="revealStage"
      title="Continue your expedition?"
      @close="cancelReveal"
      ><p v-if="revealStage === 'warning'">
        Only continue if someone new has joined your party. The next identity
        stays hidden until you choose to reveal it.
      </p>
      <p v-else-if="revealStage === 'identity'">
        The next character is <strong>{{ revealedCandidate?.name }}</strong
        >.
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
          Add to playthrough
        </button>
      </div></FocusDialog
    >
    <FocusDialog v-if="managementOpen" title="Playthroughs" @close="managementOpen=false"><label>New playthrough name<input v-model="newName" aria-label="New playthrough name"></label><fieldset><legend>Initial characters for the new run</legend><label v-for="(d,key) in INITIAL_CHARACTERS" :key="key" class="check"><input type="checkbox" v-model="newSelected" :value="key"> {{d.name}}</label></fieldset><button class="primary" @click="manageCreate">Create independent playthrough</button><div class="run-list"><button v-for="p in state?.playthroughs" :key="p.id" @click="manageSwitch(p.id)">{{p.name}}</button></div><div v-if="removed.length"><button v-for="c in removed" :key="c.id" @click="manageRestore(c)">Restore {{c.name}}</button></div><button class="danger" @click="manageReset">Reset this playthrough</button></FocusDialog>
  </main>
</template>
<style>
.shell {
  max-width: 960px;
  margin: auto;
  padding: 48px 22px 80px;
  color: #f6f1e8;
  background: #171717;
  min-height: 100vh;
}
.card {
  background: #242322;
  border: 1px solid #514942;
  border-radius: 18px;
  padding: 24px;
}
.party {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
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
}
.error {
  color: #ffb4a8;
}
button {
  padding: 10px 14px;
}
.add {
  display: block;
  width: 100%;
  margin: 22px 0;
  padding: 16px;
}
label {
  display: grid;
  gap: 7px;
  margin: 16px 0;
}
input {
  padding: 10px;
  width: 100%;
}
.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
</style>
