<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue';

const props = withDefaults(defineProps<{
  modelValue: number; inputId: string; label: string; min?: number; max?: number; disabled?: boolean;
}>(), { min: 0, max: Number.MAX_SAFE_INTEGER, disabled: false });
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();

function step(amount: number) {
  if (props.disabled) return;
  emit('update:modelValue', Math.min(props.max, Math.max(props.min, (Number.isFinite(props.modelValue) ? props.modelValue : props.min) + amount)));
}
function enter(event: Event) {
  const input = event.target as HTMLInputElement;
  emit('update:modelValue', input.value === '' ? 0 : input.valueAsNumber);
}
</script>

<template>
  <div class="number-input" role="group" :aria-label="`${label} controls`">
    <button type="button" :aria-label="`Decrease ${label}`" :disabled="disabled || modelValue <= min" @click="step(-1)">
      <Minus :size="16" aria-hidden="true" />
    </button>
    <input :id="inputId" type="number" inputmode="numeric" :aria-label="label" :value="modelValue" :min="min" :max="max" step="1" :disabled="disabled" @input="enter" />
    <button type="button" :aria-label="`Increase ${label}`" :disabled="disabled || modelValue >= max" @click="step(1)">
      <Plus :size="16" aria-hidden="true" />
    </button>
  </div>
</template>

<style>
.number-input { display: flex; width: 100%; min-width: 0; border: 1px solid var(--card-line); border-radius: 6px; background: var(--card-control-bg); color: var(--card-control-fg); overflow: hidden; }
.number-input:focus-within { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
.number-input button { display: grid; place-items: center; flex: 0 0 44px; min-height: 44px; padding: 0; border: 0; background: transparent; color: var(--gold-strong); cursor: pointer; }
.number-input button:hover:enabled { background: var(--card-accent-bg); }
.number-input button:disabled { opacity: .3; cursor: default; }
.number-input button:focus-visible { outline: 2px solid var(--gold); outline-offset: -3px; }
.number-input input { width: 100%; min-width: 0; padding: 8px 2px; border: 0; outline: none; background: transparent; color: inherit; text-align: center; font-size: 1rem; font-weight: 600; font-variant-numeric: tabular-nums; appearance: textfield; -moz-appearance: textfield; }
.number-input input::-webkit-inner-spin-button, .number-input input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
</style>
