<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import FocusDialog from './FocusDialog.vue';
import ProgressFields from './ProgressFields.vue';
import Recommendation from './Recommendation.vue';
import { attributeLabels } from '../domain/data';
import { emptyAttributes } from '../domain/types';
import type { Attribute, Character } from '../domain/types';
import type { SetupProgress } from '../domain/setup-url';

const props = defineProps<{
  mode: 'update' | 'advice';
  characters: Character[];
  saveProgress: (character: Character, progress: SetupProgress) => boolean;
  prepareAdvice: (character: Character) => boolean;
  applyAdvice: (character: Character) => boolean;
}>();
const emit = defineEmits<{ close: []; complete: [] }>();
const ids = props.characters.map(character => character.id);
const index = ref(0);
const error = ref('');
const stepLabel = ref<HTMLElement | null>(null);
const draft = ref<SetupProgress>({ level: 1, points: 0, invested: emptyAttributes() });
const character = computed(() => props.characters.find(item => item.id === ids[index.value]));
const last = computed(() => index.value === ids.length - 1);
const title = computed(() => character.value ? `${props.mode === 'update' ? 'Update' : 'Advice for'} ${character.value.name}` : 'Party wizard');
const spend = computed(() => Object.entries(character.value?.pending?.spend ?? {}).map(([attribute, amount]) => `+${amount} ${attributeLabels[attribute as Attribute]}`));

function prepare() {
  if (!character.value) return;
  error.value = '';
  try {
    if (!props.prepareAdvice(character.value)) error.value = 'Could not save this recommendation. Retry before continuing.';
  } catch (e) { error.value = e instanceof Error ? e.message : 'Could not prepare advice.'; }
}
function next() {
  if (last.value) emit('complete');
  else index.value++;
}
function save() {
  if (!character.value) return;
  error.value = '';
  try {
    if (props.saveProgress(character.value, draft.value)) next();
    else error.value = 'Could not save progress. Your entries are kept here; try again.';
  } catch (e) { error.value = e instanceof Error ? e.message : 'Enter valid in-game progress.'; }
}
function apply() {
  if (!character.value) return;
  error.value = '';
  if (props.applyAdvice(character.value)) next();
  else error.value = 'Could not apply this advice. Check your progress or try again.';
}
watch(() => character.value?.id, async () => {
  if (!character.value) return;
  error.value = '';
  draft.value = { level: character.value.level, points: character.value.points, invested: { ...character.value.invested }, weapon: character.value.weapon ?? '', weaponLevel: character.value.weaponLevel ?? 1, lumina: { ...(character.value.lumina ?? { total: 0, spent: 0 }) } };
  if (props.mode === 'advice') prepare();
  await nextTick();
  if (props.mode === 'update') document.getElementById(character.value?.weapon ? 'current-level-input' : 'equipped-weapon')?.focus();
  else stepLabel.value?.focus();
}, { immediate: true });
</script>

<template>
  <FocusDialog :title="title" @close="emit('close')">
    <div class="dialog-intro mb-5 grid gap-2">
      <p ref="stepLabel" tabindex="-1" class="section-kicker wizard-step text-primary outline-none" aria-live="polite">Character {{ index + 1 }} of {{ ids.length }}</p>
      <p v-if="mode === 'update'" class="text-muted">Enter what is true in-game. Each character is saved as you go; cancelling keeps completed updates.</p>
      <p v-else class="text-muted">Review one character at a time. Points are recorded as spent only when you confirm you’ve applied the advice.</p>
    </div>
    <UAlert v-if="error" role="alert" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" class="dialog-error mb-4" />
    <template v-if="character">
      <form v-if="mode === 'update'" novalidate class="dialog-form grid gap-5" @submit.prevent="save">
        <ProgressFields :draft="draft" :characterId="character.id" />
        <div class="dialog-actions flex flex-wrap justify-end gap-2">
          <UButton type="button" label="Cancel" color="neutral" variant="ghost" @click="emit('close')" />
          <UButton type="button" label="Skip character" color="neutral" variant="outline" @click="next" />
          <UButton type="submit" icon="i-lucide-check" :label="last ? 'Save and finish' : 'Save and next'" />
        </div>
      </form>
      <template v-else>
        <Recommendation v-if="character.pending" title="Pending recommendation" :items="spend" :explanation="character.pending.explanation" :notes="character.pending.notes" />
        <div class="dialog-actions mt-6 flex flex-wrap justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="emit('close')" />
          <UButton v-if="error" label="Retry advice" color="neutral" variant="outline" @click="prepare" />
          <UButton v-if="character.pending && !error" :label="last ? 'Finish' : 'Next character'" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right" @click="next" />
          <UButton v-if="character.pending && character.pending.points > 0 && !error" label="I've applied these" @click="apply" />
        </div>
      </template>
    </template>
    <div v-else class="dialog-actions flex justify-end"><UButton label="Close wizard" @click="emit('close')" /></div>
  </FocusDialog>
</template>
