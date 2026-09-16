<script setup lang="ts">
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels } from '../domain/data';
import type { Character } from '../domain/types';
defineProps<{ character: Character }>();
defineEmits<{ advise: [character: Character]; update: [character: Character]; confirm: [character: Character]; dismiss: [character: Character]; remove: [character: Character] }>();
</script>
<template>
  <article class="card character">
    <div class="card-head"><div><p class="eyebrow">TRACKED CHARACTER / {{ character.id }}</p><h2>{{ character.name }}</h2></div><span class="level">LV {{ character.level }}</span></div>
    <div class="stats" aria-label="Attribute allocations"><div v-for="a in ATTRIBUTES" :key="a"><span>{{ attributeLabels[a] }}</span><span aria-hidden="true"></span><b>{{ character.invested[a] }}</b></div></div>
    <p class="points">{{ character.points }} attribute points available</p>
    <p v-if="character.pending" class="advice"><strong>Pending recommendation</strong><br /><span v-for="(amount,a) in character.pending.spend" :key="a">+{{ amount }} {{ attributeLabels[a] }} </span><br /><small>{{ character.pending.explanation }}</small></p>
    <div class="actions"><button @click="$emit('update', character)">Update progress</button><button class="primary" @click="$emit('advise', character)">Get advice <span class="sr-only">for {{ character.name }}</span></button><button v-if="character.pending" class="primary" @click="$emit('confirm', character)">I've applied these</button><button v-if="character.pending" type="button" @click="$emit('dismiss', character)">Dismiss advice</button><button class="quiet" @click="$emit('remove', character)">Remove</button></div>
  </article>
</template>
