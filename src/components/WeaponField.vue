<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import { ref } from 'vue';
import { WEAPON_SEARCH_MIN_LENGTH, searchWeapons } from '../domain/weapons';
import type { CharacterId } from '../domain/types';
const props = withDefaults(defineProps<{ modelValue?: string; characterId: CharacterId; inputId?: string; disabled?: boolean }>(), { modelValue: '', inputId: 'equipped-weapon', disabled: false });
defineEmits<{ 'update:modelValue': [value: string] }>();
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
  </div>
</template>

<style>
.weapon-field { display: grid; gap: 9px; margin: 14px 0 24px; }
.weapon-field label { color: var(--card-muted); font-size: .78rem; font-weight: 600; }
.weapon-field label span { color: var(--gold-strong); }
.weapon-field small { color: var(--card-muted); font-size: .72rem; }
.weapon-field .p-autocomplete { width: 100%; }
.weapon-field .p-inputtext { width: 100%; min-height: 44px; border-color: var(--card-line); border-radius: 6px; background: var(--card-control-bg); color: var(--card-control-fg); }
.weapon-field .p-inputtext::placeholder { color: var(--card-control-placeholder); }
.weapon-field .p-inputtext:enabled:focus { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
</style>
