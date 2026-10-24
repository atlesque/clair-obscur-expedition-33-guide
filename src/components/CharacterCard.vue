<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { Swords } from '@lucide/vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels, characterAvatar } from '../domain/data';
import { WEAPON_GRADE_LEVEL, weaponScaling } from '../domain/weapons';
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
const scaling = computed(() => weaponScaling(props.character.id, props.character.weapon));
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
          <div class="character-card__badges">
            <Tag :value="`LV ${character.level}`" class="level-tag" />
            <Tag :value="`${character.points} AP`" class="points-tag" :aria-label="`${character.points} attribute points available`" :title="`${character.points} attribute points available`" />
          </div>
        </div>

        <div class="character-weapon">
          <Swords :size="16" :strokeWidth="1.8" aria-hidden="true" />
          <div><span class="character-weapon__label">Equipped weapon</span><strong v-if="character.weapon">{{ character.weapon }}</strong><button v-else type="button" @click="$emit('update', character)">Add weapon</button></div>
        </div>

        <div class="stats" aria-label="Recorded attributes">
          <div v-for="attribute in ATTRIBUTES" :key="attribute" class="stats__item" :class="{ 'is-scaling': scaling[attribute] }">
            <span class="stats__label">{{ attributeLabels[attribute] }}</span>
            <span class="stats__value">{{ character.invested[attribute] }}<span v-if="scaling[attribute]" class="scaling-grade" :title="`${character.weapon} scales with ${attributeLabels[attribute]}: grade ${scaling[attribute]} at weapon level ${WEAPON_GRADE_LEVEL}`"><span class="sr-only">Weapon scaling grade </span>{{ scaling[attribute] }}</span></span>
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

      </div>
    </template>
  </Card>
</template>

<style>
.stats__item.is-scaling { margin: -6px -3px; padding: 6px 3px; border-radius: 6px; background: color-mix(in srgb, var(--gold) 12%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gold) 45%, transparent); }
.stats__item.is-scaling .stats__label { color: var(--gold-strong); }
.scaling-grade { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; margin-left: 6px; padding: 0 4px; border-radius: 4px; background: var(--gold); color: var(--button-fg); font-family: var(--body); font-size: .66rem; font-weight: 700; line-height: 1; vertical-align: middle; }
.stats__value .scaling-grade { margin-left: 5px; transform: translateY(-3px); }
.attribute-row.is-scaling label, .setup-attribute.is-scaling label { color: var(--gold-strong); font-weight: 600; }
.character-weapon { display: flex; align-items: center; gap: 10px; padding-top: 18px; color: var(--gold-strong); }
.character-weapon > svg { flex: 0 0 auto; }
.character-weapon > div { min-width: 0; }
.character-weapon__label { display: block; color: var(--card-muted); font-size: .62rem; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px; }
.character-weapon strong { display: block; overflow-wrap: anywhere; color: var(--card-fg); font-size: .85rem; font-weight: 600; }
.character-weapon button { padding: 0; min-height: 28px; border: 0; background: transparent; color: var(--gold-strong); font-size: .85rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.character-weapon button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
</style>
