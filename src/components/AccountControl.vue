<script setup lang="ts">
import { Cloud, UserRound } from '@lucide/vue';
import Button from 'primevue/button';
defineProps<{ account: { email: string | null; busy: boolean; error: string; syncedAt: number | null } }>();
defineEmits<{ 'sign-in': []; 'sign-out': []; sync: [] }>();
</script>

<template>
  <details class="account-control" :open="!!account.error">
    <summary><component :is="account.email ? Cloud : UserRound" :size="17" aria-hidden="true" /><span>{{ account.busy ? 'Syncing…' : account.email ? 'Account' : 'Sign in' }}</span></summary>
    <div class="account-control__panel">
      <strong>Atlesque Play</strong>
      <template v-if="account.email">
        <p class="account-email">{{ account.email }}</p>
        <p aria-live="polite">{{ account.busy ? 'Syncing your playthroughs…' : account.error ? 'Progress is saved on this device. Waiting to sync.' : account.syncedAt ? 'Your playthroughs are synced across devices.' : 'Your playthroughs are saved on this device. Sync to save them to your account.' }}</p>
        <div class="account-control__actions">
          <Button label="Sync now" :disabled="account.busy" @click="$emit('sync')" />
          <Button label="Sign out" severity="secondary" text @click="$emit('sign-out')" />
        </div>
      </template>
      <template v-else>
        <p>Sign in to save your playthroughs to your account and recover them on another device.</p>
        <Button label="Sign in with Atlesque Play" :disabled="account.busy" @click="$emit('sign-in')" />
      </template>
      <p v-if="account.error" role="alert" class="account-error">{{ account.error }}</p>
    </div>
  </details>
</template>

<style>
.account-control { position: relative; flex-shrink: 0; }
.account-control summary { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 8px 12px; border: 1px solid var(--page-line); border-radius: 6px; color: var(--page-fg); cursor: pointer; font-size: .78rem; list-style: none; }
.account-control summary::-webkit-details-marker { display: none; }
.account-control summary:hover { border-color: var(--gold); }
.account-control summary:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.account-control__panel { position: absolute; right: 0; top: calc(100% + 10px); z-index: 10; width: min(340px, calc(100vw - 28px)); padding: 22px; border: 1px solid var(--card-line); border-radius: 8px; background: var(--card-bg); color: var(--card-fg); box-shadow: 0 12px 32px rgba(0,0,0,.16); }
.account-control__panel strong { font-family: var(--display); font-weight: 400; font-size: 1.4rem; }
.account-control__panel p { color: var(--card-muted); line-height: 1.6; font-size: .8rem; }
.account-email { overflow-wrap: anywhere; color: var(--card-fg) !important; }
.account-control__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.account-control .p-button { min-height: 44px; font-size: .8rem; }
.account-control .p-button:not(.p-button-text) { background: var(--gold); border-color: var(--gold); color: var(--button-fg); }
.account-control .p-button-text { color: var(--card-muted); }
.account-control__panel .account-error { color: var(--p-red-400); }
@media (max-width: 680px) { .account-control__panel { right: auto; left: 0; } }
</style>
