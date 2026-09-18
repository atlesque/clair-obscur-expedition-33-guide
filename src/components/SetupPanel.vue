<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Fieldset from 'primevue/fieldset';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { ArrowRight } from '@lucide/vue';
import { INITIAL_CHARACTERS } from '../domain/data';
import { ATTRIBUTES, emptyAttributes } from '../domain/types';
import type { Attributes } from '../domain/types';

const props = defineProps<{ name: string; selected: string[]; disabled: boolean; blocked: boolean }>();
const emit = defineEmits<{
  'update:name': [value: string];
  'update:selected': [value: string[]];
  start: [value: Record<string, { level: number; points: number; invested: Attributes } | null>];
}>();

const midway = ref(false);
const drafts = ref<Record<string, { level: number; points: number; invested: Attributes } | undefined>>({});
const isBlocked = computed(() => props.blocked || props.disabled || !props.selected.length);

function ensureDraft(key: string) {
  if (!drafts.value[key]) drafts.value[key] = { level: 1, points: 0, invested: emptyAttributes() };
}

function setMidway(value: boolean) {
  midway.value = value;
  if (value) props.selected.forEach(ensureDraft);
}

function toggleCharacter(key: string, checked: boolean) {
  const next = checked ? [...props.selected, key] : props.selected.filter((value) => value !== key);
  emit('update:selected', [...new Set(next)]);
  if (checked && midway.value) ensureDraft(key);
}

function setDraft(key: string, field: 'level' | 'points', value: number | null) {
  ensureDraft(key);
  drafts.value[key]![field] = value ?? 0;
}

function setAttribute(key: string, attribute: keyof Attributes, value: number | null) {
  ensureDraft(key);
  drafts.value[key]!.invested[attribute] = value ?? 0;
}

function setName(value: string | undefined) {
  emit('update:name', value ?? '');
}

function start() {
  emit('start', midway.value ? (drafts.value as Record<string, { level: number; points: number; invested: Attributes } | null>) : {});
}

watch(
  () => props.selected,
  (value) => {
    for (const key of Object.keys(drafts.value)) if (!value.includes(key)) delete drafts.value[key];
    if (midway.value) value.forEach(ensureDraft);
  },
  { deep: true },
);
</script>

<template>
  <Card class="setup-card">
    <template #content>
      <section class="setup-panel" aria-labelledby="setup-title">
        <div class="setup-panel__intro">
          <span class="section-kicker">First entry</span>
          <h2 id="setup-title">Start a playthrough</h2>
          <p>Name this run and choose only the characters you want to track now.</p>
        </div>

        <label for="playthrough-name" class="setup-field">
          <span>Playthrough name</span>
          <InputText id="playthrough-name" :modelValue="props.name" :disabled="props.disabled" autocomplete="off" @update:modelValue="setName" />
        </label>

        <Fieldset legend="Initial characters" class="initial-characters">
          <p class="fieldset-help">Choose at least one. These are the only identities shown before you ask to reveal another.</p>
          <div v-for="(character, key) in INITIAL_CHARACTERS" :key="key" class="character-choice">
            <Checkbox :inputId="`initial-${key}`" :modelValue="props.selected.includes(key)" binary :disabled="props.disabled" @update:modelValue="toggleCharacter(key, $event)" />
            <div>
              <label :for="`initial-${key}`">{{ character.name }}</label>
              <small>Verified level-one defaults</small>
            </div>
          </div>
        </Fieldset>

        <div class="midway-choice">
          <Checkbox inputId="midway-entry" :modelValue="midway" binary :disabled="props.disabled" @update:modelValue="setMidway($event)" />
          <label for="midway-entry">I am joining this playthrough midway</label>
        </div>

        <div v-if="midway" class="catch-up">
          <div v-for="key in selected" :key="key" class="catch-up__character">
            <div class="catch-up__heading">
              <span class="section-kicker">Actual progress</span>
              <h3>{{ INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS].name }}</h3>
            </div>
            <div class="catch-up__fields">
              <label :for="`setup-level-${key}`" class="setup-field">
                <span>Current level</span>
                <InputNumber :inputId="`setup-level-${key}`" :modelValue="drafts[key]?.level ?? 1" :min="1" :max="99" :useGrouping="false" @update:modelValue="setDraft(key, 'level', $event)" />
              </label>
              <label :for="`setup-points-${key}`" class="setup-field">
                <span>Available attribute points</span>
                <InputNumber :inputId="`setup-points-${key}`" :modelValue="drafts[key]?.points ?? 0" :min="0" :useGrouping="false" @update:modelValue="setDraft(key, 'points', $event)" />
              </label>
            </div>
            <div class="catch-up__attributes">
              <label v-for="attribute in ATTRIBUTES" :key="attribute" :for="`setup-${key}-${attribute}`" class="setup-field">
                <span>{{ attribute }}</span>
                <InputNumber :inputId="`setup-${key}-${attribute}`" :modelValue="drafts[key]?.invested[attribute] ?? 0" :min="0" :max="99" :useGrouping="false" @update:modelValue="setAttribute(key, attribute, $event)" />
              </label>
            </div>
          </div>
        </div>

        <Button class="setup-submit" :disabled="isBlocked" :pt="isBlocked ? { root: { disabled: true } } : undefined" @click="start">
          <span>Create playthrough</span>
          <ArrowRight :size="17" :strokeWidth="1.8" aria-hidden="true" />
        </Button>
      </section>
    </template>
  </Card>
</template>

<style>
.setup-card.p-card { margin-top: 46px; background: var(--card-bg); border: 0; border-radius: 2px; color: var(--card-fg); box-shadow: 8px 10px 0 rgba(0,0,0,.12); }
.setup-card .p-card-body, .setup-card .p-card-content { padding: 0; }
.setup-panel { max-width: 760px; padding: clamp(24px, 5vw, 46px); }
.setup-panel__intro { margin-bottom: 30px; }
.setup-panel__intro .section-kicker, .setup-card .section-kicker { color: var(--copper-deep); }
.setup-panel h2 { margin: 8px 0 9px; color: var(--card-fg); font-family: var(--display); font-size: clamp(2.1rem, 5vw, 3.25rem); font-weight: 400; letter-spacing: -.06em; }
.setup-panel__intro p { max-width: 470px; margin: 0; color: var(--card-muted); line-height: 1.55; }
.setup-field { display: grid; gap: 8px; margin: 15px 0; color: var(--card-muted); font-size: .77rem; font-weight: 700; letter-spacing: .02em; }
.setup-field .p-inputtext, .setup-field .p-inputnumber { width: 100%; }
.setup-card .p-inputtext, .setup-card .p-inputnumber-input { border-color: var(--card-line); border-radius: 2px; background: var(--card-control-bg); color: var(--card-control-fg); }
.setup-card .p-inputtext::placeholder, .setup-card .p-inputnumber-input::placeholder { color: var(--card-control-placeholder); opacity: 1; }
.setup-card .p-inputtext:enabled:focus, .setup-card .p-inputnumber-input:enabled:focus { border-color: var(--copper); box-shadow: 0 0 0 1px var(--copper); }
.initial-characters.p-fieldset { margin: 28px 0 20px; border: 1px solid var(--card-line); border-radius: 2px; }
.initial-characters .p-fieldset-legend { padding: 0 10px; border: 0; border-radius: 0; background: var(--card-bg); color: var(--card-fg); font-family: var(--display); font-size: 1.25rem; font-weight: 400; }
.initial-characters .p-fieldset-content { padding: 8px 16px 15px; background: var(--card-control-bg); color: var(--card-control-fg); }
.fieldset-help { margin: 0 0 16px; color: var(--card-muted); font-size: .78rem; line-height: 1.5; }
.character-choice { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-top: 1px solid var(--card-line); }
.character-choice label, .midway-choice label { display: block; color: var(--card-fg); font-weight: 700; cursor: pointer; }
.character-choice small { display: block; margin-top: 3px; color: var(--card-muted); font-size: .72rem; }
.midway-choice { display: flex; align-items: center; gap: 12px; margin: 20px 0 0; }
.catch-up { margin-top: 24px; border-left: 2px solid var(--copper); }
.catch-up__character { padding: 4px 0 20px 20px; }
.catch-up__character + .catch-up__character { padding-top: 22px; border-top: 1px solid var(--card-line); }
.catch-up__heading h3 { margin: 5px 0 10px; color: var(--card-fg); font-family: var(--display); font-size: 1.65rem; font-weight: 400; letter-spacing: -.04em; }
.catch-up__fields, .catch-up__attributes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.catch-up__attributes { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.catch-up__attributes .setup-field { min-width: 0; }
.setup-submit.p-button { width: 100%; justify-content: center; min-height: 48px; margin-top: 28px; border-radius: 2px; background: var(--copper); border-color: var(--copper); color: #21130c; }
.setup-submit.p-button:not(:disabled):hover { background: var(--copper-deep); border-color: var(--copper-deep); }

@media (max-width: 560px) {
  .setup-card { margin-top: 32px; }
  .setup-panel { padding: 24px 19px; }
  .catch-up__attributes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
