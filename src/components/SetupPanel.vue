<script setup lang="ts">
import { INITIAL_CHARACTERS } from '../domain/data'; import { emptyAttributes } from '../domain/types'; import type { Attributes } from '../domain/types'; import { onMounted, ref, watch } from 'vue';
import NumberStepper from './NumberStepper.vue';
const props = defineProps<{ name: string; selected: string[]; disabled: boolean }>();
const emit = defineEmits<{ 'update:name': [value: string]; 'update:selected': [value: string[]]; start: [value: Record<string, {level:number;points:number;invested:Attributes}|null>] }>(); const midway = ref(false); const ready = ref(false); const drafts = ref<Record<string,{level:number;points:number;invested:Attributes}|null>>({}); onMounted(() => { ready.value = true; });
function toggle(key:string){ if(!midway.value) return; if(!drafts.value[key]) drafts.value[key]={level:1,points:0,invested:emptyAttributes()}; }
function start(){ emit('start', midway.value ? drafts.value : {}); }
watch(() => props.selected, value => {
  for (const key of Object.keys(drafts.value)) if (!value.includes(key)) delete drafts.value[key];
  if (midway.value) value.forEach(toggle);
}, { deep: true });
</script>
<template>
  <section class="setup-panel">
    <div class="setup-intro">
      <h2>Start a playthrough</h2>
      <p>Name this run and choose only the characters you want to track now.</p>
    </div>
    <div class="setup-form">
      <label>Playthrough name<input :value="name" aria-label="Playthrough name" :disabled="disabled || !ready" @input="$emit('update:name', ($event.target as HTMLInputElement).value)" /></label>
      <fieldset class="character-picker">
        <legend>Initial characters / choose at least one</legend>
        <label v-for="(d,key) in INITIAL_CHARACTERS" :key="key" class="character-option">
          <input type="checkbox" :value="key" :checked="selected.includes(key)" :disabled="disabled || !ready" @change="$emit('update:selected', [...selected.includes(key) ? selected.filter(v => v !== key) : [...selected, key]])" />
          <span class="option-mark" aria-hidden="true">✓</span>
          <span class="option-copy"><strong>{{ d.name }}</strong><small>Start with verified level-one defaults</small></span>
        </label>
      </fieldset>
      <label class="midway-check"><input type="checkbox" v-model="midway" @change="selected.forEach(toggle)" :disabled="disabled || !ready" /><span class="option-mark" aria-hidden="true">✓</span><span>I am joining this playthrough midway</span></label>
      <div v-if="midway" v-for="key in selected" :key="key" class="midway-fields">
        <h3>{{ INITIAL_CHARACTERS[key as keyof typeof INITIAL_CHARACTERS].name }} actual progress</h3>
        <NumberStepper v-model="drafts[key]!.level" label="Current level" :min="1" :max="99" />
        <NumberStepper v-model="drafts[key]!.points" label="Available attribute points" />
        <NumberStepper v-for="a in ['vitality','might','agility','defence','luck']" :key="a" v-model="drafts[key]!.invested[a as keyof Attributes]" :label="a" :max="99" />
      </div>
      <button class="primary" :disabled="disabled || !ready || !selected.length" @click="start">Create playthrough</button>
    </div>
  </section>
</template>
