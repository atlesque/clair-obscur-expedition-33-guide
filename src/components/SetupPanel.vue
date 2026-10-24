<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import { ArrowLeft, ArrowRight } from '@lucide/vue';
import { INITIAL_CHARACTERS, attributeLabels, characterAvatar } from '../domain/data';
import { ATTRIBUTES, emptyAttributes } from '../domain/types';
import type { Attributes } from '../domain/types';
import NumberInput from './NumberInput.vue';

type Progress = { level: number; points: number; invested: Attributes };
const props = defineProps<{ name: string; selected: string[]; disabled: boolean; blocked: boolean }>();
const emit = defineEmits<{
  'update:name': [value: string]; 'update:selected': [value: string[]];
  start: [value: Record<string, Progress | null>];
}>();
const mode = ref<'new' | 'midway' | null>(null);
const step = ref(0);
const title = ref<HTMLElement | null>(null);
const drafts = ref<Record<string, Progress>>({});
const error = ref('');
const steps = computed(() => ['mode', 'name', 'party', ...(mode.value === 'midway' ? props.selected : [])]);
const current = computed(() => steps.value[step.value]);
const character = computed(() => INITIAL_CHARACTERS[current.value as keyof typeof INITIAL_CHARACTERS]);
const progress = computed(() => drafts.value[current.value]);
const isBlocked = computed(() => props.blocked || props.disabled);
const lastStep = computed(() => current.value === 'party' ? mode.value === 'new' : step.value > 2 && step.value === steps.value.length - 1);
const heading = computed(() => current.value === 'mode' ? 'Where are you starting?' : current.value === 'name' ? 'Name your expedition' : current.value === 'party' ? 'Who’s in your party?' : `${character.value.name}’s progress`);
const description = computed(() => current.value === 'mode' ? 'Choose a starting point for your expedition.' : current.value === 'name' ? 'Give this playthrough a name so you can find it later.' : current.value === 'party' ? 'Choose the initial characters you want to track. You can reveal others later.' : 'Enter the level, available points, and invested attributes shown in-game.');

function ensureDraft(key: string) {
  if (!drafts.value[key]) drafts.value[key] = { level: 1, points: 0, invested: emptyAttributes() };
}
function toggleCharacter(key: string, checked: boolean) {
  emit('update:selected', checked ? [...new Set([...props.selected, key])] : props.selected.filter(value => value !== key));
}
function chooseMode(value: 'new' | 'midway') {
  mode.value = value;
  advance();
}
function advance() {
  if (isBlocked.value) return;
  error.value = '';
  if (current.value === 'name' && !props.name.trim()) { error.value = 'Enter a name for this expedition.'; return; }
  if (current.value === 'party' && !props.selected.length) { error.value = 'Choose at least one character.'; return; }
  if (progress.value) {
    const value = progress.value;
    if (!Number.isInteger(value.level) || value.level < 1 || value.level > 99 || !Number.isSafeInteger(value.points) || value.points < 0 || ATTRIBUTES.some(attribute => !Number.isInteger(value.invested[attribute]) || value.invested[attribute] < 0 || value.invested[attribute] > 99)) {
      error.value = 'Use whole numbers: levels from 1 to 99, attributes from 0 to 99, and zero or more available points.';
      return;
    }
  }
  if (lastStep.value) emit('start', mode.value === 'midway' ? drafts.value : {});
  else step.value++;
}
function back() { error.value = ''; step.value = Math.max(0, step.value - 1); }
watch(() => props.selected, values => {
  for (const key of Object.keys(drafts.value)) if (!values.includes(key)) delete drafts.value[key];
  values.forEach(ensureDraft);
}, { deep: true, immediate: true });
watch(step, async () => { await nextTick(); title.value?.focus(); });
</script>

<template>
  <Card class="setup-card">
    <template #content>
      <section class="setup-panel" aria-labelledby="setup-title">
        <div class="setup-panel__intro">
          <span class="section-kicker">Step {{ step + 1 }}<template v-if="mode"> of {{ steps.length }}</template></span>
          <h2 id="setup-title" ref="title" tabindex="-1">{{ heading }}</h2>
          <p>{{ description }}</p>
        </div>
        <div v-if="current === 'mode'" class="starting-choices">
          <button type="button" :disabled="isBlocked" @click="chooseMode('new')">
            <span><strong>Start new expedition</strong><small>Begin at level one with the starting party.</small></span>
            <ArrowRight :size="20" aria-hidden="true" />
          </button>
          <button type="button" :disabled="isBlocked" @click="chooseMode('midway')">
            <span><strong>Join midway</strong><small>Pick up from your current in-game progress.</small></span>
            <ArrowRight :size="20" aria-hidden="true" />
          </button>
        </div>
        <form v-else novalidate @submit.prevent="advance">
          <label v-if="current === 'name'" for="playthrough-name" class="setup-field">
            <span>Playthrough name</span>
            <InputText id="playthrough-name" :modelValue="name" :disabled="isBlocked" autocomplete="off" @update:modelValue="emit('update:name', $event ?? '')" />
          </label>
          <fieldset v-else-if="current === 'party'" class="initial-characters">
            <legend class="sr-only">Initial characters</legend>
            <div v-for="(item, key) in INITIAL_CHARACTERS" :key="key" class="character-choice">
              <Checkbox :inputId="`initial-${key}`" :modelValue="selected.includes(key)" binary :disabled="isBlocked" @update:modelValue="toggleCharacter(key, $event)" />
              <label :for="`initial-${key}`"><img :src="characterAvatar(key)" alt="" width="48" height="48" /><span>{{ item.name }}</span></label>
            </div>
          </fieldset>
          <div v-else-if="progress" class="catch-up">
            <div class="catch-up__fields">
              <div class="setup-field">
                <label :for="`setup-level-${current}`">Current level</label>
                <NumberInput v-model="progress.level" :inputId="`setup-level-${current}`" label="Current level" :min="1" :max="99" :disabled="isBlocked" />
              </div>
              <div class="setup-field">
                <label :for="`setup-points-${current}`">Available attribute points</label>
                <NumberInput v-model="progress.points" :inputId="`setup-points-${current}`" label="Available attribute points" :disabled="isBlocked" />
              </div>
            </div>
            <div class="catch-up__attributes">
              <div v-for="attribute in ATTRIBUTES" :key="attribute" class="setup-attribute">
                <label :for="`setup-${current}-${attribute}`">{{ attributeLabels[attribute] }}</label>
                <NumberInput v-model="progress.invested[attribute]" :inputId="`setup-${current}-${attribute}`" :label="attributeLabels[attribute]" :max="99" :disabled="isBlocked" />
              </div>
            </div>
          </div>
          <p v-if="error" role="alert" class="setup-error">{{ error }}</p>
          <div class="setup-actions">
            <Button type="button" severity="secondary" text :disabled="isBlocked" @click="back"><ArrowLeft :size="17" aria-hidden="true" /><span>Back</span></Button>
            <Button type="submit" :disabled="isBlocked || (current === 'party' && !selected.length)"><span>{{ lastStep ? 'Create playthrough' : 'Continue' }}</span><ArrowRight :size="17" aria-hidden="true" /></Button>
          </div>
        </form>
      </section>
    </template>
  </Card>
</template>

<style>
.setup-card.p-card { width: min(100%, 680px); margin: 46px auto 0; background: var(--card-bg); border: 1px solid var(--page-line); border-radius: 8px; color: var(--card-fg); box-shadow: none; }
.setup-card .p-card-body, .setup-card .p-card-content { padding: 0; }
.setup-panel { padding: clamp(24px, 5vw, 42px); }
.setup-panel__intro { margin-bottom: 30px; }
.setup-card .section-kicker { color: var(--gold-strong); }
.setup-panel h2 { margin: 12px 0; color: var(--card-fg); font-family: var(--display); font-size: clamp(2rem, 5vw, 2.8rem); font-weight: 400; letter-spacing: .01em; line-height: 1.15; }
.setup-panel h2:focus { outline: none; }
.setup-panel__intro p { margin: 0; color: var(--card-muted); line-height: 1.65; font-size: .9rem; }
.starting-choices { display: grid; gap: 12px; }
.starting-choices button { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px; text-align: left; border: 1px solid var(--card-line); border-radius: 6px; background: var(--card-control-bg); color: var(--card-fg); cursor: pointer; }
.starting-choices button:hover:enabled { border-color: var(--gold); background: var(--card-accent-bg); }
.starting-choices button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.starting-choices strong { display: block; font-size: 1rem; }
.starting-choices small { display: block; margin-top: 7px; color: var(--card-muted); line-height: 1.5; }
.starting-choices svg { flex-shrink: 0; color: var(--gold-strong); }
.starting-choices button:disabled { opacity: .5; cursor: default; }
.setup-field { display: grid; gap: 10px; margin: 15px 0; min-width: 0; color: var(--card-muted); font-size: .78rem; font-weight: 600; }
.setup-field .p-inputtext { width: 100%; background: var(--card-control-bg); color: var(--card-control-fg); border-color: var(--card-line); border-radius: 6px; }
.setup-field .p-inputtext:enabled:focus { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
.initial-characters { padding: 0; margin: 0; border: 0; }
.character-choice { display: flex; align-items: center; gap: 16px; padding: 15px 0; border-bottom: 1px solid var(--card-line); }
.character-choice label { display: flex; align-items: center; gap: 16px; flex: 1; min-height: 48px; cursor: pointer; font-weight: 600; }
.character-choice img { border-radius: 6px; object-fit: cover; }
.catch-up__fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-bottom: 14px; }
.setup-attribute { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 0; border-top: 1px solid var(--card-line); }
.setup-attribute label { color: var(--card-fg); font-size: .86rem; }
.setup-attribute .number-input { width: 160px; flex: 0 0 160px; }
.setup-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 30px; }
.setup-actions .p-button { min-height: 44px; border-radius: 6px; }
.setup-actions .p-button:not(.p-button-text) { background: var(--gold); border-color: var(--gold); color: var(--button-fg); }
.setup-actions .p-button-text { color: var(--card-muted); }
.setup-error { color: var(--p-red-500); font-size: .85rem; line-height: 1.5; }
@media (max-width: 560px) {
  .setup-card.p-card { margin-top: 28px; }
  .setup-panel { padding: 24px 20px; }
  .starting-choices button { padding: 18px 16px; }
  .catch-up__fields { grid-template-columns: 1fr; gap: 0; }
}
</style>
