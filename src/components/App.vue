<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Guide from './Guide.vue';

const app = getCurrentInstance()?.appContext.app;

if (app) {
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: false,
        cssLayer: false,
      },
    },
  });
}
</script>

<template>
  <Guide />
</template>
