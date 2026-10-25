<script setup lang="ts">
defineProps<{ title: string; items: string[]; explanation: string; notes?: string[] }>();
</script>

<template>
  <UAlert color="primary" variant="subtle" icon="i-lucide-lightbulb" class="recommendation" :ui="{ title: 'text-xs font-bold uppercase tracking-widest', description: 'mt-1.5 grid gap-1.5 text-default' }">
    <template #title>{{ title }}</template>
    <template #description>
      <span class="recommendation__spend flex flex-wrap gap-x-3 gap-y-1 font-bold text-primary"><span v-for="item in items" :key="item">{{ item }}</span></span>
      <small class="text-sm text-toned">{{ explanation }}</small>
      <ul v-if="notes?.length" class="recommendation__notes grid list-disc gap-1 ps-4 text-sm text-toned marker:text-primary">
        <li v-for="note in notes" :key="note">{{ note }}</li>
      </ul>
    </template>
  </UAlert>
</template>
