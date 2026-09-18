<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { Check, ChevronDown, Eye, Monitor, Moon, Pencil, Plus, Sun, Trash2 } from '@lucide/vue';
import { INITIAL_CHARACTERS, LATER_CHARACTERS, attributeLabels } from '../domain/data';
import { ATTRIBUTES, emptyAttributes } from '../domain/types';
import type { Character, Playthrough, SaveData } from '../domain/types';
import { applyRecommendation, recommend, updateProgress } from '../domain/rules';
import { id, load, save } from '../domain/storage';
import CharacterCard from './CharacterCard.vue';
import FocusDialog from './FocusDialog.vue';
import SetupPanel from './SetupPanel.vue';

type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'expedition-33-guide.theme';
const THEME_MODES: ThemeMode[] = ['auto', 'dark', 'light'];
const THEME_LABELS: Record<ThemeMode, string> = { auto: 'Auto', dark: 'Dark', light: 'Light' };
const THEME_ICONS: Record<ThemeMode, typeof Monitor> = { auto: Monitor, dark: Moon, light: Sun };

function readThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'auto';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' || saved === 'light' || saved === 'auto' ? saved : 'auto';
}

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
const expeditionMenuOpen = ref(false);
const renamingId = ref<string | null>(null);
const renameDraft = ref('');
const newExpeditionName = ref('');
const managerError = ref('');
const deleteTarget = ref<Playthrough | null>(null);
const themeMode = ref<ThemeMode>(readThemeMode());
const setupBlocked = computed(() => unreadableSave || Boolean(saveError.value));

const active = computed(() => state.value?.playthroughs.find((p) => p.id === state.value?.activeId) ?? null);
const themeLabel = computed(() => THEME_LABELS[themeMode.value]);
const nextThemeMode = computed(() => THEME_MODES[(THEME_MODES.indexOf(themeMode.value) + 1) % THEME_MODES.length]);
const nextThemeLabel = computed(() => THEME_LABELS[nextThemeMode.value]);
const themeIcon = computed(() => THEME_ICONS[themeMode.value]);
let themeMediaQuery: MediaQueryList | null = null;
const snapshot = () => (state.value ? (JSON.parse(JSON.stringify(state.value)) as SaveData) : null);

function syncTheme() {
  if (typeof window === 'undefined') return;
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const appliedTheme = themeMode.value === 'auto' ? systemTheme : themeMode.value;
  document.documentElement.dataset.theme = appliedTheme;
  document.documentElement.style.colorScheme = appliedTheme;
}

function cycleTheme() {
  themeMode.value = nextThemeMode.value;
  syncTheme();
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode.value);
  } catch {
    // The theme remains active for this session even when storage is unavailable.
  }
}

function closeExpeditionMenu() {
  expeditionMenuOpen.value = false;
}

function toggleExpeditionMenu() {
  managerError.value = '';
  expeditionMenuOpen.value = !expeditionMenuOpen.value;
}

function handleOutsideExpeditionMenu(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Node) || !expeditionMenuOpen.value) return;
  if (!(target instanceof Element) || !target.closest('.expedition-nav')) closeExpeditionMenu();
}

function handleExpeditionMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && expeditionMenuOpen.value) closeExpeditionMenu();
}

onMounted(() => {
  syncTheme();
  themeMediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
  themeMediaQuery?.addEventListener('change', syncTheme);
  document.addEventListener('pointerdown', handleOutsideExpeditionMenu);
  document.addEventListener('keydown', handleExpeditionMenuKeydown);
});

onUnmounted(() => {
  themeMediaQuery?.removeEventListener('change', syncTheme);
  document.removeEventListener('pointerdown', handleOutsideExpeditionMenu);
  document.removeEventListener('keydown', handleExpeditionMenuKeydown);
});

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

function selectExpedition(playthroughId: string) {
  if (!state.value || state.value.activeId === playthroughId) return;
  const before = snapshot();
  state.value.activeId = playthroughId;
  if (persist(before)) closeExpeditionMenu();
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
    closeExpeditionMenu();
  }
}

function requestDelete(playthrough: Playthrough) {
  managerError.value = '';
  if (state.value?.playthroughs.length === 1) {
    managerError.value = 'Keep at least one expedition so the guide has a current record.';
    return;
  }
  closeExpeditionMenu();
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
      <header class="top-nav" aria-label="Primary navigation">
        <div class="top-nav__identity">
          <div class="top-nav__brand">
            <span class="top-nav__brand-mark">Expedition 33</span>
            <span class="top-nav__brand-detail">Leveling guide</span>
          </div>
          <button
            type="button"
            class="theme-toggle"
            :data-theme-mode="themeMode"
            :aria-label="`Theme: ${themeLabel}. Activate to switch to ${nextThemeLabel}.`"
            :title="`Theme: ${themeLabel} · Switch to ${nextThemeLabel}`"
            @click="cycleTheme"
          >
            <component :is="themeIcon" :size="17" :strokeWidth="1.8" aria-hidden="true" />
            <span class="sr-only">{{ themeLabel }}</span>
          </button>
        </div>

        <div class="top-nav__actions">
          <div class="expedition-nav">
            <button
              type="button"
              class="top-nav__expedition"
              aria-haspopup="true"
              :aria-expanded="expeditionMenuOpen"
              aria-label="View all expeditions"
              @click="toggleExpeditionMenu"
            >
              <span class="top-nav__expedition-copy">
                <span class="top-nav__expedition-kicker">Current expedition</span>
                <strong>{{ active?.name ?? 'Set up an expedition' }}</strong>
              </span>
              <ChevronDown :size="16" :strokeWidth="1.8" aria-hidden="true" />
            </button>

            <div v-if="expeditionMenuOpen" class="expedition-menu" aria-label="Expeditions" @click.stop>
              <div class="expedition-menu__heading">
                <span class="section-kicker">Expeditions</span>
                <span v-if="state" class="expedition-menu__count">{{ state.playthroughs.length }} saved</span>
              </div>
              <Message v-if="managerError" severity="error" :closable="false" class="menu-error">{{ managerError }}</Message>

              <div v-if="state" class="expedition-menu__list">
                <div
                  v-for="playthrough in state.playthroughs"
                  :key="playthrough.id"
                  class="expedition-menu__row"
                  :class="{ 'expedition-menu__row--active': playthrough.id === state.activeId }"
                >
                  <template v-if="renamingId === playthrough.id">
                    <label class="sr-only" :for="`rename-${playthrough.id}`">Expedition name</label>
                    <InputText :id="`rename-${playthrough.id}`" v-model="renameDraft" class="expedition-menu__input" @keyup.enter="saveRename(playthrough)" />
                    <button type="button" class="expedition-menu__text-action" @click="saveRename(playthrough)">Save</button>
                    <button type="button" class="expedition-menu__text-action expedition-menu__text-action--muted" @click="cancelRename">Cancel</button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="expedition-menu__select"
                      :aria-current="playthrough.id === state.activeId ? 'true' : undefined"
                      @click="selectExpedition(playthrough.id)"
                    >
                      <span>{{ playthrough.name }}</span>
                      <small v-if="playthrough.id === state.activeId">Current</small>
                    </button>
                    <button type="button" class="expedition-menu__icon-action" aria-label="Rename" :title="`Rename ${playthrough.name}`" @click="beginRename(playthrough)">
                      <Pencil :size="15" :strokeWidth="1.8" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      class="expedition-menu__icon-action expedition-menu__icon-action--danger"
                      aria-label="Delete"
                      :title="state.playthroughs.length === 1 ? 'You cannot delete the only expedition' : `Delete ${playthrough.name}`"
                      :disabled="state.playthroughs.length === 1"
                      @click="requestDelete(playthrough)"
                    >
                      <Trash2 :size="15" :strokeWidth="1.8" aria-hidden="true" />
                    </button>
                  </template>
                </div>
              </div>
              <p v-else class="expedition-menu__empty">Create your first expedition below to start recording progress.</p>

              <form v-if="state" class="expedition-menu__new" @submit.prevent="createExpedition">
                <label class="sr-only" for="new-expedition">New expedition</label>
                <InputText id="new-expedition" v-model="newExpeditionName" placeholder="Name a new expedition" autocomplete="off" />
                <Button type="submit" label="Add expedition" severity="secondary" outlined />
              </form>
            </div>
          </div>

        </div>
      </header>

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
  --page-bg: var(--ink);
  --page-fg: var(--paper);
  --page-muted: var(--paper-muted);
  --page-line: var(--line);
  --card-bg: var(--paper);
  --card-fg: var(--ink);
  --card-muted: #756d63;
  --card-line: var(--line-dark);
  --card-accent-bg: #efe1c9;
  --card-accent-fg: var(--ink);
}

:root[data-theme='light'] {
  --page-bg: #ede8de;
  --page-fg: #1b252a;
  --page-muted: #5f6a6c;
  --page-line: rgba(27, 37, 42, 0.16);
  --card-bg: #fffaf1;
  --card-fg: #1b252a;
  --card-muted: #665e55;
  --card-line: rgba(27, 37, 42, 0.16);
  --card-accent-bg: #efe1c9;
  --card-accent-fg: #1b252a;
}

* { box-sizing: border-box; }
html { background: var(--page-bg); }
body { margin: 0; background: var(--page-bg); color: var(--page-fg); font-family: var(--body); }
button, input { font: inherit; }

.guide-shell { position: relative; min-height: 100vh; overflow: hidden; background: var(--page-bg); }
.field-lines { position: absolute; inset: 0; pointer-events: none; opacity: 0.22; background: repeating-linear-gradient(90deg, transparent 0, transparent calc(10vw - 1px), var(--page-line) 10vw, transparent calc(10vw + 1px)); }
.guide-frame { position: relative; width: min(100% - 56px, 980px); margin: 0 auto; padding: 0 0 72px; }
.guide-content { min-width: 0; }
.top-nav { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 15px 0 13px; border-bottom: 1px solid var(--page-line); background: color-mix(in srgb, var(--page-bg) 92%, transparent); backdrop-filter: blur(14px); }
.top-nav__identity { display: flex; align-items: center; gap: 14px; min-width: 0; }
.top-nav__brand { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.top-nav__brand-mark { color: var(--page-fg); font-family: var(--display); font-size: 1.15rem; letter-spacing: -.04em; white-space: nowrap; }
.top-nav__brand-detail { color: var(--page-muted); font-size: .62rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; }
.top-nav__actions { display: flex; align-items: center; gap: 9px; }
.expedition-nav { position: relative; }
.top-nav__expedition { display: flex; align-items: center; gap: 11px; min-width: 194px; padding: 6px 7px 6px 11px; border: 1px solid var(--page-line); border-radius: 2px; background: transparent; color: var(--page-fg); text-align: left; cursor: pointer; }
.top-nav__expedition:hover, .top-nav__expedition:focus-visible { border-color: var(--copper); }
.top-nav__expedition:focus-visible, .theme-toggle:focus-visible, .expedition-menu button:focus-visible { outline: 2px solid var(--copper); outline-offset: 2px; }
.top-nav__expedition-copy { display: grid; flex: 1 1 auto; gap: 2px; min-width: 0; }
.top-nav__expedition-kicker { overflow: hidden; color: var(--page-muted); font-size: .55rem; font-weight: 700; letter-spacing: .14em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.top-nav__expedition strong { overflow: hidden; font-family: var(--display); font-size: .98rem; font-weight: 400; letter-spacing: -.02em; text-overflow: ellipsis; white-space: nowrap; }
.top-nav__expedition > svg { flex: 0 0 auto; color: var(--copper); }
.expedition-menu { position: absolute; top: calc(100% + 10px); right: 0; width: min(390px, calc(100vw - 28px)); padding: 15px; border: 1px solid var(--page-line); border-radius: 2px; background: var(--card-bg); color: var(--card-fg); box-shadow: 10px 12px 0 rgba(0,0,0,.16); }
.expedition-menu__heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 1px 0 10px; border-bottom: 1px solid var(--card-line); }
.expedition-menu__heading .section-kicker { color: var(--card-muted); }
.expedition-menu__count { color: var(--card-muted); font-size: .68rem; }
.expedition-menu__list { display: grid; gap: 2px; padding: 7px 0 2px; }
.expedition-menu__row { display: flex; align-items: center; gap: 4px; min-width: 0; padding: 4px 0 4px 8px; border-left: 2px solid transparent; }
.expedition-menu__row--active { border-left-color: var(--copper); background: rgba(198,109,67,.08); }
.expedition-menu__select { display: flex; flex: 1 1 auto; align-items: baseline; justify-content: space-between; gap: 10px; min-width: 0; padding: 7px 4px; border: 0; background: transparent; color: var(--card-fg); text-align: left; cursor: pointer; }
.expedition-menu__select span { overflow: hidden; font-family: var(--display); font-size: 1.03rem; text-overflow: ellipsis; white-space: nowrap; }
.expedition-menu__select small { flex: 0 0 auto; color: var(--copper-deep); font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.expedition-menu__icon-action { display: inline-grid; flex: 0 0 auto; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 2px; background: transparent; color: var(--card-muted); cursor: pointer; }
.expedition-menu__icon-action:hover { background: rgba(198,109,67,.12); color: var(--copper-deep); }
.expedition-menu__icon-action--danger:hover { color: #a13f2d; }
.expedition-menu__icon-action:disabled { opacity: .32; cursor: not-allowed; }
.expedition-menu__input { flex: 1 1 auto; min-width: 0; }
.expedition-menu__text-action { flex: 0 0 auto; padding: 6px 4px; border: 0; background: transparent; color: var(--copper-deep); font-size: .73rem; font-weight: 700; cursor: pointer; }
.expedition-menu__text-action--muted { color: var(--card-muted); }
.expedition-menu__empty { margin: 14px 3px 12px; color: var(--card-muted); font-size: .8rem; line-height: 1.5; }
.menu-error { margin: 11px 0 0; border-radius: 2px; font-size: .76rem; line-height: 1.4; }
.expedition-menu__new { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--card-line); }
.expedition-menu__new .p-inputtext { min-width: 0; border-color: var(--card-line); border-radius: 2px; color: var(--card-fg); }
.expedition-menu__new .p-button { min-height: 38px; border-radius: 2px; }
.theme-toggle { display: inline-grid; flex: 0 0 auto; place-items: center; width: 37px; height: 37px; padding: 0; border: 1px solid var(--page-line); border-radius: 2px; background: transparent; color: var(--page-fg); cursor: pointer; }
.theme-toggle:hover { border-color: var(--copper); color: var(--copper); }
.section-kicker { color: var(--page-muted); font-size: .68rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
.save-alert { margin: 24px 0; }
.save-alert .p-message { border-radius: 2px; }
.p-button > svg { flex: 0 0 auto; }
.action-notice { margin: 18px 0 0; border-radius: 2px; }
.party-heading { display: flex; align-items: center; justify-content: space-between; gap: 32px; margin: 34px 0 18px; }
.party { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.character-card.p-card { height: 100%; background: var(--card-bg); border: 0; border-radius: 2px; color: var(--card-fg); box-shadow: 8px 10px 0 rgba(0,0,0,.12); }
.character-card .p-card-body, .character-card .p-card-content { height: 100%; padding: 0; }
.character-card__inner { display: flex; flex-direction: column; min-height: 372px; padding: 25px; }
.character-card__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 22px; border-bottom: 1px solid var(--card-line); }
.character-card__identity { display: flex; align-items: center; gap: 14px; min-width: 0; }
.character-avatar { display: block; flex: 0 0 auto; width: 64px; height: 64px; border: 0; border-radius: 0; background: transparent; object-fit: cover; }
.character-card h2 { margin: 0; color: var(--card-fg); font-family: var(--display); font-size: 1.8rem; font-weight: 400; letter-spacing: -.06em; }
.level-tag.p-tag { flex: 0 0 auto; background: var(--page-fg) !important; color: var(--page-bg) !important; border-radius: 2px; font-size: .64rem; letter-spacing: .13em; }
.stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; padding: 22px 0; }
.stats__item { min-width: 0; }
.stats__label { display: block; overflow: hidden; color: #7b746a; font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.stats__value { display: block; margin-top: 5px; color: var(--card-fg); font-family: var(--display); font-size: 1.55rem; line-height: 1; }
.recommendation.p-message { margin: 0 0 20px; border-left: 3px solid var(--copper) !important; border-radius: 0; background: var(--card-accent-bg) !important; color: var(--card-accent-fg) !important; }
.recommendation .p-message-text { color: var(--card-accent-fg) !important; }
.recommendation strong { display: block; margin-bottom: 7px; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; }
.recommendation__spend { color: var(--copper-deep); font-weight: 700; }
.recommendation small { display: block; margin-top: 8px; line-height: 1.5; }
.character-card__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
.character-card__actions .p-button { min-height: 38px; border-radius: 2px; font-size: .79rem; }
.character-card__actions .p-button:not(.p-button-outlined):not(.p-button-text) { background: var(--copper); border-color: var(--copper); color: #21130c; }
.character-card__actions .p-button.p-button-outlined { border-color: var(--card-line); color: var(--card-fg); }
.character-card__actions .p-button.p-button-text { color: #766e63; }
.points-line { display: flex; align-items: center; gap: 8px; margin: 21px 0 0; color: #756e65; font-size: .77rem; }
.points-line i { color: var(--copper); font-size: .75rem; }
.add-character.p-button { width: 100%; justify-content: center; margin-top: 20px; min-height: 52px; border: 1px solid var(--page-line); border-radius: 2px; background: var(--card-bg); color: var(--card-fg); box-shadow: 4px 5px 0 rgba(0,0,0,.08); font-size: .85rem; font-weight: 700; letter-spacing: .02em; }
.add-character.p-button:hover { background: var(--card-accent-bg); border-color: var(--copper); color: var(--card-fg); }
.manager-intro { margin-bottom: 20px; }
.manager-intro p { margin: 10px 0 0; color: #655e56; line-height: 1.5; }

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
  .guide-frame { width: min(100% - 28px, 560px); padding-top: 0; }
  .top-nav { align-items: stretch; flex-direction: column; gap: 12px; }
  .top-nav__identity { justify-content: space-between; }
  .top-nav__actions { width: 100%; }
  .expedition-nav { flex: 1 1 auto; }
  .top-nav__expedition { width: 100%; }
  .expedition-menu { left: 0; right: auto; width: min(390px, calc(100vw - 28px)); }
  .party-heading { margin-top: 28px; }
  .party { grid-template-columns: minmax(0, 1fr); }
  .character-card__inner { min-height: 0; padding: 21px; }
  .character-avatar { width: 58px; height: 58px; }
  .attribute-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 400px) {
  .guide-frame { width: min(100% - 22px, 560px); }
  .top-nav__brand-detail { display: none; }
  .expedition-menu__new { grid-template-columns: 1fr; }
  .expedition-menu__new .p-button { width: 100%; }
  .stats { gap: 4px; }
  .stats__label { font-size: .51rem; }
  .stats__value { font-size: 1.35rem; }
  .character-card__actions .p-button { flex: 1 1 100%; }
}
</style>
