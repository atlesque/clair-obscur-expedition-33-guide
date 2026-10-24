<script setup lang="ts">
import WeaponField from './WeaponField.vue';
import NumberInput from './NumberInput.vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels } from '../domain/data';
import { weaponScaling } from '../domain/weapons';
import type { CharacterId } from '../domain/types';
import type { SetupProgress } from '../domain/setup-url';
import { computed } from 'vue';
const props = defineProps<{ draft: SetupProgress; characterId: CharacterId }>();
const scaling = computed(() => weaponScaling(props.characterId, props.draft.weapon));
</script>

<template>
  <WeaponField v-model="draft.weapon" :characterId="characterId" />
  <div class="field">
    <label for="current-level-input">Current level</label>
    <NumberInput v-model="draft.level" inputId="current-level-input" label="Current level" :min="1" :max="99" />
  </div>
  <div class="field">
    <label for="available-points-input">Available attribute points</label>
    <NumberInput v-model="draft.points" inputId="available-points-input" label="Available attribute points" />
  </div>
  <div class="attribute-grid">
    <div v-for="attribute in ATTRIBUTES" :key="attribute" class="attribute-row" :class="{ 'is-scaling': scaling[attribute] }">
      <label :for="`edit-${attribute}`">{{ attributeLabels[attribute] }}<span v-if="scaling[attribute]" class="scaling-grade" aria-hidden="true" :title="`Weapon scales with ${attributeLabels[attribute]} (grade ${scaling[attribute]} at weapon level 33)`">{{ scaling[attribute] }}</span></label>
      <NumberInput v-model="draft.invested[attribute]" :inputId="`edit-${attribute}`" :label="attributeLabels[attribute]" :max="99" />
    </div>
  </div>
</template>
