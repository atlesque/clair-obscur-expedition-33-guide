<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { Sparkles, Swords } from '@lucide/vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels, characterAvatar } from '../domain/data';
import { weaponScaling } from '../domain/weapons';
import { MAX_ACTIVE_PARTY, freeLumina } from '../domain/lumina';
import type { Character } from '../domain/types';
import { computed } from 'vue';

const props = defineProps<{ character: Character; partyFull?: boolean }>();
defineEmits<{
  advise: [character: Character];
  update: [character: Character];
  confirm: [character: Character];
  dismiss: [character: Character];
  toggleParty: [character: Character];
  'edit-weapon': [character: Character];
  'remove-weapon': [character: Character];
}>();

const avatarSrc = computed(() => characterAvatar(props.character.id));
const free = computed(() => freeLumina(props.character));
const partyLocked = computed(() => !props.character.inParty && props.partyFull);
const scaling = computed(() => weaponScaling(props.character.id, props.character.weapon, props.character.weaponLevel));
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
            <button type="button" class="party-toggle" :class="{ 'is-active': character.inParty }" :aria-pressed="character.inParty ? 'true' : 'false'" :disabled="partyLocked"
              :title="partyLocked ? `The active combat party already has ${MAX_ACTIVE_PARTY} fighters` : character.inParty ? 'Fighting in the active combat party' : 'Mark as fighting in the active combat party'"
              @click="$emit('toggleParty', character)">{{ character.inParty ? 'In combat party' : 'Benched' }}</button>
            </div>
          </div>
          <div class="character-card__badges">
            <Tag :value="`LV ${character.level}`" class="level-tag" />
            <Tag :value="`${character.points} AP`" class="points-tag" :aria-label="`${character.points} attribute points available`" :title="`${character.points} attribute points available`" />
            <Tag v-if="free !== undefined" :value="`${free} LP`" class="points-tag" :aria-label="`${free} Lumina points free`" :title="`${free} Lumina points free`" />
          </div>
        </div>

        <div class="character-weapon">
          <Swords :size="16" :strokeWidth="1.8" aria-hidden="true" />
          <div><span class="character-weapon__label">Equipped weapon</span><strong v-if="character.weapon">{{ character.weapon }}<span v-if="character.weaponLevel" class="character-weapon__level"> · Level {{ character.weaponLevel }}</span></strong><button v-else type="button" @click="$emit('edit-weapon', character)">Add weapon</button></div>
          <div v-if="character.weapon" class="character-weapon__actions">
            <button type="button" :aria-label="`Change ${character.name}’s weapon`" @click="$emit('edit-weapon', character)">Change</button>
            <button type="button" :aria-label="`Remove ${character.name}’s weapon`" @click="$emit('remove-weapon', character)">Remove</button>
          </div>
        </div>

        <div class="character-lumina">
          <Sparkles :size="16" :strokeWidth="1.8" aria-hidden="true" />
          <div>
            <span class="character-weapon__label">Lumina points</span>
            <strong v-if="character.lumina">{{ free }} free<span class="character-weapon__level"> · {{ character.lumina.spent }} of {{ character.lumina.total }} spent</span></strong>
            <button v-else type="button" @click="$emit('update', character)">Add Lumina points</button>
            <small v-if="free">Equip more Luminas from Pictos you’ve mastered to use them.</small>
          </div>
        </div>

        <div class="stats" aria-label="Recorded attributes">
          <div v-for="attribute in ATTRIBUTES" :key="attribute" class="stats__item" :class="{ 'is-scaling': scaling[attribute] }">
            <span class="stats__label">{{ attributeLabels[attribute] }}</span>
            <span class="stats__value">{{ character.invested[attribute] }}<span v-if="scaling[attribute]" class="scaling-grade" :title="`${character.weapon} scales with ${attributeLabels[attribute]}: grade ${scaling[attribute]}${character.weaponLevel ? ` at weapon level ${character.weaponLevel}` : ' (weapon level not recorded, showing the level 1 grade)'}`"><span class="sr-only">Weapon scaling grade </span>{{ scaling[attribute] }}</span></span>
          </div>
        </div>

        <Message v-if="character.pending" severity="warn" :closable="false" class="recommendation">
          <strong>Pending recommendation</strong>
          <span class="recommendation__spend">
            <span v-for="(amount, attribute) in character.pending.spend" :key="attribute">+{{ amount }} {{ attributeLabels[attribute] }} </span>
          </span>
          <small>{{ character.pending.explanation }}</small>
          <ul v-if="character.pending.notes?.length" class="recommendation__notes">
            <li v-for="note in character.pending.notes" :key="note">{{ note }}</li>
          </ul>
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
.character-weapon__actions { display: flex; gap: 14px; margin-left: auto; flex: 0 0 auto; }
.character-weapon__label { display: block; color: var(--card-muted); font-size: .62rem; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px; }
.character-weapon strong { display: block; overflow-wrap: anywhere; color: var(--card-fg); font-size: .85rem; font-weight: 600; }
.character-weapon__level { color: var(--card-muted); font-weight: 500; }
.character-lumina { display: flex; align-items: flex-start; gap: 10px; padding-top: 14px; color: var(--gold-strong); }
.character-lumina > svg { flex: 0 0 auto; margin-top: 2px; }
.character-lumina strong { display: block; color: var(--card-fg); font-size: .85rem; font-weight: 600; }
.character-lumina small { display: block; margin-top: 4px; color: var(--card-muted); font-size: .72rem; line-height: 1.45; }
.party-toggle { margin-top: 6px; min-height: 26px; padding: 3px 10px; border: 1px solid var(--card-line); border-radius: 999px; background: transparent; color: var(--card-muted); font-size: .7rem; font-weight: 600; letter-spacing: .04em; cursor: pointer; }
.party-toggle.is-active { border-color: var(--gold); background: var(--gold); color: var(--button-fg); }
.party-toggle:disabled { opacity: .45; cursor: default; }
.party-toggle:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.character-weapon button, .character-lumina button { padding: 0; min-height: 28px; border: 0; background: transparent; color: var(--gold-strong); font-size: .85rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.character-weapon button:focus-visible, .character-lumina button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
</style>
