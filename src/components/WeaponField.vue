<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import { ref } from 'vue';
import NumberInput from './NumberInput.vue';
import { MAX_WEAPON_LEVEL, WEAPON_SEARCH_MIN_LENGTH, searchWeapons } from '../domain/weapons';
import type { CharacterId } from '../domain/types';
// Leave `level` unbound to hide the weapon level field (a new expedition's weapons are all level 1).
const props = withDefaults(defineProps<{ modelValue?: string; level?: number; characterId: CharacterId; inputId?: string; disabled?: boolean }>(), { modelValue: '', level: undefined, inputId: 'equipped-weapon', disabled: false });
defineEmits<{ 'update:modelValue': [value: string]; 'update:level': [value: number] }>();
const suggestions = ref<string[]>([]);
// Suggestions only appear after a few typed letters, so the full arsenal is never listed up front.
const search = (query: string) => { suggestions.value = searchWeapons(props.characterId, query).map(weapon => weapon.name); };
</script>

<template>
  <div class="weapon-field">
    <label :for="inputId">Equipped weapon</label>
    <AutoComplete
      :inputId="inputId"
      :modelValue="modelValue"
      :suggestions="suggestions"
      :minLength="WEAPON_SEARCH_MIN_LENGTH"
      :delay="0"
      :disabled="disabled"
      forceSelection
      autoOptionFocus
      :inputProps="{ autocomplete: 'off', required: true, maxlength: 120, 'aria-describedby': `${inputId}-help` }"
      placeholder="Type the first 3 letters"
      @complete="search($event.query)"
      @update:modelValue="$emit('update:modelValue', typeof $event === 'string' ? $event : '')"
    />
    <small :id="`${inputId}-help`">Search starts after {{ WEAPON_SEARCH_MIN_LENGTH }} letters to keep unfound weapons hidden.</small>
    <template v-if="level !== undefined">
      <label :for="`${inputId}-level`">Weapon level</label>
      <NumberInput :modelValue="level" :inputId="`${inputId}-level`" label="Weapon level" :min="1" :max="MAX_WEAPON_LEVEL" :disabled="disabled" @update:modelValue="$emit('update:level', $event)" />
    </template>
  </div>
</template>

<style>
.weapon-field { display: grid; gap: 9px; margin: 14px 0 24px; }
.weapon-field label { color: var(--card-muted); font-size: .78rem; font-weight: 600; }
.weapon-field label span { color: var(--gold-strong); }
.weapon-field small { color: var(--card-muted); font-size: .72rem; }
.weapon-field small + label { margin-top: 8px; }
.weapon-field .p-autocomplete { width: 100%; }
.weapon-field .p-inputtext { width: 100%; min-height: 44px; border-color: var(--card-line); border-radius: 6px; background: var(--card-control-bg); color: var(--card-control-fg); }
.weapon-field .p-inputtext::placeholder { color: var(--card-control-placeholder); }
.weapon-field .p-inputtext:enabled:focus { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
</style>
