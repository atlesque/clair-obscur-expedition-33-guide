<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { INITIAL_CHARACTERS, LATER_CHARACTERS, attributeLabels, characterAvatar, compareCharacterIds } from '../domain/data';
import { ATTRIBUTES, emptyAttributes } from '../domain/types';
import { writeSetupDraft } from '../domain/setup-url';
import type { SetupDraft, SetupProgress } from '../domain/setup-url';
import { isWeaponLevel, weaponScaling } from '../domain/weapons';
import NumberInput from './NumberInput.vue';
import WeaponField from './WeaponField.vue';

type Progress = SetupProgress;
const props = defineProps<{ name: string; selected: string[]; resume?: SetupDraft | null; disabled: boolean; blocked: boolean }>();
const emit = defineEmits<{
  'update:name': [value: string]; 'update:selected': [value: string[]];
  start: [value: Record<string, Progress | null>, revealComplete: boolean];
}>();
const mode = ref<'new' | 'midway' | null>(props.resume?.mode ?? null);
const step = ref(0);
const title = ref<HTMLElement | null>(null);
const drafts = ref<Record<string, Progress>>(props.resume?.progress ?? {});
const error = ref('');
const revealedCount = ref(props.resume?.revealed ?? 0);
const revealComplete = ref(props.resume?.revealComplete ?? false);
const visibleCharacters = computed(() => [
  ...Object.entries(INITIAL_CHARACTERS).map(([id, item]) => ({ id, ...item })),
  ...(mode.value === 'midway' ? LATER_CHARACTERS.slice(0, revealedCount.value) : []),
].sort((left, right) => compareCharacterIds(left.id, right.id)));
const steps = computed(() => ['mode', 'name', 'party', ...[...props.selected].sort(compareCharacterIds)]);
step.value = Math.max(0, steps.value.indexOf(props.resume?.screen ?? 'mode'));
const current = computed(() => steps.value[step.value]);
const character = computed(() => visibleCharacters.value.find(item => item.id === current.value)!);
const progress = computed(() => drafts.value[current.value]);
const scaling = computed(() => weaponScaling(current.value, progress.value?.weapon, progress.value?.weaponLevel));
const isBlocked = computed(() => props.blocked || props.disabled);
const lastStep = computed(() => step.value > 2 && step.value === steps.value.length - 1);
const heading = computed(() => current.value === 'mode' ? 'Where are you starting?' : current.value === 'name' ? 'Name your expedition' : current.value === 'party' ? 'Who’s in your party?' : `${character.value.name}’s ${mode.value === 'new' ? 'weapon' : 'progress'}`);
const description = computed(() => current.value === 'mode' ? 'Choose a starting point for your expedition.' : current.value === 'name' ? 'Give this playthrough a name so you can find it later.' : current.value === 'party' ? mode.value === 'midway' ? 'Choose everyone who is already in your party. Reveal later characters below, one at a time.' : 'Choose the initial characters you want to track. You can reveal others later.' : mode.value === 'new' ? 'Enter the name of the weapon equipped in-game.' : 'Enter the equipped weapon, level, available points, and invested attributes shown in-game.');

function ensureDraft(key: string) {
  if (!drafts.value[key]) drafts.value[key] = { level: 1, points: 0, invested: emptyAttributes(), weapon: '', weaponLevel: 1 };
}
function revealNext() {
  if (revealedCount.value < LATER_CHARACTERS.length) revealedCount.value++;
  else revealComplete.value = true;
}
function toggleCharacter(key: string, checked: boolean) {
  emit('update:selected', checked ? [...new Set([...props.selected, key])] : props.selected.filter(value => value !== key));
}
function chooseMode(value: 'new' | 'midway') {
  mode.value = value;
  if (value === 'new') emit('update:selected', props.selected.filter(key => key in INITIAL_CHARACTERS));
  advance();
}
function advance() {
  if (isBlocked.value) return;
  error.value = '';
  if (current.value === 'name' && !props.name.trim()) { error.value = 'Enter a name for this expedition.'; return; }
  if (current.value === 'party' && !props.selected.length) { error.value = 'Choose at least one character.'; return; }
  if (progress.value && !progress.value.weapon?.trim()) { error.value = 'Enter the equipped weapon name.'; return; }
  if (progress.value && mode.value === 'midway') {
    const value = progress.value;
    if (!Number.isInteger(value.level) || value.level < 1 || value.level > 99 || !Number.isSafeInteger(value.points) || value.points < 0 || ATTRIBUTES.some(attribute => !Number.isInteger(value.invested[attribute]) || value.invested[attribute] < 0 || value.invested[attribute] > 99) || (value.weaponLevel !== undefined && !isWeaponLevel(value.weaponLevel))) {
      error.value = 'Use whole numbers: levels from 1 to 99, weapon levels from 1 to 33, attributes from 0 to 99, and zero or more available points.';
      return;
    }
  }
  if (lastStep.value) {
    const missingWeapon = props.selected.find(key => !drafts.value[key]?.weapon?.trim());
    if (missingWeapon) {
      step.value = steps.value.indexOf(missingWeapon);
      error.value = 'Enter the equipped weapon name.';
      return;
    }
    const actual = mode.value === 'midway' ? drafts.value : Object.fromEntries(props.selected.map(key => [key, {
      level: 1, points: 3, invested: { ...INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS].defaults }, weapon: drafts.value[key].weapon?.trim(), weaponLevel: 1,
    }]));
    emit('start', actual, mode.value === 'midway' && revealComplete.value);
  }
  else step.value++;
}
function back() { error.value = ''; step.value = Math.max(0, step.value - 1); }
watch(() => props.selected, values => {
  for (const key of Object.keys(drafts.value)) if (!values.includes(key)) delete drafts.value[key];
  values.forEach(ensureDraft);
}, { deep: true, immediate: true });
watch(step, async () => { await nextTick(); title.value?.focus(); });
watch([mode, step, revealedCount, revealComplete, drafts, () => props.name, () => props.selected], () => {
  writeSetupDraft({
    version: 1, mode: mode.value, screen: current.value, name: props.name,
    selected: props.selected, revealed: revealedCount.value, revealComplete: revealComplete.value, progress: drafts.value,
  });
}, { deep: true, flush: 'post' });
</script>

<template>
  <UCard class="setup-card mx-auto mt-8 w-full max-w-2xl sm:mt-12" :ui="{ body: 'p-6 sm:p-10' }">
    <section class="setup-panel" aria-labelledby="setup-title">
      <div class="mb-8 grid gap-3">
        <span class="section-kicker text-primary">Step {{ step + 1 }}<template v-if="mode"> of {{ steps.length }}</template></span>
        <h2 id="setup-title" ref="title" tabindex="-1" class="text-4xl text-highlighted outline-none sm:text-5xl">{{ heading }}</h2>
        <p class="max-w-prose text-muted">{{ description }}</p>
      </div>
      <div v-if="current === 'mode'" class="starting-choices grid gap-3">
        <button v-for="choice in ([['new', 'Start new expedition', 'Begin at level one with the starting party.'], ['midway', 'Join midway', 'Pick up from your current in-game progress.']] as const)" :key="choice[0]" type="button"
          class="group flex cursor-pointer items-center justify-between gap-4 rounded-md bg-default p-5 text-left ring ring-inset ring-default transition-colors hover:bg-elevated hover:ring-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isBlocked" @click="chooseMode(choice[0])">
          <span><strong class="block font-semibold text-highlighted">{{ choice[1] }}</strong><small class="mt-1.5 block text-sm text-muted">{{ choice[2] }}</small></span>
          <UIcon name="i-lucide-arrow-right" class="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <form v-else novalidate class="grid gap-6" @submit.prevent="advance">
        <UFormField v-if="current === 'name'" label="Playthrough name">
          <UInput id="playthrough-name" :modelValue="name" :disabled="isBlocked" autocomplete="off" class="w-full" @update:modelValue="emit('update:name', String($event ?? ''))" />
        </UFormField>
        <div v-else-if="current === 'party'" class="grid gap-6">
          <fieldset class="initial-characters m-0 border-0 p-0">
            <legend class="sr-only">Party characters</legend>
            <div class="divide-y divide-default">
              <UCheckbox
                v-for="item in visibleCharacters"
                :key="item.id"
                :id="`initial-${item.id}`"
                :modelValue="selected.includes(item.id)"
                :disabled="isBlocked"
                class="character-choice py-3"
                :ui="{ root: 'items-center', label: 'flex cursor-pointer items-center gap-4 font-semibold text-highlighted' }"
                @update:modelValue="toggleCharacter(item.id, $event === true)"
              >
                <template #label><img :src="characterAvatar(item.id)" alt="" width="48" height="48" class="size-12 rounded-md object-cover" /><span>{{ item.name }}</span></template>
              </UCheckbox>
            </div>
          </fieldset>
          <div v-if="mode === 'midway'" class="setup-reveal grid justify-items-start gap-3">
            <template v-if="!revealComplete">
              <p id="setup-reveal-help" class="text-sm text-muted">Only reveal the next character if they have already joined your party. Revealing a character does not select them.</p>
              <UButton type="button" color="neutral" variant="outline" icon="i-lucide-eye" label="Reveal next character" :disabled="isBlocked" aria-describedby="setup-reveal-help" @click="revealNext" />
            </template>
            <p v-else role="status" class="text-sm text-muted">All available characters have been revealed.</p>
          </div>
        </div>
        <div v-else-if="progress" :key="current" class="catch-up grid gap-5">
          <WeaponField v-if="mode === 'midway'" v-model="progress.weapon" :level="progress.weaponLevel ?? 1" @update:level="progress.weaponLevel = $event" :characterId="current" :inputId="`setup-weapon-${current}`" :disabled="isBlocked" />
          <WeaponField v-else v-model="progress.weapon" :characterId="current" :inputId="`setup-weapon-${current}`" :disabled="isBlocked" />
          <template v-if="mode === 'midway'">
            <div class="grid gap-5 sm:grid-cols-2">
              <UFormField label="Current level">
                <NumberInput v-model="progress.level" :inputId="`setup-level-${current}`" label="Current level" :min="1" :max="99" :disabled="isBlocked" />
              </UFormField>
              <UFormField label="Available attribute points">
                <NumberInput v-model="progress.points" :inputId="`setup-points-${current}`" label="Available attribute points" :disabled="isBlocked" />
              </UFormField>
            </div>
            <div class="grid divide-y divide-default border-y border-default">
              <div v-for="attribute in ATTRIBUTES" :key="attribute" class="setup-attribute flex items-center justify-between gap-5 py-3" :class="{ 'is-scaling': scaling[attribute] }">
                <label :for="`setup-${current}-${attribute}`" class="text-sm text-default">{{ attributeLabels[attribute] }}<span v-if="scaling[attribute]" class="scaling-grade" aria-hidden="true" :title="`Weapon scales with ${attributeLabels[attribute]} (grade ${scaling[attribute]})`">{{ scaling[attribute] }}</span></label>
                <div class="w-40 shrink-0"><NumberInput v-model="progress.invested[attribute]" :inputId="`setup-${current}-${attribute}`" :label="attributeLabels[attribute]" :max="99" :disabled="isBlocked" /></div>
              </div>
            </div>
          </template>
        </div>
        <UAlert v-if="error" role="alert" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" class="setup-error" />
        <div class="setup-actions flex items-center justify-between gap-3">
          <UButton type="button" color="neutral" variant="ghost" icon="i-lucide-arrow-left" label="Back" :disabled="isBlocked" @click="back" />
          <UButton type="submit" size="lg" trailing-icon="i-lucide-arrow-right" :label="lastStep ? 'Create playthrough' : 'Continue'" :disabled="isBlocked || (current === 'party' && !selected.length)" />
        </div>
      </form>
    </section>
  </UCard>
</template>
