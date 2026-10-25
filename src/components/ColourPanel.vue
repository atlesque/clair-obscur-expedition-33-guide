<script setup lang="ts">
import { computed, ref } from 'vue';
import NumberInput from './NumberInput.vue';
import Recommendation from './Recommendation.vue';
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
  <UCard as="section" class="colour-panel" aria-labelledby="colour-title" :ui="{ body: 'grid gap-5 p-5 sm:p-6' }">
    <div class="flex items-start gap-3">
      <UIcon name="i-lucide-sparkles" class="mt-2 size-5 shrink-0 text-primary" />
      <div class="grid gap-1">
        <h2 id="colour-title" class="text-2xl text-highlighted">Colours of Lumina</h2>
        <p v-if="party.length" class="text-sm text-muted">Active combat party: {{ party.map(item => item.name).join(', ') }}</p>
        <p v-else class="text-sm text-muted">Mark who is fighting on their card so Colours go to them first.</p>
      </div>
    </div>
    <form v-if="editing" novalidate class="grid max-w-xs gap-4" @submit.prevent="save">
      <UFormField label="Unused Colours of Lumina">
        <NumberInput v-model="draft" inputId="colour-count-input" label="Unused Colours of Lumina" :max="999" />
      </UFormField>
      <div class="flex flex-wrap gap-2">
        <UButton type="button" label="Cancel" color="neutral" variant="ghost" @click="editing = false" />
        <UButton type="submit" icon="i-lucide-check" label="Save" />
      </div>
    </form>
    <template v-else>
      <p class="colour-panel__count text-sm text-muted"><strong class="font-display text-3xl font-normal text-highlighted tabular-nums">{{ colours }}</strong> unused</p>
      <Recommendation v-if="plan" title="Pending Colour plan" :items="handout.map(item => `+${item.amount} ${item.name}`)" :explanation="plan.explanation" />
      <div class="flex flex-wrap gap-2">
        <UButton label="Update Colours" color="neutral" variant="outline" @click="edit" />
        <UButton label="Suggest how to spend" :variant="plan ? 'outline' : 'solid'" :disabled="!colours" @click="emit('suggest')" />
        <UButton v-if="plan && handout.length" label="I've used these" icon="i-lucide-check" @click="emit('confirm')" />
        <UButton v-if="plan" label="Dismiss plan" color="neutral" variant="ghost" @click="emit('dismiss')" />
      </div>
    </template>
  </UCard>
</template>
