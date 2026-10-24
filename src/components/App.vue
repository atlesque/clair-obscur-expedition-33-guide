<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const Expedition = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fbf7ee', 100: '#f4ead1', 200: '#e9d4a3', 300: '#dcbb72',
      400: '#d0a54f', 500: '#b98b37', 600: '#93692a', 700: '#745123',
      800: '#5c4120', 900: '#4b361d', 950: '#2a1d0e',
    },
    colorScheme: {
      light: { primary: { color: '#745123', inverseColor: '#ffffff', hoverColor: '#5c4120', activeColor: '#4b361d' } },
      dark: {
        primary: { color: '#dcbb72', inverseColor: '#171614', hoverColor: '#e9d4a3', activeColor: '#d0a54f' },
        surface: { 0: '#ffffff', 50: '#f6f5f2', 100: '#efede8', 200: '#e0ddd5', 300: '#c6c1b6', 400: '#9d978a', 500: '#726d62', 600: '#58544b', 700: '#3b3833', 800: '#201e1b', 900: '#171614', 950: '#0e0d0c' },
      },
    },
  },
});
import Guide from './Guide.vue';

const app = getCurrentInstance()?.appContext.app;

if (app) {
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Expedition,
      options: {
        darkModeSelector: '[data-theme="dark"]',
        cssLayer: false,
      },
    },
  });
}
</script>

<template>
  <Guide />
</template>
