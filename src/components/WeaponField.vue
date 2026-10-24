<script setup lang="ts">
import InputText from 'primevue/inputtext';
withDefaults(defineProps<{ modelValue?: string; inputId?: string; disabled?: boolean }>(), { modelValue: '', inputId: 'equipped-weapon', disabled: false });
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="weapon-field">
    <label :for="inputId">Equipped weapon</label>
    <InputText :id="inputId" :modelValue="modelValue" :disabled="disabled" required :maxlength="120" autocomplete="off" placeholder="Name shown in-game" @update:modelValue="$emit('update:modelValue', $event ?? '')" />
  </div>
</template>

<style>
.weapon-field { display: grid; gap: 9px; margin: 14px 0 24px; }
.weapon-field label { color: var(--card-muted); font-size: .78rem; font-weight: 600; }
.weapon-field label span { color: var(--gold-strong); }
.weapon-field .p-inputtext { width: 100%; min-height: 44px; border-color: var(--card-line); border-radius: 6px; background: var(--card-control-bg); color: var(--card-control-fg); }
.weapon-field .p-inputtext::placeholder { color: var(--card-control-placeholder); }
.weapon-field .p-inputtext:enabled:focus { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
</style>
