<script lang="ts">
  import { onMount } from 'svelte';
  import { Kbd } from '@weluvabid/iris/components';

  let active = $state(false);
  let value = $state('');
  let message = $state('');
  let messageTimer: ReturnType<typeof setTimeout> | undefined;

  function handlePrompt(event: Event): void {
    const detail = (event as CustomEvent<{ active: boolean; value?: string; message?: string }>).detail;
    active = detail.active;
    value = detail.value ?? '';
    message = detail.message ?? '';
    if (messageTimer) clearTimeout(messageTimer);
    if (message) messageTimer = setTimeout(() => (message = ''), 3000);
  }

  onMount(() => {
    window.addEventListener('atlas:card-navigation-prompt', handlePrompt);
    return () => {
      window.removeEventListener('atlas:card-navigation-prompt', handlePrompt);
      if (messageTimer) clearTimeout(messageTimer);
    };
  });
</script>

{#if active || message}
  <div class="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4" aria-live="polite" aria-atomic="true">
    {#if active}
      <div class="pointer-events-auto flex h-10 items-center gap-3 rounded-lg border border-border bg-popover px-3 text-sm text-popover-foreground shadow-md">
        <span class="text-muted-foreground">Go to entry</span>
        <span class="min-w-5 font-semibold tabular-nums">{value || '…'}</span>
        <span class="text-xs text-muted-foreground"><Kbd.Kbd>Enter</Kbd.Kbd> open · <Kbd.Kbd>Esc</Kbd.Kbd> cancel</span>
      </div>
    {:else}
      <p class="pointer-events-auto rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md" role="status">{message}</p>
    {/if}
  </div>
{/if}
