<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { ArrowRight, Check } from '@lucide/vue';
import FocusDialog from './FocusDialog.vue';
import ProgressFields from './ProgressFields.vue';
import { attributeLabels } from '../domain/data';
import { emptyAttributes } from '../domain/types';
import type { Character } from '../domain/types';
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
    <div class="dialog-intro">
      <p ref="stepLabel" tabindex="-1" class="section-kicker wizard-step" aria-live="polite">Character {{ index + 1 }} of {{ ids.length }}</p>
      <p v-if="mode === 'update'">Enter what is true in-game. Each character is saved as you go; cancelling keeps completed updates.</p>
      <p v-else>Review one character at a time. Points are recorded as spent only when you confirm you’ve applied the advice.</p>
    </div>
    <Message v-if="error" severity="error" :closable="false" class="dialog-error">{{ error }}</Message>
    <template v-if="character">
      <form v-if="mode === 'update'" novalidate class="dialog-form" @submit.prevent="save">
        <ProgressFields :draft="draft" :characterId="character.id" />
        <div class="dialog-actions">
          <Button type="button" label="Cancel" severity="secondary" text @click="emit('close')" />
          <Button type="button" label="Skip character" severity="secondary" outlined @click="next" />
          <Button type="submit"><Check :size="17" aria-hidden="true" /><span>{{ last ? 'Save and finish' : 'Save and next' }}</span></Button>
        </div>
      </form>
      <template v-else>
        <Message v-if="character.pending" severity="warn" :closable="false" class="recommendation">
          <strong>Pending recommendation</strong>
          <span class="recommendation__spend">
            <span v-for="(amount, attribute) in character.pending.spend" :key="attribute">+{{ amount }} {{ attributeLabels[attribute] }}</span>
          </span>
          <small>{{ character.pending.explanation }}</small>
        </Message>
        <div class="dialog-actions">
          <Button label="Cancel" severity="secondary" text @click="emit('close')" />
          <Button v-if="error" label="Retry advice" severity="secondary" outlined @click="prepare" />
          <Button v-if="character.pending && !error" :label="last ? 'Finish' : 'Next character'" severity="secondary" outlined @click="next"><span>{{ last ? 'Finish' : 'Next character' }}</span><ArrowRight :size="17" aria-hidden="true" /></Button>
          <Button v-if="character.pending && character.pending.points > 0 && !error" label="I've applied these" @click="apply" />
        </div>
      </template>
    </template>
    <div v-else class="dialog-actions"><Button label="Close wizard" @click="emit('close')" /></div>
  </FocusDialog>
</template>

<style>
.wizard-step:focus { outline: none; }
</style>
