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
  <div class="field">
    <label for="current-level-input">Current level</label>
    <NumberInput v-model="draft.level" inputId="current-level-input" label="Current level" :min="1" :max="99" />
  </div>
  <div class="field">
    <label for="available-points-input">Available attribute points</label>
    <NumberInput v-model="draft.points" inputId="available-points-input" label="Available attribute points" />
  </div>
  <div v-if="draft.lumina" class="lumina-fields">
    <div class="field">
      <label for="lumina-total-input">Total Lumina points</label>
      <NumberInput v-model="draft.lumina.total" inputId="lumina-total-input" label="Total Lumina points" :max="MAX_LUMINA_POINTS" />
    </div>
    <div class="field">
      <label for="lumina-spent-input">Spent Lumina points</label>
      <NumberInput v-model="draft.lumina.spent" inputId="lumina-spent-input" label="Spent Lumina points" :max="MAX_LUMINA_POINTS" />
    </div>
  </div>
  <div class="attribute-grid">
    <div v-for="attribute in ATTRIBUTES" :key="attribute" class="attribute-row" :class="{ 'is-scaling': scaling[attribute] }">
      <label :for="`edit-${attribute}`">{{ attributeLabels[attribute] }}<span v-if="scaling[attribute]" class="scaling-grade" aria-hidden="true" :title="`Weapon scales with ${attributeLabels[attribute]} (grade ${scaling[attribute]})`">{{ scaling[attribute] }}</span></label>
      <NumberInput v-model="draft.invested[attribute]" :inputId="`edit-${attribute}`" :label="attributeLabels[attribute]" :max="99" />
    </div>
  </div>
</template>

<style>
.lumina-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 18px; }
@media (max-width: 560px) { .lumina-fields { grid-template-columns: 1fr; } }
</style>
