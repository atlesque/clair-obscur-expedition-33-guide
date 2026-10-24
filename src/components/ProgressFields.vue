<script setup lang="ts">
import WeaponField from './WeaponField.vue';
import NumberInput from './NumberInput.vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels } from '../domain/data';
import type { SetupProgress } from '../domain/setup-url';
defineProps<{ draft: SetupProgress }>();
</script>

<template>
  <WeaponField v-model="draft.weapon" />
  <div class="field">
    <label for="current-level-input">Current level</label>
    <NumberInput v-model="draft.level" inputId="current-level-input" label="Current level" :min="1" :max="99" />
  </div>
  <div class="field">
    <label for="available-points-input">Available attribute points</label>
    <NumberInput v-model="draft.points" inputId="available-points-input" label="Available attribute points" />
  </div>
  <div class="attribute-grid">
    <div v-for="attribute in ATTRIBUTES" :key="attribute" class="attribute-row">
      <label :for="`edit-${attribute}`">{{ attributeLabels[attribute] }}</label>
      <NumberInput v-model="draft.invested[attribute]" :inputId="`edit-${attribute}`" :label="attributeLabels[attribute]" :max="99" />
    </div>
  </div>
</template>
