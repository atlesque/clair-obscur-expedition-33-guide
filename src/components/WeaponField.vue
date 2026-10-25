<script setup lang="ts">
import { computed, ref } from 'vue';
import NumberInput from './NumberInput.vue';
import { MAX_WEAPON_LEVEL, WEAPON_SEARCH_MIN_LENGTH, searchWeapons } from '../domain/weapons';
import type { CharacterId } from '../domain/types';
// Leave `level` unbound to hide the weapon level field (a new expedition's weapons are all level 1).
const props = withDefaults(defineProps<{ modelValue?: string; level?: number; characterId: CharacterId; inputId?: string; disabled?: boolean }>(), { modelValue: '', level: undefined, inputId: 'equipped-weapon', disabled: false });
const emit = defineEmits<{ 'update:modelValue': [value: string]; 'update:level': [value: number] }>();
const searchTerm = ref('');
// Suggestions only appear after a few typed letters, so the full arsenal is never listed up front.
const suggestions = computed(() => searchWeapons(props.characterId, searchTerm.value).map(weapon => weapon.name));
</script>

<template>
  <div class="weapon-field grid gap-5">
    <UFormField :key="inputId" label="Equipped weapon" :help="`Search starts after ${WEAPON_SEARCH_MIN_LENGTH} letters to keep unfound weapons hidden.`">
      <UInputMenu
        :id="inputId"
        v-model:search-term="searchTerm"
        :modelValue="modelValue"
        :items="suggestions"
        :disabled="disabled"
        ignore-filter
        :clear="{ 'aria-label': 'Clear equipped weapon' }"
        trailing-icon=""
        autocomplete="off"
        required
        maxlength="120"
        placeholder="Type the first 3 letters"
        class="w-full"
        @update:modelValue="emit('update:modelValue', typeof $event === 'string' ? $event : '')"
        @clear="emit('update:modelValue', '')"
      >
        <template #empty>{{ searchTerm.trim().length < WEAPON_SEARCH_MIN_LENGTH ? `Keep typing: ${WEAPON_SEARCH_MIN_LENGTH} letters to search` : 'No matching weapon for this character' }}</template>
      </UInputMenu>
    </UFormField>
    <UFormField v-if="level !== undefined" label="Weapon level">
      <NumberInput :modelValue="level" :inputId="`${inputId}-level`" label="Weapon level" :min="1" :max="MAX_WEAPON_LEVEL" :disabled="disabled" @update:modelValue="emit('update:level', $event)" />
    </UFormField>
  </div>
</template>
