<script setup lang="ts">
import { useFormField } from '@nuxt/ui/composables/useFormField';

const props = withDefaults(defineProps<{
  modelValue: number; inputId: string; label: string; min?: number; max?: number; disabled?: boolean;
}>(), { min: 0, max: Number.MAX_SAFE_INTEGER, disabled: false });
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
// Inside a UFormField, this points the field's label at our input.
useFormField({ id: props.inputId });

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
  <div class="number-input flex w-full min-w-0 items-center rounded-md bg-default ring ring-inset ring-accented transition-shadow focus-within:ring-2 focus-within:ring-primary" role="group" :aria-label="`${label} controls`">
    <UButton icon="i-lucide-minus" color="primary" variant="ghost" square class="m-0.5 size-10 justify-center" :aria-label="`Decrease ${label}`" :disabled="disabled || modelValue <= min" @click="step(-1)" />
    <input
      :id="inputId" type="number" inputmode="numeric" :aria-label="label" :value="modelValue" :min="min" :max="max" step="1" :disabled="disabled"
      class="w-full min-w-0 appearance-none border-0 bg-transparent px-0.5 py-2 text-center text-base font-semibold tabular-nums text-highlighted outline-none disabled:opacity-75 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      @input="enter"
    />
    <UButton icon="i-lucide-plus" color="primary" variant="ghost" square class="m-0.5 size-10 justify-center" :aria-label="`Increase ${label}`" :disabled="disabled || modelValue >= max" @click="step(1)" />
  </div>
</template>
