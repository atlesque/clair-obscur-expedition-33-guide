<script setup lang="ts">
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels } from '../domain/data';
import type { Character } from '../domain/types';
defineProps<{ character: Character }>();
defineEmits<{ advise: [character: Character]; update: [character: Character]; confirm: [character: Character]; dismiss: [character: Character] }>();
</script>
<template><article class="card character"><div class="card-head"><div><p class="eyebrow">TRACKED CHARACTER</p><h2>{{ character.name }}</h2></div><span class="level">LV {{ character.level }}</span></div><div class="stats"><div v-for="a in ATTRIBUTES" :key="a"><span>{{ attributeLabels[a] }}</span><b>{{ character.invested[a] }}</b></div></div><p v-if="character.pending" class="advice"><strong>Pending recommendation</strong><br /><span v-for="(amount,a) in character.pending.spend" :key="a">+{{ amount }} {{ attributeLabels[a] }} </span><br /><small>{{ character.pending.explanation }}</small></p><div class="actions"><button @click="$emit('update', character)">Update progress</button><button @click="$emit('advise', character)">Get advice <span class="sr-only">for {{ character.name }}</span></button><button v-if="character.pending" class="primary" @click="$emit('confirm', character)">I've applied these</button></div><p class="points">{{ character.points }} attribute points available</p></article></template>
