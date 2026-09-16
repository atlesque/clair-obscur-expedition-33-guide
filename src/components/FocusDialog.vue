<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
const props = defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();
const root = ref<HTMLElement | null>(null);
let previous: HTMLElement | null = null;
const keydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { emit('close'); return; }
  if (event.key !== 'Tab' || !root.value) return;
  const focusable = [...root.value.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(e => !e.hasAttribute('disabled'));
  if (!focusable.length) return;
  const index = focusable.indexOf(document.activeElement as HTMLElement);
  const next = focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length];
  event.preventDefault(); next.focus();
};
onMounted(async () => { previous = document.activeElement as HTMLElement; document.querySelector('main')?.setAttribute('inert', ''); window.addEventListener('keydown', keydown); await nextTick(); root.value?.querySelector<HTMLElement>('input,button')?.focus(); });
onUnmounted(() => { window.removeEventListener('keydown', keydown); document.querySelector('main')?.removeAttribute('inert'); previous?.focus(); });
</script>
<template><Teleport to="body"><div class="modal-backdrop"><section ref="root" class="modal" role="dialog" aria-modal="true" :aria-label="props.title"><h2>{{ props.title }}</h2><slot /><div class="actions"><slot name="actions" /></div></section></div></Teleport></template>
<style>.modal{color:#f6f1e8;max-height:calc(100dvh - 36px);overflow:auto;box-sizing:border-box}.modal input,.modal button{color:#fff;background:#171717;border:1px solid #88705d}.modal .primary{background:#c77f4e;color:#1b1410}</style>
