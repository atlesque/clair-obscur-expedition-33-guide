<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { Check, Sparkles } from '@lucide/vue';
import NumberInput from './NumberInput.vue';
import { activeParty } from '../domain/lumina';
import type { Playthrough } from '../domain/types';

const props = defineProps<{ playthrough: Playthrough }>();
const emit = defineEmits<{ save: [colours: number]; suggest: []; confirm: []; dismiss: [] }>();
const editing = ref(false);
const draft = ref(0);
const colours = computed(() => props.playthrough.colours ?? 0);
const party = computed(() => activeParty(props.playthrough.characters));
const plan = computed(() => props.playthrough.colourPlan);
const handout = computed(() => Object.entries(plan.value?.give ?? {}).filter(([, amount]) => amount > 0)
  .map(([id, amount]) => ({ id, amount, name: props.playthrough.characters.find(item => item.id === id)?.name ?? id })));

function edit() { draft.value = colours.value; editing.value = true; }
function save() { emit('save', draft.value); editing.value = false; }
</script>

<template>
  <section class="colour-panel" aria-labelledby="colour-title">
    <div class="colour-panel__head">
      <Sparkles :size="18" :strokeWidth="1.8" aria-hidden="true" />
      <div>
        <h2 id="colour-title">Colours of Lumina</h2>
        <p v-if="party.length">Active combat party: {{ party.map(item => item.name).join(', ') }}</p>
        <p v-else>Mark who is fighting on their card so Colours go to them first.</p>
      </div>
    </div>
    <form v-if="editing" novalidate class="colour-panel__edit" @submit.prevent="save">
      <label for="colour-count-input">Unused Colours of Lumina</label>
      <NumberInput v-model="draft" inputId="colour-count-input" label="Unused Colours of Lumina" :max="999" />
      <div class="colour-panel__actions">
        <Button type="button" label="Cancel" severity="secondary" text @click="editing = false" />
        <Button type="submit"><Check :size="17" aria-hidden="true" /><span>Save</span></Button>
      </div>
    </form>
    <template v-else>
      <p class="colour-panel__count"><strong>{{ colours }}</strong> unused</p>
      <Message v-if="plan" severity="warn" :closable="false" class="recommendation">
        <strong>Pending Colour plan</strong>
        <span class="recommendation__spend">
          <span v-for="item in handout" :key="item.id">+{{ item.amount }} {{ item.name }}</span>
        </span>
        <small>{{ plan.explanation }}</small>
      </Message>
      <div class="colour-panel__actions">
        <Button label="Update Colours" severity="secondary" outlined @click="edit" />
        <Button label="Suggest how to spend" :disabled="!colours" @click="emit('suggest')" />
        <Button v-if="plan && handout.length" label="I've used these" @click="emit('confirm')" />
        <Button v-if="plan" label="Dismiss plan" severity="secondary" text @click="emit('dismiss')" />
      </div>
    </template>
  </section>
</template>

<style>
.colour-panel { margin-top: 18px; padding: 25px; background: var(--card-bg); border: 1px solid var(--page-line); border-radius: 8px; color: var(--card-fg); }
.colour-panel__head { display: flex; align-items: flex-start; gap: 12px; color: var(--gold-strong); }
.colour-panel__head > svg { flex: 0 0 auto; margin-top: 6px; }
.colour-panel h2 { margin: 0; color: var(--card-fg); font-family: var(--display); font-size: 1.5rem; font-weight: 400; }
.colour-panel__head p { margin: 4px 0 0; color: var(--card-muted); font-size: .8rem; line-height: 1.5; }
.colour-panel__count { margin: 16px 0; color: var(--card-muted); font-size: .85rem; }
.colour-panel__count strong { color: var(--card-fg); font-family: var(--display); font-size: 1.55rem; font-weight: 400; }
.colour-panel__edit { display: grid; gap: 8px; max-width: 320px; margin-top: 16px; color: var(--card-muted); font-size: .78rem; font-weight: 700; }
.colour-panel__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.colour-panel__actions .p-button { min-height: 38px; border-radius: 6px; font-size: .79rem; }
.colour-panel__actions .p-button:not(.p-button-outlined):not(.p-button-text) { background: var(--gold); border-color: var(--gold); color: var(--button-fg); }
.colour-panel__actions .p-button.p-button-outlined { border-color: var(--card-line); color: var(--card-fg); }
.colour-panel__actions .p-button.p-button-text { color: var(--card-muted); }
@media (max-width: 560px) { .colour-panel { padding: 21px; } .colour-panel__actions .p-button { flex: 1 1 100%; } }
</style>
