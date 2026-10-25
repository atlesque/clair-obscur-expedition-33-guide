<script setup lang="ts">
import { computed } from 'vue';
import Recommendation from './Recommendation.vue';
import { ATTRIBUTES } from '../domain/types';
import { attributeLabels, characterAvatar } from '../domain/data';
import { weaponScaling } from '../domain/weapons';
import { MAX_ACTIVE_PARTY, freeLumina } from '../domain/lumina';
import type { StatField } from '../domain/rules';
import type { Attribute, Character } from '../domain/types';

const props = defineProps<{ character: Character; partyFull?: boolean }>();
defineEmits<{
  advise: [character: Character];
  update: [character: Character];
  confirm: [character: Character];
  dismiss: [character: Character];
  toggleParty: [character: Character];
  'edit-weapon': [character: Character];
  'remove-weapon': [character: Character];
  'edit-lumina': [character: Character];
  'set-stat': [character: Character, field: StatField];
}>();

const avatarSrc = computed(() => characterAvatar(props.character.id));
const free = computed(() => freeLumina(props.character));
const partyLocked = computed(() => !props.character.inParty && props.partyFull);
const scaling = computed(() => weaponScaling(props.character.id, props.character.weapon, props.character.weaponLevel));
const spend = computed(() => Object.entries(props.character.pending?.spend ?? {}).map(([attribute, amount]) => `+${amount} ${attributeLabels[attribute as Attribute]}`));
</script>

<template>
  <UCard class="character-card h-full" :ui="{ body: 'flex h-full flex-col gap-5 p-5 sm:p-6' }">
    <div class="character-card__head flex flex-wrap items-center justify-between gap-4 border-b border-default pb-5">
      <div class="flex min-w-0 items-center gap-3.5">
        <img class="character-avatar size-14 shrink-0 rounded-md object-cover sm:size-16" :src="avatarSrc" :alt="`${character.name} avatar`" width="64" height="64" />
        <div class="grid justify-items-start gap-1.5">
          <h2 class="text-3xl text-highlighted">{{ character.name }}</h2>
          <UButton
            class="party-toggle rounded-full"
            size="xs"
            :color="character.inParty ? 'primary' : 'neutral'"
            :variant="character.inParty ? 'solid' : 'outline'"
            :icon="character.inParty ? 'i-lucide-swords' : undefined"
            :label="character.inParty ? 'In combat party' : 'Benched'"
            :aria-pressed="character.inParty ? 'true' : 'false'"
            :disabled="partyLocked"
            :title="partyLocked ? `The active combat party already has ${MAX_ACTIVE_PARTY} fighters` : character.inParty ? 'Fighting in the active combat party' : 'Mark as fighting in the active combat party'"
            @click="$emit('toggleParty', character)"
          />
        </div>
      </div>
      <div class="character-card__badges ml-auto flex shrink-0 items-center gap-1.5">
        <UButton class="level-tag font-bold tracking-widest tabular-nums" size="xs" color="primary" variant="soft" :label="`LV ${character.level}`" aria-haspopup="dialog" :title="`Set ${character.name}’s level`" @click="$emit('set-stat', character, 'level')" />
        <UButton class="points-tag font-bold tracking-widest tabular-nums" size="xs" color="primary" variant="soft" :label="`${character.points} AP`" aria-haspopup="dialog" :aria-label="`${character.points} attribute points available`" :title="`${character.points} attribute points available. Select to set them.`" @click="$emit('set-stat', character, 'points')" />
        <UBadge v-if="free !== undefined" class="points-tag font-bold tracking-widest tabular-nums" size="md" color="neutral" variant="subtle" :label="`${free} LP`" :aria-label="`${free} Lumina points free`" :title="`${free} Lumina points free`" />
      </div>
    </div>

    <div class="grid gap-4">
      <div class="character-weapon flex items-center gap-3">
        <UIcon name="i-lucide-swords" class="size-4 shrink-0 text-primary" />
        <div class="min-w-0">
          <span class="section-kicker block text-[0.65rem]">Equipped weapon</span>
          <strong v-if="character.weapon" class="block font-semibold text-highlighted [overflow-wrap:anywhere]">{{ character.weapon }}<span v-if="character.weaponLevel" class="font-medium text-muted"> · Level {{ character.weaponLevel }}</span></strong>
          <UButton v-else variant="link" class="px-0" label="Add weapon" @click="$emit('edit-weapon', character)" />
        </div>
        <div v-if="character.weapon" class="ml-auto flex shrink-0 gap-1">
          <UButton variant="link" size="sm" label="Change" :aria-label="`Change ${character.name}’s weapon`" @click="$emit('edit-weapon', character)" />
          <UButton variant="link" size="sm" color="neutral" label="Remove" :aria-label="`Remove ${character.name}’s weapon`" @click="$emit('remove-weapon', character)" />
        </div>
      </div>

      <div class="character-lumina flex items-start gap-3">
        <UIcon name="i-lucide-sparkles" class="mt-0.5 size-4 shrink-0 text-primary" />
        <div class="min-w-0">
          <span class="section-kicker block text-[0.65rem]">Lumina points</span>
          <strong v-if="character.lumina" class="block font-semibold text-highlighted">{{ free }} free<span class="font-medium text-muted"> · {{ character.lumina.spent }} of {{ character.lumina.total }} spent</span></strong>
          <UButton v-else variant="link" class="px-0" label="Add Lumina points" @click="$emit('edit-lumina', character)" />
          <small v-if="free" class="mt-1 block text-xs text-muted">Equip more Luminas from Pictos you’ve mastered to use them.</small>
        </div>
        <UButton v-if="character.lumina" class="ml-auto shrink-0" variant="link" size="sm" label="Change" :aria-label="`Change ${character.name}’s Lumina points`" @click="$emit('edit-lumina', character)" />
      </div>
    </div>

    <div class="stats grid grid-cols-5 gap-1.5" aria-label="Recorded attributes">
      <button
        v-for="attribute in ATTRIBUTES"
        :key="attribute"
        type="button"
        class="stats__item min-w-0 cursor-pointer rounded-md px-1.5 py-2 text-left ring-inset transition-colors hover:bg-elevated hover:ring hover:ring-accented focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="{ 'is-scaling bg-primary/10 ring ring-primary/30': scaling[attribute] }"
        aria-haspopup="dialog"
        :title="`Set ${attributeLabels[attribute]}`"
        @click="$emit('set-stat', character, attribute)"
      >
        <span class="sr-only">Set </span>
        <span class="stats__label block truncate text-[0.6rem] font-bold uppercase tracking-wider" :class="scaling[attribute] ? 'text-primary' : 'text-muted'">{{ attributeLabels[attribute] }}</span>
        <span class="stats__value mt-1 flex items-center font-display text-2xl leading-none text-highlighted tabular-nums sm:text-3xl">{{ character.invested[attribute] }}<span v-if="scaling[attribute]" class="scaling-grade" :title="`${character.weapon} scales with ${attributeLabels[attribute]}: grade ${scaling[attribute]}${character.weaponLevel ? ` at weapon level ${character.weaponLevel}` : ' (weapon level not recorded, showing the level 1 grade)'}`"><span class="sr-only">Weapon scaling grade </span>{{ scaling[attribute] }}</span></span>
      </button>
    </div>

    <Recommendation v-if="character.pending" title="Pending recommendation" :items="spend" :explanation="character.pending.explanation" :notes="character.pending.notes" />

    <div class="character-card__actions mt-auto flex flex-wrap gap-2">
      <UButton label="Update progress" color="neutral" variant="outline" @click="$emit('update', character)" />
      <UButton label="Get advice" :variant="character.pending ? 'outline' : 'solid'" :aria-label="`Get advice for ${character.name}`" @click="$emit('advise', character)" />
      <UButton v-if="character.pending" label="I've applied these" icon="i-lucide-check" @click="$emit('confirm', character)" />
      <UButton v-if="character.pending" label="Dismiss advice" color="neutral" variant="ghost" @click="$emit('dismiss', character)" />
    </div>
  </UCard>
</template>
