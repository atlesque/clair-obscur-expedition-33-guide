<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ProgressFields from './ProgressFields.vue';
import PartyWizard from './PartyWizard.vue';
import type { SetupProgress } from '../domain/setup-url';
import NumberInput from './NumberInput.vue';
import { INITIAL_CHARACTERS, LATER_CHARACTERS, attributeLabels, compareCharacterIds } from '../domain/data';
import { emptyAttributes } from '../domain/types';
import type { Character, Playthrough, SaveData } from '../domain/types';
import { applyRecommendation, recommend, setStat, statLimits, updateProgress } from '../domain/rules';
import type { StatField } from '../domain/rules';
import { MAX_ACTIVE_PARTY, activeParty, applyColourPlan, planColours } from '../domain/lumina';
import ColourPanel from './ColourPanel.vue';
import { clear, id, load, save } from '../domain/storage';
import { readSetupDraft, writeSetupDraft } from '../domain/setup-url';
import CharacterCard from './CharacterCard.vue';
import FocusDialog from './FocusDialog.vue';
import SetupPanel from './SetupPanel.vue';
import AccountControl from './AccountControl.vue';
import { createPlaySync } from '../domain/play-sync';

type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'expedition-33-guide.theme';
const THEME_MODES: ThemeMode[] = ['auto', 'dark', 'light'];
const THEME_LABELS: Record<ThemeMode, string> = { auto: 'Auto', dark: 'Dark', light: 'Light' };
const THEME_ICONS: Record<ThemeMode, string> = { auto: 'i-lucide-monitor', dark: 'i-lucide-moon', light: 'i-lucide-sun' };

function readThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'auto';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' || saved === 'light' || saved === 'auto' ? saved : 'auto';
}

const loaded = typeof localStorage !== 'undefined' ? load() : { kind: 'missing' as const };
const state = ref<SaveData | null>(loaded.kind === 'loaded' ? loaded.data : null);
const unreadableSave = loaded.kind === 'invalid';
const setupResume = ref(!state.value && typeof window !== 'undefined' ? readSetupDraft(window.location.search) : null);
const setupName = ref(setupResume.value?.name ?? 'My Expedition');
const selected = ref<string[]>(setupResume.value?.selected ?? ['gustave', 'lune']);
const saveError = ref(loaded.kind === 'invalid' ? loaded.error : '');
const notice = ref('');
const revealStage = ref<'warning' | 'identity' | 'terminal' | null>(null);
const setupCharacter = ref<Character | null>(null);
const formError = ref('');
const wizardMode = ref<'update' | 'advice' | null>(null);
const addingCandidate = ref(false);
const revealedCandidate = ref<(typeof LATER_CHARACTERS)[number] | null>(null);
const focusWeapon = ref(false);
const draft = ref<SetupProgress>({ level: 1, points: 0, invested: emptyAttributes(), weapon: '', weaponLevel: 1 });
const expeditionMenuOpen = ref(false);
const renamingId = ref<string | null>(null);
const renameDraft = ref('');
const newExpeditionName = ref('');
const managerError = ref('');
const deleteTarget = ref<Playthrough | null>(null);
const statTarget = ref<{ character: Character; field: StatField } | null>(null);
const statDraft = ref(0);
const statError = ref('');
const themeMode = ref<ThemeMode>(readThemeMode());
const setupBlocked = computed(() => unreadableSave || Boolean(saveError.value));

const active = computed(() => state.value?.playthroughs.find((p) => p.id === state.value?.activeId) ?? null);
const trackedCharacters = computed(() => active.value?.characters.filter(item => item.tracked).sort((left, right) => compareCharacterIds(left.id, right.id)) ?? []);
const partyFull = computed(() => activeParty(trackedCharacters.value).length >= MAX_ACTIVE_PARTY);
const hasPlaythroughs = computed(() => (state.value?.playthroughs.length ?? 0) > 0);
const themeLabel = computed(() => THEME_LABELS[themeMode.value]);
const nextThemeMode = computed(() => THEME_MODES[(THEME_MODES.indexOf(themeMode.value) + 1) % THEME_MODES.length]);
const nextThemeLabel = computed(() => THEME_LABELS[nextThemeMode.value]);
const themeIcon = computed(() => THEME_ICONS[themeMode.value]);
const statLabel = computed(() => !statTarget.value ? '' : statTarget.value.field === 'level' ? 'Level' : statTarget.value.field === 'points' ? 'Available attribute points' : attributeLabels[statTarget.value.field]);
const statTitle = computed(() => !statTarget.value ? '' : `Set ${statTarget.value.character.name}’s ${statTarget.value.field === 'level' ? 'level' : statTarget.value.field === 'points' ? 'attribute points' : statLabel.value}`);
let themeMediaQuery: MediaQueryList | null = null;
const snapshot = () => (state.value ? (JSON.parse(JSON.stringify(state.value)) as SaveData) : null);

function syncTheme() {
  if (typeof window === 'undefined') return;
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const appliedTheme = themeMode.value === 'auto' ? systemTheme : themeMode.value;
  document.documentElement.dataset.theme = appliedTheme;
  document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
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

function setExpeditionMenu(open: boolean) {
  if (open) managerError.value = '';
  expeditionMenuOpen.value = open;
}

const playSync = createPlaySync({
  get: snapshot,
  canSync: () => !unreadableSave && !wizardMode.value && !setupCharacter.value && !statTarget.value && !revealStage.value && !deleteTarget.value && !expeditionMenuOpen.value,
  apply: (data) => {
    const result = data ? save(data) : clear();
    if (!result.ok) { saveError.value = result.error ?? 'Could not store account progress on this device.'; return false; }
    if (data?.playthroughs.some(run => run.name.endsWith('(recovered copy)') && !state.value?.playthroughs.some(existing => existing.id === run.id))) {
      notice.value = 'Changes from another device overlapped. Both versions were kept; find the recovered copy in Expeditions.';
    }
    state.value = data;
    if (data) { setupResume.value = null; writeSetupDraft(null); }
    saveError.value = '';
    return true;
  },
});

onMounted(() => {
  void playSync.start();
  if (state.value) writeSetupDraft(null);
  syncTheme();
  themeMediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
  themeMediaQuery?.addEventListener('change', syncTheme);
});

onUnmounted(() => {
  playSync.stop();
  themeMediaQuery?.removeEventListener('change', syncTheme);
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
  playSync.changed();
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

function start(actual: Record<string, SetupProgress | null> = {}, revealComplete = false) {
  if (unreadableSave || !selected.value.length) return;
  const before = snapshot();
  try {
    const characters = selected.value.map((key) => {
      const d = INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS] ?? LATER_CHARACTERS.find(item => item.id === key);
      if (!d) throw new Error('Choose a known character.');
      const input = actual[key];
      if (input) {
        return updateProgress(
          { id: key, name: d.name, level: 1, invested: { ...d.defaults }, points: 3, tracked: true, revealed: true },
          input,
        );
      }
      return { id: key, name: d.name, level: 1, invested: { ...d.defaults }, points: 3, tracked: true, revealed: true };
    });
    const p: Playthrough = { ...makePlaythrough(setupName.value), characters, nextRevealIndex: nextCharacterIndex(characters), ...(revealComplete ? { revealComplete } : {}) };
    state.value = { version: 1, playthroughs: [p], activeId: p.id };
    if (persist(before)) {
      setupResume.value = null;
      writeSetupDraft(null);
    }
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
  closeExpeditionMenu();
  deleteTarget.value = playthrough;
}

function deleteExpedition() {
  if (!state.value || !deleteTarget.value) return;
  const before = snapshot();
  const targetIndex = state.value.playthroughs.findIndex((item) => item.id === deleteTarget.value?.id);
  if (targetIndex < 0) return;
  if (state.value.playthroughs.length === 1) {
    const result = clear();
    if (!result.ok) {
      saveError.value = result.error ?? 'Your browser could not clear this expedition.';
      return;
    }
    state.value = null;
    playSync.changed();
    deleteTarget.value = null;
    return;
  }
  const wasActive = state.value.activeId === deleteTarget.value.id;
  state.value.playthroughs.splice(targetIndex, 1);
  if (wasActive) state.value.activeId = state.value.playthroughs[Math.max(0, targetIndex - 1)].id;
  if (persist(before)) deleteTarget.value = null;
}

function beginSetup(character: Character) {
  formError.value = '';
  focusWeapon.value = false;
  setupCharacter.value = character;
  draft.value = { level: character.level, points: character.points, invested: { ...character.invested }, weapon: character.weapon ?? '', weaponLevel: character.weaponLevel ?? 1, lumina: { ...(character.lumina ?? { total: 0, spent: 0 }) } };
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
      active.value.nextRevealIndex = nextCharacterIndex(active.value.characters);
    } else {
      const index = active.value.characters.findIndex((item) => item.id === setupCharacter.value?.id);
      active.value.characters[index] = character;
    }
    active.value.revision++;
    formError.value = '';
    if (persist(before)) {
      setupCharacter.value = null;
      if (adding) {
        addingCandidate.value = false;
        revealedCandidate.value = null;
      }
    } else formError.value = saveError.value;
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Enter valid in-game progress.';
  }
}

function saveWizardProgress(character: Character, progress: SetupProgress) {
  if (!active.value) return false;
  const index = active.value.characters.findIndex(item => item.id === character.id);
  if (index < 0) return false;
  const changed = updateProgress(character, progress);
  const before = snapshot();
  active.value.characters[index] = changed;
  active.value.revision++;
  return persist(before);
}
function finishWizard() {
  notice.value = wizardMode.value === 'update' ? 'Party progress review complete.' : 'Party advice review complete. Unconfirmed advice remains pending.';
  wizardMode.value = null;
}
function advise(character: Character) {
  const before = snapshot();
  character.pending = recommend(character);
  return persist(before);
}

function editWeapon(character: Character) {
  beginSetup(character);
  focusWeapon.value = true;
}

function removeWeapon(character: Character) {
  if (!active.value) return;
  const before = snapshot();
  delete character.weapon;
  delete character.weaponLevel;
  // Advice built around the old weapon's scaling no longer applies.
  character.pending = undefined;
  active.value.revision++;
  if (persist(before)) notice.value = `Removed ${character.name}’s weapon. Add the one equipped in-game when you’re ready.`;
}

function beginStat(character: Character, field: StatField) {
  statError.value = '';
  statDraft.value = field === 'level' || field === 'points' ? character[field] : character.invested[field];
  statTarget.value = { character, field };
}

function saveStat() {
  if (!active.value || !statTarget.value) return;
  const { character, field } = statTarget.value;
  const index = active.value.characters.findIndex(item => item.id === character.id);
  if (index < 0) return;
  try {
    const changed = setStat(character, field, statDraft.value);
    const before = snapshot();
    active.value.characters[index] = changed;
    active.value.revision++;
    if (persist(before)) statTarget.value = null;
    else statError.value = saveError.value;
  } catch (e) {
    statError.value = e instanceof Error ? e.message : 'Enter a valid number.';
  }
}

function dismiss(character: Character) {
  const before = snapshot();
  character.pending = undefined;
  persist(before);
}

function confirm(character: Character) {
  if (!character.pending || !active.value) return false;
  const before = snapshot();
  const changed = applyRecommendation(character, character.pending);
  if (changed === character) {
    notice.value = 'That advice is stale; update progress before applying it.';
    return false;
  }
  Object.assign(character, changed);
  active.value.revision++;
  const saved = persist(before);
  if (saved) notice.value = 'Applied recommendation recorded once.';
  return saved;
}

function toggleParty(character: Character) {
  if (!active.value || (!character.inParty && partyFull.value)) return;
  const before = snapshot();
  character.inParty = !character.inParty;
  active.value.colourPlan = undefined;
  active.value.revision++;
  persist(before);
}

function saveColours(colours: number) {
  if (!active.value || !Number.isInteger(colours) || colours < 0) return;
  const before = snapshot();
  active.value.colours = colours;
  active.value.colourPlan = undefined;
  active.value.revision++;
  persist(before);
}

function suggestColours() {
  if (!active.value) return;
  const before = snapshot();
  active.value.colourPlan = planColours(active.value);
  persist(before);
}

function dismissColours() {
  if (!active.value) return;
  const before = snapshot();
  active.value.colourPlan = undefined;
  persist(before);
}

function confirmColours() {
  if (!active.value?.colourPlan) return;
  const changed = applyColourPlan(active.value, active.value.colourPlan);
  if (changed === active.value) {
    notice.value = 'That Colour plan is stale; update progress before applying it.';
    return;
  }
  const before = snapshot();
  Object.assign(active.value, changed, { revision: active.value.revision + 1 });
  if (persist(before)) notice.value = 'Colours of Lumina recorded once.';
}

function nextCharacterIndex(characters: Character[]) {
  const index = LATER_CHARACTERS.findIndex(candidate => !characters.some(character => character.id === candidate.id));
  return index === -1 ? LATER_CHARACTERS.length : index;
}

function openReveal() {
  revealStage.value = 'warning';
}

function consentReveal() {
  if (!active.value) return;
  const next = nextCharacterIndex(active.value.characters);
  revealStage.value = next < LATER_CHARACTERS.length ? 'identity' : 'terminal';
  if (next < LATER_CHARACTERS.length) revealedCandidate.value = LATER_CHARACTERS[next];
  else if (!active.value.revealComplete) {
    // The player has now seen that nobody else can join, so the add control can retire.
    const before = snapshot();
    active.value.revealComplete = true;
    active.value.revision++;
    persist(before);
  }
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
  <div class="guide-shell min-h-screen">
    <header class="top-nav sticky top-0 border-b border-default bg-(--app-bg)/90 backdrop-blur-md" aria-label="Primary navigation">
      <UContainer class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div class="flex min-w-0 items-center justify-between gap-3.5">
          <div class="flex min-w-0 items-baseline gap-2.5">
            <span class="font-display text-2xl whitespace-nowrap text-primary">Expedition 33</span>
            <span class="section-kicker hidden whitespace-nowrap text-[0.62rem] min-[401px]:inline">Leveling guide</span>
          </div>
          <UButton
            class="theme-toggle"
            color="neutral"
            variant="outline"
            square
            size="lg"
            :icon="themeIcon"
            :data-theme-mode="themeMode"
            :aria-label="`Theme: ${themeLabel}. Activate to switch to ${nextThemeLabel}.`"
            :title="`Theme: ${themeLabel} · Switch to ${nextThemeLabel}`"
            @click="cycleTheme"
          />
        </div>

        <div class="flex w-full items-center gap-2 sm:w-auto">
          <AccountControl :account="playSync.account" @sign-in="playSync.signIn" @sign-out="playSync.signOut" @sync="playSync.sync" />
          <UPopover v-if="hasPlaythroughs" :open="expeditionMenuOpen" :content="{ align: 'end', sideOffset: 8 }" :ui="{ content: 'data-[state=closed]:animate-none' }" class="expedition-nav min-w-0 flex-1 sm:flex-none" @update:open="setExpeditionMenu">
            <UButton
              class="top-nav__expedition w-full min-w-48 sm:w-auto"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
              aria-label="View all expeditions"
              :ui="{ trailingIcon: 'text-primary ms-auto' }"
            >
              <span class="grid min-w-0 text-left">
                <span class="section-kicker truncate text-[0.55rem]">Current expedition</span>
                <strong class="truncate font-display text-base font-normal text-highlighted">{{ active?.name ?? 'Set up an expedition' }}</strong>
              </span>
            </UButton>

            <template #content>
              <div class="expedition-menu grid w-[min(24rem,calc(100vw-2rem))] gap-2 p-4" aria-label="Expeditions">
                <div class="flex items-baseline justify-between gap-3 border-b border-default pb-2.5">
                  <span class="section-kicker">Expeditions</span>
                  <span v-if="state" class="text-xs text-muted">{{ state.playthroughs.length }} saved</span>
                </div>
                <UAlert v-if="managerError" role="alert" color="error" variant="subtle" :title="managerError" class="menu-error" />

                <div v-if="state" class="grid gap-0.5">
                  <div
                    v-for="playthrough in state.playthroughs"
                    :key="playthrough.id"
                    class="flex min-w-0 items-center gap-1 rounded-md border-s-2 py-1 ps-2"
                    :class="playthrough.id === state.activeId ? 'border-primary bg-primary/10' : 'border-transparent'"
                  >
                    <template v-if="renamingId === playthrough.id">
                      <label class="sr-only" :for="`rename-${playthrough.id}`">Expedition name</label>
                      <UInput :id="`rename-${playthrough.id}`" v-model="renameDraft" size="sm" class="min-w-0 flex-1" @keyup.enter="saveRename(playthrough)" />
                      <UButton size="sm" variant="ghost" label="Save" @click="saveRename(playthrough)" />
                      <UButton size="sm" variant="ghost" color="neutral" label="Cancel" @click="cancelRename" />
                    </template>
                    <template v-else>
                      <button
                        type="button"
                        class="flex min-w-0 flex-1 cursor-pointer items-baseline justify-between gap-2.5 rounded-sm px-1 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-primary"
                        :aria-current="playthrough.id === state.activeId ? 'true' : undefined"
                        @click="selectExpedition(playthrough.id)"
                      >
                        <span class="truncate font-display text-lg text-highlighted">{{ playthrough.name }}</span>
                        <UBadge v-if="playthrough.id === state.activeId" size="sm" variant="subtle" label="Current" />
                      </button>
                      <UButton color="neutral" variant="ghost" square icon="i-lucide-pencil" aria-label="Rename" :title="`Rename ${playthrough.name}`" @click="beginRename(playthrough)" />
                      <UButton color="neutral" variant="ghost" square icon="i-lucide-trash-2" class="hover:text-error" aria-label="Delete" :title="`Delete ${playthrough.name}`" @click="requestDelete(playthrough)" />
                    </template>
                  </div>
                </div>
                <p v-else class="text-sm text-muted">Create your first expedition below to start recording progress.</p>

                <form v-if="state" class="mt-1 grid gap-2 border-t border-default pt-3 min-[401px]:grid-cols-[minmax(0,1fr)_auto]" @submit.prevent="createExpedition">
                  <label class="sr-only" for="new-expedition">New expedition</label>
                  <UInput id="new-expedition" v-model="newExpeditionName" placeholder="Name a new expedition" autocomplete="off" class="w-full" />
                  <UButton type="submit" label="Add expedition" icon="i-lucide-plus" color="neutral" variant="outline" class="justify-center" />
                </form>
              </div>
            </template>
          </UPopover>
        </div>
      </UContainer>
    </header>

    <main class="guide-content">
      <UContainer class="pb-20">
        <UAlert v-if="saveError" role="alert" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="saveError" class="save-alert mt-6" />

        <SetupPanel
          v-if="!state"
          v-model:name="setupName"
          :selected="selected"
          :resume="setupResume"
          :disabled="setupBlocked"
          :blocked="setupBlocked"
          @update:selected="selected = $event"
          @start="start"
        />

        <template v-else-if="active">
          <UAlert
            v-if="notice"
            color="success"
            variant="subtle"
            icon="i-lucide-circle-check"
            :title="notice"
            :close="{ 'aria-label': 'Dismiss message' }"
            class="action-notice mt-6"
            aria-live="polite"
            @update:open="notice = ''"
          />

          <section class="party-heading mt-10 mb-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="party-title">
            <span id="party-title" class="section-kicker">Recorded progress</span>
            <div class="party-actions flex flex-wrap gap-2" aria-label="Party actions">
              <UButton label="Update progress" aria-label="Update progress for all characters" icon="i-lucide-pencil-line" color="neutral" variant="outline" class="flex-1 justify-center sm:flex-none" :disabled="!trackedCharacters.length" @click="wizardMode = 'update'" />
              <UButton label="Get advice" aria-label="Get advice for all characters" icon="i-lucide-lightbulb" class="flex-1 justify-center sm:flex-none" :disabled="!trackedCharacters.length" @click="wizardMode = 'advice'" />
            </div>
          </section>

          <section class="party grid gap-5 md:grid-cols-2" aria-label="Tracked characters">
            <CharacterCard
              v-for="character in trackedCharacters"
              :key="character.id"
              :character="character"
              :partyFull="partyFull"
              @update="beginSetup"
              @toggle-party="toggleParty"
              @advise="advise"
              @confirm="confirm"
              @dismiss="dismiss"
              @edit-weapon="editWeapon"
              @remove-weapon="removeWeapon"
              @set-stat="beginStat"
            />
          </section>

          <ColourPanel :playthrough="active" class="mt-5" @save="saveColours" @suggest="suggestColours" @confirm="confirmColours" @dismiss="dismissColours" />

          <UButton v-if="!active?.revealComplete" color="neutral" variant="outline" size="xl" icon="i-lucide-plus" label="Add a character" block class="add-character mt-5 bg-default" @click="openReveal" />
        </template>

        <PartyWizard v-if="wizardMode && active" :mode="wizardMode" :characters="trackedCharacters" :saveProgress="saveWizardProgress" :prepareAdvice="advise" :applyAdvice="confirm" @close="wizardMode = null" @complete="finishWizard" />

        <FocusDialog v-if="deleteTarget" title="Delete expedition?" size="sm" @close="deleteTarget = null">
          <p class="text-muted">This removes <strong class="text-highlighted">{{ deleteTarget.name }}</strong> and its recorded progress from this browser.</p>
          <div class="dialog-actions mt-6 flex flex-wrap justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="deleteTarget = null" />
            <UButton label="Delete expedition" color="error" icon="i-lucide-trash-2" @click="deleteExpedition" />
          </div>
        </FocusDialog>

        <FocusDialog v-if="statTarget" :title="statTitle" size="sm" @close="statTarget = null">
          <form novalidate class="grid gap-5" @submit.prevent="saveStat">
            <UAlert v-if="statError" role="alert" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="statError" />
            <UFormField :label="statLabel" :help="statTarget.character.pending ? 'Saving clears the pending recommendation, since it was based on the old value.' : undefined">
              <NumberInput v-model="statDraft" inputId="stat-value-input" :label="statLabel" :min="statLimits(statTarget.field).min" :max="statLimits(statTarget.field).max" />
            </UFormField>
            <div class="dialog-actions flex flex-wrap justify-end gap-2">
              <UButton type="button" label="Cancel" color="neutral" variant="ghost" @click="statTarget = null" />
              <UButton type="submit" icon="i-lucide-check" label="Save" />
            </div>
          </form>
        </FocusDialog>

        <FocusDialog v-if="setupCharacter" :title="`Update ${setupCharacter.name}`" :focusWeapon="focusWeapon" @close="cancelSetup">
          <div class="dialog-intro mb-5 grid gap-2">
            <span class="section-kicker text-primary">Reconcile your save</span>
            <p class="text-muted">Enter what is true in-game. This replaces the recorded inputs and clears old advice.</p>
          </div>
          <UAlert v-if="formError" role="alert" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="formError" class="dialog-error mb-4" />
          <form novalidate class="dialog-form grid gap-5" @submit.prevent="submitProgress">
            <ProgressFields :draft="draft" :characterId="setupCharacter.id" />
            <div class="dialog-actions flex flex-wrap justify-end gap-2">
              <UButton type="button" label="Cancel" color="neutral" variant="ghost" @click="cancelSetup" />
              <UButton type="submit" icon="i-lucide-check" label="Save progress" />
            </div>
          </form>
        </FocusDialog>

        <FocusDialog v-if="revealStage" title="Continue your expedition?" size="sm" @close="cancelReveal">
          <div class="dialog-intro grid gap-2">
            <span class="section-kicker text-primary">Spoiler boundary</span>
            <p v-if="revealStage === 'warning'" class="text-muted">Only continue if someone new has joined your party. The next identity stays hidden until you choose to reveal it.</p>
            <p v-else-if="revealStage === 'identity'" class="text-muted">The next character is <strong class="text-highlighted">{{ revealedCandidate?.name }}</strong>.</p>
            <p v-else class="text-muted">No additional character is available right now.</p>
          </div>
          <div class="dialog-actions mt-6 flex flex-wrap justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="cancelReveal" />
            <UButton v-if="revealStage === 'warning'" icon="i-lucide-eye" label="Reveal character" @click="consentReveal" />
            <UButton v-else-if="revealStage === 'identity'" icon="i-lucide-plus" label="Add to playthrough" @click="addLater" />
          </div>
        </FocusDialog>
      </UContainer>
    </main>
  </div>
</template>
