<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import Dialog from 'primevue/dialog';

const props = defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();
const visible = ref(true);
let previous: HTMLElement | null = null;

function updateVisible(value: boolean) {
  visible.value = value;
  if (!value) emit('close');
}

onMounted(async () => {
  previous = document.activeElement as HTMLElement;
  await nextTick();
  requestAnimationFrame(() => document.querySelector<HTMLElement>('.field-dialog input')?.focus());
});

onUnmounted(() => previous?.focus());
</script>

<template>
  <Dialog
    :visible="visible"
    :header="props.title"
    :ariaLabel="props.title"
    modal
    closable
    closeOnEscape
    :draggable="false"
    :style="{ width: 'min(580px, calc(100vw - 32px))' }"
    class="field-dialog"
    @update:visible="updateVisible"
  >
    <slot />
  </Dialog>
</template>

<style>
.field-dialog.p-dialog { overflow: hidden; border: 0; border-radius: 2px; background: var(--card-bg); color: var(--card-fg); box-shadow: 14px 18px 0 rgba(0,0,0,.22); }
.field-dialog .p-dialog-header { padding: 22px 25px 13px; background: var(--card-bg); color: var(--card-fg); font-family: var(--display); font-size: 1.8rem; font-weight: 400; letter-spacing: -.05em; }
.field-dialog .p-dialog-header-actions { gap: 4px; }
.field-dialog .p-dialog-header-icon { width: 34px; height: 34px; border-radius: 2px; color: #756d63; }
.field-dialog .p-dialog-header-icon:focus-visible { outline: 2px solid var(--copper); outline-offset: 2px; }
.field-dialog .p-dialog-content { padding: 4px 25px 25px; background: var(--card-bg); color: var(--card-fg); }
.field-dialog .p-inputnumber, .field-dialog .p-inputtext { width: 100%; }
.field-dialog .p-inputnumber-input, .field-dialog .p-inputtext { border-color: var(--card-line); border-radius: 2px; color: var(--card-fg); }
.field-dialog .p-inputnumber-input:enabled:focus, .field-dialog .p-inputtext:enabled:focus { border-color: var(--copper); box-shadow: 0 0 0 1px var(--copper); }
.field-dialog .p-button { border-radius: 2px; }
.field-dialog .p-button:not(.p-button-text):not(.p-button-outlined) { background: var(--copper); border-color: var(--copper); color: #21130c; }
.field-dialog .p-button:not(.p-button-text):not(.p-button-outlined):hover { background: var(--copper-deep); border-color: var(--copper-deep); }
.field-dialog .p-button.p-button-text { color: #756d63; }
.field-dialog .p-dialog-mask { background: rgba(8, 13, 17, .78); backdrop-filter: blur(4px); }

@media (max-width: 560px) {
  .field-dialog .p-dialog-header { padding: 20px 19px 12px; font-size: 1.6rem; }
  .field-dialog .p-dialog-content { padding: 4px 19px 20px; }
}
</style>
