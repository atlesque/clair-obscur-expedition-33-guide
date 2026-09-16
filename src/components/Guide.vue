<script setup lang="ts">
import { computed, ref } from "vue";
import {
  CHARACTER_PORTRAITS,
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
import NumberStepper from "./NumberStepper.vue";
import SetupPanel from "./SetupPanel.vue";
import SkillPanel from "./SkillPanel.vue";
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
const portraitFailed = ref<Record<string, boolean>>({});
const draft = ref({ level: 1, points: 0, invested: emptyAttributes() });
const managementOpen = ref(false); const newName = ref(""); const newSelected = ref<string[]>(["gustave", "lune"]);
const active = computed(
  () =>
    state.value?.playthroughs.find((p) => p.id === state.value?.activeId) ??
    null,
);
const removed = computed(() => active.value?.characters.filter((c) => !c.tracked) ?? []);
const trackedCharacters = computed(
  () => active.value?.characters.filter((c) => c.tracked) ?? [],
);
const selectedCharacterId = ref<string | null>(null);
const selectedCharacter = computed(
  () =>
    trackedCharacters.value.find((c) => c.id === selectedCharacterId.value) ??
    trackedCharacters.value[0] ??
    null,
);
function selectCharacter(id0: string) {
  selectedCharacterId.value = id0;
}
function portraitFallback(id0: string) {
  portraitFailed.value = { ...portraitFailed.value, [id0]: true };
}
function manageSwitch(id0:string){if(!state.value)return;const before=snapshot();state.value=switchPlaythrough(state.value,id0);if(persist(before)){setupCharacter.value=null;revealStage.value=null;revealedCandidate.value=null;addingCandidate.value=false;freshSetup.value=false;managementOpen.value=false}else managementOpen.value=true}
function manageCreate(){if(!state.value||!newSelected.value.length)return;const before=snapshot();const chars=newSelected.value.map((key)=>{const d=INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS];return {id:key,name:d.name,level:1,invested:{...d.defaults},points:3,tracked:true,revealed:true}});state.value=createPlaythrough(state.value,newName.value,chars);newName.value="";managementOpen.value=false;if(!persist(before))managementOpen.value=true}
function manageRemove(c:Character){if(!state.value||!active.value)return;const before=snapshot();const next=removeCharacter(active.value,c.id);state.value.playthroughs=state.value.playthroughs.map((p)=>p.id===next.id?next:p);persist(before)}
function manageRestore(c:Character){if(!state.value||!active.value)return;const before=snapshot();const next=restoreCharacter(active.value,c.id);state.value.playthroughs=state.value.playthroughs.map((p)=>p.id===next.id?next:p);if(persist(before)){setupCharacter.value=null;revealStage.value=null;revealedCandidate.value=null;addingCandidate.value=false;managementOpen.value=false}else managementOpen.value=true}
function manageReset(){if(!state.value||!active.value)return;const before=snapshot();state.value=resetPlaythrough(state.value,active.value.id);if(persist(before)){setupCharacter.value=null;revealStage.value=null;revealedCandidate.value=null;addingCandidate.value=false;freshSetup.value=false;managementOpen.value=false}else managementOpen.value=true}
function beginFreshSetup(){
  if (!active.value) return;
  freshSetup.value = true;
  setupName.value = active.value.name;
  selected.value = ["gustave", "lune"];
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
function cancelSetup() {
  setupCharacter.value = null;
  formError.value = "";
  if (addingCandidate.value) {
    addingCandidate.value = false;
    revealedCandidate.value = null;
  }
}
function submitProgress() {
  if (!active.value || !setupCharacter.value) return;
  try {
    const before = snapshot();
    const adding = addingCandidate.value && !!revealedCandidate.value;
    const c = updateProgress({ ...setupCharacter.value }, draft.value);
    if (adding) {
      active.value.characters.push(c);
      active.value.nextRevealIndex++;
    } else {
      const i = active.value.characters.findIndex(
        (x) => x.id === setupCharacter.value?.id,
      );
      active.value.characters[i] = c;
    }
    active.value.revision++;
    if (persist(before)) {
      setupCharacter.value = null;
      if (adding) {
        selectedCharacterId.value = c.id;
        addingCandidate.value = false;
        revealedCandidate.value = null;
      }
    }
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
function updateGuidance(c: Character) {
  if (!active.value) return;
  const before = snapshot();
  const index = active.value.characters.findIndex((x) => x.id === c.id);
  if (index < 0) return;
  active.value.characters[index] = c;
  active.value.revision++;
  persist(before);
}
function dismiss(c: Character) {
  const before = snapshot();
  c.pending = undefined;
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
    <p v-if="saveError" class="error notice-banner" role="alert">{{ saveError }}</p>
    <h1 class="sr-only">Expedition 33 leveling guide</h1>
    <nav v-if="active" class="bar" aria-label="Current playthrough">
      <div class="bar-leading">
        <strong>{{ active.name }}</strong>
      </div>
      <div class="bar-actions">
        <button class="link icon-button edit-button" aria-label="Playthrough menu" title="Edit playthrough" @click="managementOpen=true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.75-.75 3.75L7 19.75 18.4 8.35l-3.75-3.75L3.25 16Z" /><path d="m13.5 6.25 3.75 3.75M15.5 3.5 20.5 8.5" /></svg>
        </button>
      </div>
    </nav>
    <p v-if="notice" class="notice-banner save-notice" aria-live="polite">{{ notice }}</p>
    <SetupPanel
      v-if="!state || (active && active.characters.length === 0 && freshSetup)"
      v-model:name="setupName"
      :selected="selected"
      :disabled="unreadableSave || !!saveError"
      @update:selected="selected = $event"
      @start="start"
    /><section v-else-if="active && active.characters.length === 0" class="setup-empty">
      <h2>Start this playthrough again</h2>
      <p>This playthrough has been reset. Begin fresh setup when you are ready.</p>
      <button class="primary" @click="beginFreshSetup">Begin fresh setup</button>
    </section><template v-else-if="active && active.characters.length > 0"
      >
      <nav class="character-tabs" aria-label="Tracked characters">
        <button
          v-for="c in trackedCharacters"
          :key="c.id"
          type="button"
          class="character-tab"
          :class="{ 'is-active': selectedCharacter?.id === c.id }"
          :aria-current="selectedCharacter?.id === c.id ? 'page' : undefined"
          :aria-label="`Show ${c.name}`"
          @click="selectCharacter(c.id)"
        >
          <span class="avatar" aria-hidden="true">
            <img
              v-if="CHARACTER_PORTRAITS[c.id] && !portraitFailed[c.id]"
              class="avatar-image"
              :src="CHARACTER_PORTRAITS[c.id]"
              alt=""
              @error="portraitFallback(c.id)"
            />
            <span class="avatar-fallback">{{ c.name.slice(0, 2).toUpperCase() }}</span>
          </span>
        </button>
        <button type="button" class="character-tab character-tab-add" aria-label="Add a character" @click="openReveal">
          <span class="avatar avatar-add" aria-hidden="true">＋</span>
        </button>
      </nav>
      <section class="party">
        <div v-if="selectedCharacter" class="character-lane">
          <CharacterCard
            :character="selectedCharacter"
            @update="beginSetup"
            @advise="advise"
            @confirm="confirm"
            @dismiss="dismiss"
            @remove="manageRemove"
          />
          <SkillPanel :character="selectedCharacter" @update="updateGuidance" />
        </div>
      </section>
    </template
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
      <form novalidate @submit.prevent="submitProgress">
        <NumberStepper v-model="draft.level" label="Current level" :min="1" :max="99" />
        <NumberStepper v-model="draft.points" label="Available attribute points" />
        <div class="edit-grid">
          <NumberStepper
            v-for="a in ATTRIBUTES"
            :key="a"
            v-model="draft.invested[a]"
            :label="attributeLabels[a]"
            :max="99"
          />
        </div>
        <div class="actions">
          <button type="button" @click="cancelSetup">Cancel</button
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
:root { color-scheme: light dark; --ink:#f5f2ec; --ink-raised:#fffdf8; --ink-soft:#ebe6dc; --paper:#252a26; --paper-ink:#252a26; --setup-surface:#ebe5da; --setup-muted:#625e56; --line:#c7c1b6; --line-light:#d9d3c8; --muted:#59615b; --rust:#a84c2f; --rust-dark:#873a25; --rust-hover:#bd6040; --moss:#46664f; --danger:#9d3e2f; --accent-ink:#fff9ef; --display:var(--expedition-display); --body:var(--expedition-body); }
:root[data-theme='light'] { color-scheme:light; }
:root[data-theme='dark'] { color-scheme:dark; --ink:#151716; --ink-raised:#1d211f; --ink-soft:#252a27; --paper:#f0eadf; --paper-ink:#f0eadf; --setup-surface:#202521; --setup-muted:#b7b3a8; --line:#46504a; --line-light:#536057; --muted:#b7b3a8; --rust:#c46b45; --rust-dark:#8f422c; --rust-hover:#d8835b; --moss:#8da17d; --danger:#efaa99; --accent-ink:#fff9ef; }
@media (prefers-color-scheme:dark) { :root:not([data-theme='light']) { --ink:#151716; --ink-raised:#1d211f; --ink-soft:#252a27; --paper:#f0eadf; --paper-ink:#f0eadf; --setup-surface:#202521; --setup-muted:#b7b3a8; --line:#46504a; --line-light:#536057; --muted:#b7b3a8; --rust:#c46b45; --rust-dark:#8f422c; --rust-hover:#d8835b; --moss:#8da17d; --danger:#efaa99; --accent-ink:#fff9ef; } }
*,*::before { box-sizing:border-box; }
html,body { min-width:320px; margin:0; background:var(--ink); color:var(--paper); }
body { font-family:var(--body); }
button,input,select { font:inherit; }
button { cursor:pointer; }
button:focus-visible,input:focus-visible,select:focus-visible { outline:2px solid var(--moss); outline-offset:3px; }
button:disabled { cursor:not-allowed; opacity:.5; }
.shell { width:min(100%,1360px); min-height:100svh; margin:auto; padding:clamp(14px,2vw,28px) clamp(18px,6vw,90px) 84px; background:var(--ink); }
.shell h1,.shell h2,.shell h3,.shell p { margin-top:0; }
.shell h1 { margin-bottom:18px; font-family:var(--display); font-size:clamp(3rem,7vw,6.8rem); font-weight:400; letter-spacing:-.055em; line-height:.88; }
.shell h1 em { color:var(--rust); font-style:italic; }
.shell h2 { font-family:var(--display); font-size:clamp(1.65rem,3vw,2.6rem); font-weight:400; letter-spacing:-.035em; line-height:1; }
.shell h3 { font-family:var(--display); font-size:1.35rem; font-weight:400; letter-spacing:-.02em; line-height:1.1; }
.eyebrow { font-weight:700; text-transform:uppercase; letter-spacing:.12em; }
.eyebrow { margin:0; color:var(--paper); font-size:.7rem; }
.notice-banner { margin:0 0 22px; padding:12px 14px; border:1px solid var(--rust); color:var(--danger); font-size:.85rem; }
.save-notice { margin:12px 0 0; border-color:var(--line); color:var(--moss); }
.error { color:var(--danger); }
.bar { display:flex; align-items:center; justify-content:space-between; gap:24px; margin-top:0; padding:10px 0 18px; border-bottom:1px solid var(--line); }
.bar-leading { min-width:0; }
.bar strong { overflow:hidden; color:var(--paper); font-family:var(--display); font-size:1.2rem; font-weight:400; text-overflow:ellipsis; white-space:nowrap; }
.bar-actions { display:flex; align-items:center; gap:22px; }
.link { padding:4px 0; border:0; border-bottom:1px solid var(--rust); background:transparent; color:var(--paper); font-size:.8rem; }
.link:hover { color:var(--rust); }
.icon-button { display:inline-grid; place-items:center; }
.edit-button { width:34px; min-height:34px; padding:5px; border:0; border-bottom:1px solid var(--rust); }
.edit-button svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; stroke-width:1.7; }
.setup-panel { display:grid; grid-template-columns:minmax(180px,.75fr) minmax(320px,1.25fr); gap:clamp(26px,6vw,88px); margin-top:38px; padding:clamp(24px,4vw,48px); background:var(--setup-surface); color:var(--paper-ink); }
.setup-intro h2 { max-width:240px; }
.setup-intro>p { max-width:260px; color:var(--setup-muted); font-size:.92rem; line-height:1.55; }
.setup-form { min-width:0; }
.setup-panel label { display:grid; gap:8px; margin:0 0 22px; font-size:.82rem; }
.setup-panel>.setup-form>label:first-child { font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.setup-panel input:not([type='checkbox']) { width:100%; padding:12px 0; border:0; border-bottom:1px solid var(--line); border-radius:0; background:transparent; color:var(--paper-ink); font-family:var(--body); font-size:1.4rem; outline:none; }
.setup-panel input:not([type='checkbox']):focus { border-color:var(--rust-dark); }
.character-picker { margin:26px 0; padding:0; border:0; }
.character-picker legend { width:100%; margin-bottom:10px; padding:0 0 10px; border-bottom:1px solid var(--line-light); font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.character-option { position:relative; display:flex!important; align-items:center; gap:12px; min-height:58px; margin:0!important; padding:10px 0; border-bottom:1px solid var(--line-light); cursor:pointer; }
.character-option input[type='checkbox'],.midway-check input[type='checkbox'] { position:absolute; width:1px; height:1px; opacity:0; }
.option-mark { display:grid; place-items:center; width:18px; height:18px; border:1px solid var(--muted); color:transparent; font-size:.75rem; }
.character-option:has(input:checked) .option-mark { border-color:var(--rust-dark); background:var(--rust); color:var(--accent-ink); }
.option-copy { display:grid; gap:3px; }
.option-copy strong { font-family:var(--display); font-size:1.08rem; font-weight:400; }
.option-copy small { color:var(--setup-muted); font-size:.7rem; }
.midway-check { position:relative; display:flex!important; align-items:center; gap:10px; margin-top:24px!important; color:var(--setup-muted); cursor:pointer; }
.midway-check .option-mark { width:15px; height:15px; }
.midway-check:has(input:checked) .option-mark { border-color:var(--moss); background:var(--moss); }
.primary,button { min-height:42px; padding:10px 14px; border:1px solid var(--line); border-radius:0; background:transparent; color:var(--paper); font-size:.78rem; }
.primary { border-color:var(--rust); background:var(--rust); color:var(--accent-ink); }
.primary:hover { background:var(--rust-hover); }
.setup-panel .primary { margin-top:10px; border-color:var(--rust-dark); background:var(--rust-dark); color:var(--accent-ink); }
.setup-panel .primary:hover { background:var(--rust); }
.setup-empty { margin-top:38px; padding:32px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.setup-empty p { color:var(--muted); }
.character-tabs { display:flex; align-items:stretch; gap:10px; margin-top:30px; overflow-x:auto; border-bottom:1px solid var(--line); }
.character-tab { display:flex; align-items:center; justify-content:center; min-width:72px; min-height:74px; padding:8px 10px 12px; border:0; border-bottom:2px solid transparent; background:transparent; color:var(--muted); text-align:left; }
.character-tab:hover { color:var(--paper); }
.character-tab.is-active { border-bottom-color:var(--rust); color:var(--paper); }
.avatar { position:relative; display:grid; place-items:center; width:50px; height:50px; flex:0 0 50px; overflow:hidden; border:1px solid var(--line); border-radius:50%; background:var(--ink-soft); color:var(--paper); font-family:var(--body); font-size:1.05rem; }
.avatar-image { position:absolute; inset:0; z-index:1; width:100%; height:100%; object-fit:cover; object-position:center 18%; }
.avatar-fallback { position:relative; z-index:0; }
.character-tab.is-active .avatar { border-color:var(--rust); background:var(--rust); color:var(--accent-ink); }
.character-tab-add .avatar { border-style:dashed; background:transparent; color:var(--rust); }
.party { display:block; margin-top:34px; }
.character-lane { min-width:0; }
.card { padding:26px; border:1px solid var(--line); border-radius:0; background:var(--ink-raised); }
.character { border-top:3px solid var(--rust); }
.character-layout { display:grid; gap:28px; }
.character-primary,.character-secondary { min-width:0; }
.character-secondary { display:flex; flex-direction:column; }
.character-secondary .card-head-actions { justify-content:space-between; }
.card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.card-head-actions { display:flex; align-items:flex-start; gap:12px; }
.character-menu { position:relative; }
.more-button { width:32px; min-height:32px; padding:0; border-color:transparent; color:var(--muted); font-size:1.35rem; line-height:1; }
.more-button:hover { border-color:var(--line); color:var(--paper); }
.character-popover { position:absolute; top:calc(100% + 8px); right:0; z-index:1; min-width:146px; padding:5px; border:1px solid var(--line); background:var(--ink-raised); box-shadow:0 8px 18px rgba(15,18,16,.12); }
.character-popover button { width:100%; min-height:34px; padding:8px 10px; border:0; text-align:left; }
.card-head h2 { margin-bottom:0; }
.level { display:grid; gap:2px; justify-items:end; color:var(--rust); font-size:.64rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
.level::after { content:'CURRENT'; color:var(--muted); font-size:.5rem; }
.stats { display:grid; gap:0; width:min(100%,360px); margin:28px 0 20px; }
.stats div { display:grid; grid-template-columns:1fr auto; align-items:center; gap:10px; min-width:0; padding:9px 0; }
.stats span { color:var(--muted); font-size:.62rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; }
.stats b { color:var(--paper); font-family:var(--body); font-size:1.15rem; font-weight:400; }
.points { margin:0; color:var(--moss); font-size:.65rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
.actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:22px; }
.actions button { font-size:.72rem; }
.character-secondary .actions { display:grid; grid-template-columns:1fr; margin-top:32px; }
.character-secondary .actions button { width:100%; }
.quiet { border-color:transparent; color:var(--muted); }
.quiet:hover { color:var(--danger); }
.advice { margin:22px 0 0; padding:13px 14px; border-left:2px solid var(--rust); background:var(--ink-soft); color:var(--paper); font-size:.82rem; line-height:1.5; }
.advice strong { color:var(--rust); font-size:.63rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.advice small { color:var(--muted); }
.guidance-tools { margin-top:12px; background:transparent; }
.guidance-head { display:flex; align-items:baseline; justify-content:space-between; gap:14px; padding-bottom:12px; border-bottom:1px solid var(--line); }
.guidance-head .eyebrow { margin-bottom:8px; color:var(--muted); }
.guidance-head h3 { margin-bottom:0; }
.guidance-actions { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0; }
.guidance-actions button { min-height:34px; padding:7px 10px; color:var(--muted); font-size:.68rem; }
.guidance-actions button:hover { border-color:var(--rust); color:var(--paper); }
.guidance-tools p { margin:12px 0; overflow-wrap:anywhere; color:var(--muted); font-size:.78rem; line-height:1.5; }
.guidance-tools p button { margin-left:8px; min-height:31px; padding:6px 9px; }
.sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
.modal-backdrop { position:fixed; inset:var(--sl-nav-height,3.5rem) 0 0; z-index:1000; display:grid; place-items:start center; padding:16px; overflow:auto; overscroll-behavior:contain; background:rgba(10,12,11,.84); }
.modal { width:min(100%,560px); max-height:calc(100dvh - var(--sl-nav-height,3.5rem) - 32px); overflow:auto; padding:clamp(22px,4vw,38px); border:1px solid var(--rust); border-radius:0; background:var(--ink-raised); color:var(--paper); }
.modal h2 { padding-bottom:16px; border-bottom:1px solid var(--line); }
.modal p { color:var(--muted); font-size:.88rem; line-height:1.55; }
.modal label { display:grid; gap:8px; margin:16px 0; color:var(--paper); font-size:.82rem; }
.stepper-field { min-width:0; }
.stepper-label { display:block; }
.stepper-control { display:grid; grid-template-columns:48px minmax(0,1fr) 48px; min-height:50px; border:1px solid var(--line); background:var(--ink); }
.stepper-control button { display:grid; place-items:center; min-height:48px; padding:0; border:0; border-radius:0; background:transparent; color:var(--paper); font-size:1.35rem; line-height:1; }
.stepper-control button:first-child { border-inline-end:1px solid var(--line); }
.stepper-control button:last-child { border-inline-start:1px solid var(--line); }
.stepper-control button:hover:not(:disabled) { background:var(--ink-soft); color:var(--rust); }
.stepper-control button:disabled { color:var(--muted); opacity:.45; }
.stepper-control input { min-width:0; width:100%; min-height:48px; padding:10px 8px; border:0!important; border-radius:0; background:transparent!important; color:var(--paper)!important; font-family:var(--body); font-size:1rem; font-variant-numeric:tabular-nums; outline:none; text-align:center; }
.setup-panel .stepper-control input { padding:10px 8px; font-size:1rem; }
.stepper-control input:focus { box-shadow:inset 0 0 0 2px var(--moss); }
.stepper-control input::-webkit-inner-spin-button,.stepper-control input::-webkit-outer-spin-button { margin:0; appearance:none; }
.stepper-control input[type='number'] { -moz-appearance:textfield; }
.edit-grid { display:grid; gap:0 18px; }
.modal input,.modal select { width:100%; padding:10px; border:1px solid var(--line); border-radius:0; background:var(--ink); color:var(--paper); }
.modal fieldset { margin:22px 0; padding:14px; border:1px solid var(--line); }
.modal legend { padding:0 6px; color:var(--moss); font-size:.63rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.modal .actions { border-top:1px solid var(--line); padding-top:18px; }
.danger { border-color:var(--danger); color:var(--danger); }
@media (min-width:760px) { .character-layout { grid-template-columns:minmax(0,1.2fr) minmax(220px,.8fr); gap:clamp(28px,5vw,72px); } .character-secondary { padding-left:clamp(24px,4vw,48px); border-left:1px solid var(--line); } }
@media (max-width:759px) { .character-secondary { margin-top:28px; padding-top:22px; border-top:1px solid var(--line); } }
@media (max-width:680px) { .shell { padding:20px 16px 58px; } .theme-switch { width:38px; min-height:38px; } .bar { gap:14px; } .bar-actions { margin-top:0; } .character-tabs { margin-top:24px; } .setup-panel { display:block; margin-top:28px; padding:24px 18px; } .party { margin-top:28px; } .card { padding:20px 18px; } .guidance-actions { display:grid; grid-template-columns:1fr 1fr; } .guidance-actions button { width:100%; } }
@media (max-width:420px) { .shell h1 { font-size:3.5rem; } .bar { gap:10px; } .bar strong { font-size:1.05rem; } .bar-actions { display:flex; gap:10px; } .guidance-actions { grid-template-columns:1fr; } }
</style>
