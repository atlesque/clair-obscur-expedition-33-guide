<script setup lang="ts">
import WeaponField from './WeaponField.vue';
import NumberInput from './NumberInput.vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels } from '../domain/data';
import { weaponScaling } from '../domain/weapons';
import { MAX_LUMINA_POINTS } from '../domain/lumina';
import type { CharacterId } from '../domain/types';
import type { SetupProgress } from '../domain/setup-url';
import { computed } from 'vue';
const props = defineProps<{ draft: SetupProgress; characterId: CharacterId }>();
const scaling = computed(() => weaponScaling(props.characterId, props.draft.weapon, props.draft.weaponLevel));
</script>

<template>
  <WeaponField v-model="draft.weapon" :level="draft.weaponLevel ?? 1" @update:level="draft.weaponLevel = $event" :characterId="characterId" />
  <div class="grid gap-5 sm:grid-cols-2">
    <UFormField label="Current level">
      <NumberInput v-model="draft.level" inputId="current-level-input" label="Current level" :min="1" :max="99" />
    </UFormField>
    <UFormField label="Available attribute points">
      <NumberInput v-model="draft.points" inputId="available-points-input" label="Available attribute points" />
    </UFormField>
    <template v-if="draft.lumina">
      <UFormField label="Total Lumina points">
        <NumberInput v-model="draft.lumina.total" inputId="lumina-total-input" label="Total Lumina points" :max="MAX_LUMINA_POINTS" />
      </UFormField>
      <UFormField label="Spent Lumina points">
        <NumberInput v-model="draft.lumina.spent" inputId="lumina-spent-input" label="Spent Lumina points" :max="MAX_LUMINA_POINTS" />
      </UFormField>
    </template>
  </div>
  <div class="attribute-grid grid divide-y divide-default border-y border-default">
    <div v-for="attribute in ATTRIBUTES" :key="attribute" class="attribute-row flex items-center justify-between gap-4 py-2.5" :class="{ 'is-scaling': scaling[attribute] }">
      <label :for="`edit-${attribute}`" class="text-sm text-default">{{ attributeLabels[attribute] }}<span v-if="scaling[attribute]" class="scaling-grade" aria-hidden="true" :title="`Weapon scales with ${attributeLabels[attribute]} (grade ${scaling[attribute]})`">{{ scaling[attribute] }}</span></label>
      <div class="w-40 shrink-0"><NumberInput v-model="draft.invested[attribute]" :inputId="`edit-${attribute}`" :label="attributeLabels[attribute]" :max="99" /></div>
    </div>
  </div>
</template>
