<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { Check, Eye, Plus } from '@lucide/vue';
import { INITIAL_CHARACTERS, LATER_CHARACTERS, attributeLabels } from '../domain/data';
import { ATTRIBUTES, emptyAttributes } from '../domain/types';
import type { Character, Playthrough, SaveData } from '../domain/types';
import { applyRecommendation, recommend, updateProgress } from '../domain/rules';
import { id, load, save } from '../domain/storage';
import CharacterCard from './CharacterCard.vue';
import FocusDialog from './FocusDialog.vue';
import SetupPanel from './SetupPanel.vue';

const loaded = typeof localStorage !== 'undefined' ? load() : { kind: 'missing' as const };
const state = ref<SaveData | null>(loaded.kind === 'loaded' ? loaded.data : null);
const unreadableSave = loaded.kind === 'invalid';
const setupName = ref('My Expedition');
const selected = ref<string[]>(['gustave', 'lune']);
const saveError = ref(loaded.kind === 'invalid' ? loaded.error : '');
const notice = ref('');
const revealStage = ref<'warning' | 'identity' | 'terminal' | null>(null);
const setupCharacter = ref<Character | null>(null);
const formError = ref('');
const addingCandidate = ref(false);
const revealedCandidate = ref<(typeof LATER_CHARACTERS)[number] | null>(null);
const draft = ref({ level: 1, points: 0, invested: emptyAttributes() });
const expeditionManagerOpen = ref(false);
const renamingId = ref<string | null>(null);
const renameDraft = ref('');
const newExpeditionName = ref('');
const managerError = ref('');
const deleteTarget = ref<Playthrough | null>(null);
const setupBlocked = computed(() => unreadableSave || Boolean(saveError.value));

const active = computed(() => state.value?.playthroughs.find((p) => p.id === state.value?.activeId) ?? null);
const snapshot = () => (state.value ? (JSON.parse(JSON.stringify(state.value)) as SaveData) : null);

function persist(before: SaveData | null) {
  if (!state.value) return true;
  const result = save(state.value);
  if (!result.ok) {
    state.value = before;
    saveError.value = result.error ?? 'Your browser could not save this change.';
    return false;
  }
  saveError.value = '';
  return true;
}

function makePlaythrough(name: string): Playthrough {
  return {
    id: id('playthrough'),
    name: name.trim() || 'My Expedition',
    characters: Object.entries(INITIAL_CHARACTERS).map(([key, character]) => ({
      id: key,
      name: character.name,
      level: 1,
      invested: { ...character.defaults },
      points: 3,
      tracked: true,
      revealed: true,
    })),
    nextRevealIndex: 0,
    revision: 0,
  };
}

function start(actual: Record<string, { level: number; points: number; invested: typeof draft.value.invested } | null> = {}) {
  if (unreadableSave || !selected.value.length) return;
  const before = snapshot();
  try {
    const characters = selected.value.map((key) => {
      const d = INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS];
      const input = actual[key];
      if (input) {
        return updateProgress(
          { id: key, name: d.name, level: 1, invested: { ...d.defaults }, points: 3, tracked: true, revealed: true },
          input,
        );
      }
      return { id: key, name: d.name, level: 1, invested: { ...d.defaults }, points: 3, tracked: true, revealed: true };
    });
    const p: Playthrough = { ...makePlaythrough(setupName.value), characters };
    state.value = { version: 1, playthroughs: [p], activeId: p.id };
    persist(before);
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Enter valid in-game progress.';
  }
}

function openExpeditionManager() {
  managerError.value = '';
  renamingId.value = null;
  newExpeditionName.value = '';
  expeditionManagerOpen.value = true;
}

function selectExpedition(playthroughId: string) {
  if (!state.value || state.value.activeId === playthroughId) return;
  const before = snapshot();
  state.value.activeId = playthroughId;
  if (persist(before)) expeditionManagerOpen.value = false;
}

function beginRename(playthrough: Playthrough) {
  managerError.value = '';
  renamingId.value = playthrough.id;
  renameDraft.value = playthrough.name;
}

function cancelRename() {
  renamingId.value = null;
  renameDraft.value = '';
}

function saveRename(playthrough: Playthrough) {
  const name = renameDraft.value.trim();
  if (!name) {
    managerError.value = 'Enter a name for this expedition.';
    return;
  }
  const before = snapshot();
  playthrough.name = name;
  if (persist(before)) cancelRename();
}

function createExpedition() {
  if (!state.value) return;
  const name = newExpeditionName.value.trim() || `Expedition ${state.value.playthroughs.length + 1}`;
  const before = snapshot();
  const playthrough = makePlaythrough(name);
  state.value.playthroughs.push(playthrough);
  state.value.activeId = playthrough.id;
  if (persist(before)) {
    newExpeditionName.value = '';
    expeditionManagerOpen.value = false;
  }
}

function requestDelete(playthrough: Playthrough) {
  managerError.value = '';
  if (state.value?.playthroughs.length === 1) {
    managerError.value = 'Keep at least one expedition so the guide has a current record.';
    return;
  }
  deleteTarget.value = playthrough;
}

function deleteExpedition() {
  if (!state.value || !deleteTarget.value || state.value.playthroughs.length === 1) return;
  const before = snapshot();
  const targetIndex = state.value.playthroughs.findIndex((item) => item.id === deleteTarget.value?.id);
  if (targetIndex < 0) return;
  const wasActive = state.value.activeId === deleteTarget.value.id;
  state.value.playthroughs.splice(targetIndex, 1);
  if (wasActive) state.value.activeId = state.value.playthroughs[Math.max(0, targetIndex - 1)].id;
  if (persist(before)) deleteTarget.value = null;
}

function beginSetup(character: Character) {
  formError.value = '';
  setupCharacter.value = character;
  draft.value = { level: character.level, points: character.points, invested: { ...character.invested } };
}

function cancelSetup() {
  setupCharacter.value = null;
  formError.value = '';
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
    const character = updateProgress({ ...setupCharacter.value }, draft.value);
    if (adding) {
      active.value.characters.push(character);
      active.value.nextRevealIndex++;
    } else {
      const index = active.value.characters.findIndex((item) => item.id === setupCharacter.value?.id);
      active.value.characters[index] = character;
    }
    active.value.revision++;
    if (persist(before)) {
      setupCharacter.value = null;
      if (adding) {
        addingCandidate.value = false;
        revealedCandidate.value = null;
      }
    }
    formError.value = '';
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Enter valid in-game progress.';
  }
}

function advise(character: Character) {
  const before = snapshot();
  character.pending = recommend(character);
  persist(before);
}

function dismiss(character: Character) {
  const before = snapshot();
  character.pending = undefined;
  persist(before);
}

function confirm(character: Character) {
  if (!character.pending || !active.value) return;
  const before = snapshot();
  const changed = applyRecommendation(character, character.pending);
  if (changed === character) {
    notice.value = 'That advice is stale; update progress before applying it.';
    return;
  }
  Object.assign(character, changed);
  active.value.revision++;
  if (persist(before)) notice.value = 'Applied recommendation recorded once.';
}

function openReveal() {
  revealStage.value = 'warning';
}

function consentReveal() {
  if (!active.value) return;
  const next = active.value.nextRevealIndex;
  revealStage.value = next < LATER_CHARACTERS.length ? 'identity' : 'terminal';
  if (next < LATER_CHARACTERS.length) revealedCandidate.value = LATER_CHARACTERS[next];
}

function addLater() {
  if (!revealedCandidate.value) return;
  const character = revealedCandidate.value;
  addingCandidate.value = true;
  revealStage.value = null;
  beginSetup({ id: character.id, name: character.name, level: 1, invested: { ...character.defaults }, points: 0, tracked: true, revealed: true });
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
  <main class="guide-shell">
    <div class="field-lines" aria-hidden="true"></div>
    <div class="guide-frame">
      <div class="guide-content">
        <div v-if="saveError" class="save-alert">
          <Message severity="error" :closable="false"><span>{{ saveError }}</span></Message>
        </div>

        <SetupPanel
          v-if="!state"
          v-model:name="setupName"
          :selected="selected"
          :disabled="setupBlocked"
          :blocked="setupBlocked"
          @update:selected="selected = $event"
          @start="start"
        />

        <template v-else-if="active">
          <section class="run-header" aria-labelledby="run-title">
            <div>
              <span class="section-kicker">Current expedition</span>
              <div class="run-title-line">
                <h2 id="run-title">{{ active.name }}</h2>
                <Button text severity="secondary" class="manage-expeditions" aria-label="View all expeditions" @click="openExpeditionManager">View all</Button>
              </div>
            </div>
          </section>

          <Message v-if="notice" severity="success" :closable="false" class="action-notice" aria-live="polite">{{ notice }}</Message>

          <section class="party-heading" aria-labelledby="party-title">
            <span id="party-title" class="section-kicker">Recorded progress</span>
          </section>

          <section class="party" aria-label="Tracked characters">
            <CharacterCard
              v-for="character in active.characters.filter((item) => item.tracked)"
              :key="character.id"
              :character="character"
              @update="beginSetup"
              @advise="advise"
              @confirm="confirm"
              @dismiss="dismiss"
            />
          </section>

          <Button severity="secondary" outlined class="add-character" @click="openReveal">
            <Plus :size="17" :strokeWidth="1.8" aria-hidden="true" />
            <span>Add a character</span>
          </Button>
        </template>

        <FocusDialog v-if="expeditionManagerOpen" title="Manage expeditions" @close="expeditionManagerOpen = false">
          <div class="manager-intro">
            <span class="section-kicker">Current records</span>
            <p>Switch between playthroughs, rename a record, or start a fresh one.</p>
          </div>
          <Message v-if="managerError" severity="error" :closable="false" class="dialog-error">{{ managerError }}</Message>
          <div class="expedition-list" aria-label="Saved expeditions">
            <div v-for="playthrough in state?.playthroughs" :key="playthrough.id" class="expedition-row" :class="{ 'expedition-row--active': playthrough.id === state?.activeId }">
              <template v-if="renamingId === playthrough.id">
                <label class="sr-only" :for="`rename-${playthrough.id}`">Expedition name</label>
                <InputText :id="`rename-${playthrough.id}`" v-model="renameDraft" class="expedition-row__input" @keyup.enter="saveRename(playthrough)" />
                <div class="expedition-row__actions">
                  <Button label="Save" size="small" @click="saveRename(playthrough)" />
                  <Button label="Cancel" size="small" severity="secondary" text @click="cancelRename" />
                </div>
              </template>
              <template v-else>
                <button type="button" class="expedition-row__select" :aria-current="playthrough.id === state?.activeId ? 'true' : undefined" @click="selectExpedition(playthrough.id)">
                  <span>{{ playthrough.name }}</span>
                  <small v-if="playthrough.id === state?.activeId">Current</small>
                </button>
                <div class="expedition-row__actions">
                  <Button label="Rename" size="small" severity="secondary" text @click="beginRename(playthrough)" />
                  <Button label="Delete" size="small" severity="danger" text :disabled="state?.playthroughs.length === 1" @click="requestDelete(playthrough)" />
                </div>
              </template>
            </div>
          </div>
          <div class="manager-new">
            <label for="new-expedition" class="field">
              <span>New expedition</span>
              <InputText id="new-expedition" v-model="newExpeditionName" placeholder="Optional name" @keyup.enter="createExpedition" />
            </label>
            <Button label="Add expedition" severity="secondary" outlined @click="createExpedition" />
          </div>
        </FocusDialog>

        <FocusDialog v-if="deleteTarget" title="Delete expedition?" @close="deleteTarget = null">
          <div class="manager-intro">
            <p>This removes <strong>{{ deleteTarget.name }}</strong> and its recorded progress from this browser.</p>
          </div>
          <div class="dialog-actions">
            <Button label="Cancel" severity="secondary" text @click="deleteTarget = null" />
            <Button label="Delete expedition" severity="danger" @click="deleteExpedition" />
          </div>
        </FocusDialog>

        <FocusDialog v-if="setupCharacter" :title="`Update ${setupCharacter.name}`" @close="cancelSetup">
          <div class="dialog-intro">
            <span class="section-kicker">Reconcile your save</span>
            <p>Enter what is true in-game. This replaces the recorded inputs and clears old advice.</p>
          </div>
          <Message v-if="formError" severity="error" :closable="false" class="dialog-error">{{ formError }}</Message>
          <form novalidate class="dialog-form" @submit.prevent="submitProgress">
            <label class="field">
              <span>Current level</span>
              <InputNumber id="current-level" v-model="draft.level" inputId="current-level-input" :max="99" :useGrouping="false" autofocus />
            </label>
            <label class="field">
              <span>Available attribute points</span>
              <InputNumber id="available-points" v-model="draft.points" inputId="available-points-input" :min="0" :useGrouping="false" />
            </label>
            <div class="attribute-grid">
              <label v-for="attribute in ATTRIBUTES" :key="attribute" class="field">
                <span>{{ attributeLabels[attribute] }}</span>
                <InputNumber v-model="draft.invested[attribute]" :inputId="`edit-${attribute}`" :min="0" :max="99" :useGrouping="false" />
              </label>
            </div>
            <div class="dialog-actions">
              <Button type="button" label="Cancel" severity="secondary" text @click="cancelSetup" />
              <Button type="submit"><Check :size="17" :strokeWidth="1.8" aria-hidden="true" /><span>Save progress</span></Button>
            </div>
          </form>
        </FocusDialog>

        <FocusDialog v-if="revealStage" title="Continue your expedition?" @close="cancelReveal">
          <div class="dialog-intro">
            <span class="section-kicker">Spoiler boundary</span>
            <p v-if="revealStage === 'warning'">Only continue if someone new has joined your party. The next identity stays hidden until you choose to reveal it.</p>
            <p v-else-if="revealStage === 'identity'">The next character is <strong>{{ revealedCandidate?.name }}</strong>.</p>
            <p v-else>No additional character is available right now.</p>
          </div>
          <div class="dialog-actions">
            <Button label="Cancel" severity="secondary" text @click="cancelReveal" />
            <Button v-if="revealStage === 'warning'" @click="consentReveal"><Eye :size="17" :strokeWidth="1.8" aria-hidden="true" /><span>Reveal character</span></Button>
            <Button v-else-if="revealStage === 'identity'" @click="addLater"><Plus :size="17" :strokeWidth="1.8" aria-hidden="true" /><span>Add to playthrough</span></Button>
          </div>
        </FocusDialog>
      </div>
    </div>
  </main>
</template>

<style>
:root {
  --ink: #11181e;
  --ink-soft: #1d2931;
  --paper: #f3ecdf;
  --paper-deep: #e7dece;
  --paper-muted: #c8c0b3;
  --copper: #c66d43;
  --copper-deep: #934c2d;
  --blue: #7e9eae;
  --line: rgba(243, 236, 223, 0.16);
  --line-dark: rgba(17, 24, 30, 0.16);
  --display: Georgia, 'Times New Roman', serif;
  --body: 'Avenir Next', Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; }
html { background: var(--ink); }
body { margin: 0; background: var(--ink); color: var(--paper); font-family: var(--body); }
button, input { font: inherit; }

.guide-shell { position: relative; min-height: 100vh; overflow: hidden; background: var(--ink); }
.field-lines { position: absolute; inset: 0; pointer-events: none; opacity: 0.22; background: repeating-linear-gradient(90deg, transparent 0, transparent calc(10vw - 1px), rgba(243,236,223,.08) 10vw, transparent calc(10vw + 1px)); }
.guide-frame { position: relative; width: min(100% - 56px, 980px); margin: 0 auto; padding: 36px 0 72px; }
.guide-content { min-width: 0; }
.section-kicker { color: var(--paper-muted); font-size: .68rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
.save-alert { margin: 24px 0; }
.save-alert .p-message { border-radius: 2px; }
.run-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; width: 100%; padding: 30px 0 24px; border-bottom: 1px solid var(--line); }
.run-header > div { width: 100%; }
.run-header h2 { margin: 7px 0 0; color: var(--paper); font-family: var(--display); font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 400; letter-spacing: -.04em; }
.run-title-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
.manage-expeditions.p-button { margin-top: 10px; padding: 0; border-radius: 2px; color: var(--copper); font-size: .82rem; font-weight: 700; letter-spacing: .04em; }
.manage-expeditions.p-button:hover { background: rgba(198,109,67,.12); color: var(--copper); }
.p-button > svg { flex: 0 0 auto; }
.action-notice { margin: 18px 0 0; border-radius: 2px; }
.party-heading { display: flex; align-items: center; justify-content: space-between; gap: 32px; margin: 34px 0 18px; }
.party { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.character-card.p-card { height: 100%; background: var(--paper); border: 0; border-radius: 2px; color: var(--ink); box-shadow: 8px 10px 0 rgba(0,0,0,.12); }
.character-card .p-card-body, .character-card .p-card-content { height: 100%; padding: 0; }
.character-card__inner { display: flex; flex-direction: column; min-height: 372px; padding: 25px; }
.character-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 22px; border-bottom: 1px solid var(--line-dark); }
.character-card__index { margin-bottom: 8px; color: var(--copper-deep); font-family: var(--display); font-size: .86rem; font-style: italic; }
.character-card h2 { margin: 0; color: var(--ink); font-family: var(--display); font-size: 2.35rem; font-weight: 400; letter-spacing: -.06em; }
.level-tag.p-tag { flex: 0 0 auto; background: var(--ink) !important; color: var(--paper) !important; border-radius: 2px; font-size: .64rem; letter-spacing: .13em; }
.stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; padding: 22px 0; }
.stats__item { min-width: 0; }
.stats__label { display: block; overflow: hidden; color: #7b746a; font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.stats__value { display: block; margin-top: 5px; color: var(--ink); font-family: var(--display); font-size: 1.55rem; line-height: 1; }
.recommendation.p-message { margin: 0 0 20px; border-left: 3px solid var(--copper) !important; border-radius: 0; background: #efe1c9 !important; color: var(--ink) !important; }
.recommendation .p-message-text { color: var(--ink) !important; }
.recommendation strong { display: block; margin-bottom: 7px; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; }
.recommendation__spend { color: var(--copper-deep); font-weight: 700; }
.recommendation small { display: block; margin-top: 8px; line-height: 1.5; }
.character-card__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
.character-card__actions .p-button { min-height: 38px; border-radius: 2px; font-size: .79rem; }
.character-card__actions .p-button:not(.p-button-outlined):not(.p-button-text) { background: var(--copper); border-color: var(--copper); color: #21130c; }
.character-card__actions .p-button.p-button-outlined { border-color: rgba(17,24,30,.28); color: var(--ink); }
.character-card__actions .p-button.p-button-text { color: #766e63; }
.points-line { display: flex; align-items: center; gap: 8px; margin: 21px 0 0; color: #756e65; font-size: .77rem; }
.points-line i { color: var(--copper); font-size: .75rem; }
.add-character.p-button { width: 100%; justify-content: center; margin-top: 20px; min-height: 56px; border: 1px dashed rgba(243,236,223,.4); border-radius: 2px; color: var(--paper); letter-spacing: .02em; }
.add-character.p-button:hover { background: rgba(243,236,223,.06); border-color: var(--copper); color: var(--paper); }
.manager-intro { margin-bottom: 20px; }
.manager-intro p { margin: 10px 0 0; color: #655e56; line-height: 1.5; }
.expedition-list { display: grid; gap: 8px; }
.expedition-row { display: flex; align-items: center; gap: 12px; padding: 11px 0 11px 13px; border-left: 2px solid transparent; border-bottom: 1px solid rgba(17,24,30,.12); }
.expedition-row--active { border-left-color: var(--copper); background: rgba(198,109,67,.06); }
.expedition-row__select { display: flex; flex: 1 1 auto; align-items: baseline; justify-content: space-between; gap: 12px; min-width: 0; padding: 0; border: 0; background: transparent; color: var(--ink); text-align: left; cursor: pointer; }
.expedition-row__select span { overflow: hidden; font-family: var(--display); font-size: 1.22rem; text-overflow: ellipsis; white-space: nowrap; }
.expedition-row__select small { flex: 0 0 auto; color: var(--copper-deep); font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.expedition-row__select:focus-visible { outline: 2px solid var(--copper); outline-offset: 3px; }
.expedition-row__input { flex: 1 1 auto; min-width: 0; }
.expedition-row__actions { display: flex; flex: 0 0 auto; gap: 2px; }
.expedition-row__actions .p-button { border-radius: 2px; }
.manager-new { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 12px; margin-top: 25px; padding-top: 19px; border-top: 1px solid rgba(17,24,30,.16); }
.manager-new .field { margin: 0; }
.manager-new > .p-button { min-height: 41px; border-radius: 2px; }

.dialog-intro { margin-bottom: 22px; }
.dialog-intro p { margin: 12px 0 0; color: #655e56; line-height: 1.55; }
.dialog-form { display: grid; gap: 2px; }
.field { display: grid; gap: 7px; margin: 10px 0; color: #504940; font-size: .78rem; font-weight: 700; letter-spacing: .02em; }
.field .p-inputnumber, .field .p-inputtext { width: 100%; }
.attribute-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 4px; }
.attribute-grid .field { min-width: 0; }
.dialog-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.dialog-actions .p-button { border-radius: 2px; }
.dialog-error { margin: 14px 0; color: #a13f2d; font-size: .84rem; font-weight: 700; line-height: 1.45; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

@media (max-width: 900px) {
  .guide-frame { width: min(100% - 34px, 760px); }
}

@media (max-width: 680px) {
  .guide-frame { width: min(100% - 28px, 560px); padding-top: 20px; }
  .run-header { align-items: flex-start; flex-direction: column; gap: 16px; padding-top: 32px; }
  .party-heading { margin-top: 28px; }
  .party { grid-template-columns: minmax(0, 1fr); }
  .character-card__inner { min-height: 0; padding: 21px; }
  .attribute-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .manager-new { grid-template-columns: 1fr; }
  .manager-new > .p-button { width: 100%; }
  .expedition-row { align-items: flex-start; flex-direction: column; gap: 8px; }
  .expedition-row__select { width: 100%; }
}

@media (max-width: 400px) {
  .guide-frame { width: min(100% - 22px, 560px); }
  .stats { gap: 4px; }
  .stats__label { font-size: .51rem; }
  .stats__value { font-size: 1.35rem; }
  .character-card__actions .p-button { flex: 1 1 100%; }
}
</style>
