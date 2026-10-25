<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ account: { email: string | null; busy: boolean; error: string; syncedAt: number | null } }>();
defineEmits<{ 'sign-in': []; 'sign-out': []; sync: [] }>();
// Opens by itself when syncing fails, so the error is never hidden behind the trigger.
const open = ref(!!props.account.error);
watch(() => props.account.error, error => { if (error) open.value = true; });
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'end', sideOffset: 8, onOpenAutoFocus: (event: Event) => event.preventDefault() }" :ui="{ content: 'data-[state=closed]:animate-none' }" class="account-control">
    <UButton
      class="account-control__trigger"
      color="neutral"
      variant="outline"
      :icon="account.email ? 'i-lucide-cloud' : 'i-lucide-user-round'"
      :label="account.busy ? 'Syncing…' : account.email ? 'Account' : 'Sign in'"
    />
    <template #content>
      <div class="grid w-[min(21rem,calc(100vw-2rem))] gap-3 p-5 text-sm">
        <p class="font-display text-2xl text-highlighted">Atlesque Play</p>
        <template v-if="account.email">
          <p class="text-highlighted break-all">{{ account.email }}</p>
          <p class="text-muted" aria-live="polite">{{ account.busy ? 'Syncing your playthroughs…' : account.error ? 'Progress is saved on this device. Waiting to sync.' : account.syncedAt ? 'Your playthroughs are synced across devices.' : 'Your playthroughs are saved on this device. Sync to save them to your account.' }}</p>
          <div class="flex flex-wrap gap-2">
            <UButton label="Sync now" icon="i-lucide-refresh-cw" :disabled="account.busy" @click="$emit('sync')" />
            <UButton label="Sign out" color="neutral" variant="ghost" @click="$emit('sign-out')" />
          </div>
        </template>
        <template v-else>
          <p class="text-muted">Sign in to save your playthroughs to your account and recover them on another device.</p>
          <UButton label="Sign in with Atlesque Play" class="justify-center" :disabled="account.busy" @click="$emit('sign-in')" />
        </template>
        <p v-if="account.error" role="alert" class="account-error text-error">{{ account.error }}</p>
      </div>
    </template>
  </UPopover>
</template>
