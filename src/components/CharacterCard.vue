<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { Zap } from '@lucide/vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels, characterAvatar } from '../domain/data';
import type { Character } from '../domain/types';
import { computed } from 'vue';

const props = defineProps<{ character: Character }>();
defineEmits<{
  advise: [character: Character];
  update: [character: Character];
  confirm: [character: Character];
  dismiss: [character: Character];
}>();

const avatarSrc = computed(() => characterAvatar(props.character.id));
</script>

<template>
  <Card class="character-card">
    <template #content>
      <div class="character-card__inner">
        <div class="character-card__head">
          <div class="character-card__identity">
            <img class="character-avatar" :src="avatarSrc" :alt="`${character.name} avatar`" width="64" height="64" />
            <div>
            <h2>{{ character.name }}</h2>
            </div>
          </div>
          <Tag :value="`LV ${character.level}`" class="level-tag" />
        </div>

        <div class="stats" aria-label="Recorded attributes">
          <div v-for="attribute in ATTRIBUTES" :key="attribute" class="stats__item">
            <span class="stats__label">{{ attributeLabels[attribute] }}</span>
            <span class="stats__value">{{ character.invested[attribute] }}</span>
          </div>
        </div>

        <Message v-if="character.pending" severity="warn" :closable="false" class="recommendation">
          <strong>Pending recommendation</strong>
          <span class="recommendation__spend">
            <span v-for="(amount, attribute) in character.pending.spend" :key="attribute">+{{ amount }} {{ attributeLabels[attribute] }} </span>
          </span>
          <small>{{ character.pending.explanation }}</small>
        </Message>

        <div class="character-card__actions">
          <Button label="Update progress" severity="secondary" outlined @click="$emit('update', character)" />
          <Button label="Get advice" :aria-label="`Get advice for ${character.name}`" @click="$emit('advise', character)" />
          <Button v-if="character.pending" label="I've applied these" @click="$emit('confirm', character)" />
          <Button v-if="character.pending" label="Dismiss advice" severity="secondary" text @click="$emit('dismiss', character)" />
        </div>

        <p class="points-line"><Zap :size="14" :strokeWidth="1.8" aria-hidden="true" />{{ character.points }} attribute points available</p>
      </div>
    </template>
  </Card>
</template>
