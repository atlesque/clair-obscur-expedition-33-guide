<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
  }>(),
  { min: 0, step: 1 },
);

const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
const inputValue = ref(String(props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    if (inputValue.value !== String(value)) inputValue.value = String(value);
  },
);

const numericValue = computed(() =>
  Number.isFinite(props.modelValue) ? props.modelValue : props.min,
);
const atMin = computed(() => numericValue.value <= props.min);
const atMax = computed(() => props.max !== undefined && numericValue.value >= props.max);

function clamp(value: number) {
  return Math.min(props.max ?? Number.POSITIVE_INFINITY, Math.max(props.min, value));
}

function setValue(value: number) {
  const next = clamp(value);
  inputValue.value = String(next);
  emit('update:modelValue', next);
}

function adjust(direction: -1 | 1) {
  setValue(numericValue.value + direction * props.step);
}

function handleInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  inputValue.value = raw;
  if (raw === '') return;
  const value = Number(raw);
  if (Number.isFinite(value)) emit('update:modelValue', clamp(value));
}

function commit() {
  if (inputValue.value.trim() === '') {
    setValue(props.min);
    return;
  }
  const value = Number(inputValue.value);
  setValue(Number.isFinite(value) ? value : props.min);
}
</script>

<template>
  <label class="stepper-field">
    <span class="stepper-label">{{ label }}</span>
    <span class="stepper-control">
      <button
        type="button"
        :aria-label="`Decrease ${label}`"
        :disabled="atMin"
        @click="adjust(-1)"
      >
        −
      </button>
      <input
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :value="inputValue"
        :aria-label="label"
        inputmode="numeric"
        @input="handleInput"
        @blur="commit"
      />
      <button
        type="button"
        :aria-label="`Increase ${label}`"
        :disabled="atMax"
        @click="adjust(1)"
      >
        +
      </button>
    </span>
  </label>
</template>
