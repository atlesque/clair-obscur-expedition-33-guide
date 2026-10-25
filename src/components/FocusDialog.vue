<script setup lang="ts">
import { onUnmounted } from 'vue';

const props = defineProps<{ title: string; focusWeapon?: boolean; size?: 'sm' | 'md' }>();
const emit = defineEmits<{ close: [] }>();
const previous = document.activeElement as HTMLElement | null;
const fallback = previous?.closest('.character-card')?.querySelector<HTMLElement>('.character-card__actions button') ?? null;

// The dialog picks its own first focus (and returns focus itself), instead of the modal's defaults.
function focusFirst(event: Event) {
  event.preventDefault();
  const content = event.target as HTMLElement;
  const weapon = content.querySelector<HTMLInputElement>('#equipped-weapon');
  const target = weapon && weapon.value && !props.focusWeapon ? content.querySelector<HTMLElement>('#current-level-input') : weapon;
  (target ?? content.querySelector<HTMLElement>('input') ?? content).focus();
  // Changing the weapon starts with the current name selected, so typing replaces it.
  if (props.focusWeapon) weapon?.select();
}

onUnmounted(() => (previous?.isConnected ? previous : fallback)?.focus());
</script>

<template>
  <UModal
    :open="true"
    :title="props.title"
    :ui="{ content: `field-dialog ${size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-xl'}`, title: 'text-2xl text-highlighted' }"
    :content="{ onOpenAutoFocus: focusFirst, onCloseAutoFocus: (event: Event) => event.preventDefault() }"
    @update:open="value => { if (!value) emit('close'); }"
  >
    <template #body><slot /></template>
  </UModal>
</template>
