<script setup lang="ts">
import { ref } from 'vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels } from '../domain/data';
import type { Character } from '../domain/types';
const props = defineProps<{ character: Character }>();
const emit = defineEmits<{ advise: [character: Character]; update: [character: Character]; confirm: [character: Character]; dismiss: [character: Character]; remove: [character: Character] }>();
const actionsOpen = ref(false);
function removeCharacter() {
  actionsOpen.value = false;
  emit('remove', props.character);
}
</script>
<template>
  <article class="card character">
    <div class="character-layout">
      <div class="character-primary">
        <div class="card-head"><div><h2>{{ character.name }}</h2></div></div>
        <div class="stats" aria-label="Attribute allocations"><div v-for="a in ATTRIBUTES" :key="a"><span>{{ attributeLabels[a] }}</span><b>{{ character.invested[a] }}</b></div></div>
        <p class="points">{{ character.points }} attribute points available</p>
      </div>
      <aside class="character-secondary" aria-label="Character status and actions">
        <div class="card-head-actions"><span class="level">LV {{ character.level }}</span><div class="character-menu"><button type="button" class="icon-button more-button" aria-label="More character actions" :aria-expanded="actionsOpen" @click="actionsOpen = !actionsOpen">⋯</button><div v-if="actionsOpen" class="character-popover" role="menu"><button type="button" role="menuitem" class="quiet" @click="removeCharacter">Remove character</button></div></div></div>
        <p v-if="character.pending" class="advice"><strong>Pending recommendation</strong><br /><span v-for="(amount,a) in character.pending.spend" :key="a">+{{ amount }} {{ attributeLabels[a] }} </span><br /><small>{{ character.pending.explanation }}</small></p>
        <div class="actions"><button @click="$emit('update', character)">Update progress</button><button class="primary" @click="$emit('advise', character)">Get advice <span class="sr-only">for {{ character.name }}</span></button><button v-if="character.pending" class="primary" @click="$emit('confirm', character)">I've applied these</button><button v-if="character.pending" type="button" @click="$emit('dismiss', character)">Dismiss advice</button></div>
      </aside>
    </div>
  </article>
</template>
