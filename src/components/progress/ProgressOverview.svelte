<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Button, DropdownMenu, Progress } from '@weluvabid/iris/components';
  import { ChevronDown, SlidersHorizontal } from '@weluvabid/iris/lucide';
  import { createProgressSnapshot, type ProgressSnapshot } from '@lib/progress/model';
  import { subscribeToProgress } from '@lib/progress/service';
  import ProgressQrTransfer from './ProgressQrTransfer.svelte';
  import type { ProgressReadResult } from '@lib/progress/storage';

  interface Props {
    knownIds: string[];
    questionManifest: string[];
  }

  const { knownIds, questionManifest }: Props = $props();
  let completed = $state(0);
  let currentSnapshot = $state(createProgressSnapshot([]));
  let storageMessage = $state('');
  let menuOpen = $state(false);
  let qrOpen = $state(false);
  let qrMode = $state<'overview' | 'export' | 'import'>('overview');
  let navigationInput = $state<HTMLInputElement>();
  let navigationMode = $state(false);
  let navigationSequence = $state('');
  let navigationMessage = $state('');
  let navigationMessageTimer: number | undefined;

  const knownIdSet = $derived(new Set(knownIds));
  const completionPercentage = $derived(
    knownIds.length > 0 ? (completed / knownIds.length) * 100 : 0,
  );

  function applySnapshot(snapshot: ProgressSnapshot): void {
    currentSnapshot = snapshot;
    completed = snapshot.completed.filter((id) => knownIdSet.has(id)).length;
    storageMessage = '';
  }

  onMount(() => {
    function handleProgressResult(result: ProgressReadResult): void {
      if (!result.ok) {
        storageMessage =
          result.reason === 'invalid-data'
            ? 'Saved progress is invalid. Progress transfer is disabled until it is recovered.'
            : 'Progress storage is unavailable in this browser.';

        return;
      }

      applySnapshot(result.snapshot);
    }

    function handleCardNavigationPrompt(event: Event): void {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      const detail = event.detail as { active?: boolean; value?: string; message?: string };

      navigationMode = detail.active === true;
      navigationSequence = typeof detail.value === 'string' ? detail.value : '';
      navigationMessage = typeof detail.message === 'string' ? detail.message : '';

      if (navigationMessageTimer !== undefined) {
        window.clearTimeout(navigationMessageTimer);
      }

      if (navigationMode) {
        void tick().then(() => navigationInput?.focus({ preventScroll: true }));
      } else if (navigationMessage) {
        navigationMessageTimer = window.setTimeout(() => (navigationMessage = ''), 3000);
      }
    }

    const unsubscribe = subscribeToProgress(handleProgressResult);

    window.addEventListener('atlas:card-navigation-prompt', handleCardNavigationPrompt);

    return () => {
      unsubscribe();
      window.removeEventListener('atlas:card-navigation-prompt', handleCardNavigationPrompt);

      if (navigationMessageTimer !== undefined) {
        window.clearTimeout(navigationMessageTimer);
      }
    };
  });
</script>

<div class="pointer-events-none relative flex flex-col items-center py-3">
  <DropdownMenu.Root bind:open={menuOpen}>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button.Root
          {...props}
          variant="outline"
          class="pointer-events-auto h-10 max-w-[calc(100vw-2rem)] gap-3 rounded-full border-border/80 bg-card/95 px-4 shadow-md shadow-black/10 backdrop-blur-md dark:shadow-black/30"
          aria-label={`${completed} of ${knownIds.length} questions completed. Open progress actions.`}
          aria-expanded={menuOpen}
          aria-keyshortcuts="P"
          data-progress-menu-trigger
        >
          <span
            class="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <span
              class="block h-full rounded-full bg-primary transition-[width]"
              style={`width: ${completionPercentage}%`}
            ></span>
          </span>
          <span class="whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
            <span class="font-semibold tabular-nums text-foreground"
              >{completed} / {knownIds.length}</span
            >
            completed on this device
          </span>
          <ChevronDown class="size-4 shrink-0" aria-hidden="true" />
        </Button.Root>
      {/snippet}
    </DropdownMenu.Trigger>

    <DropdownMenu.Content side="bottom" align="center" sideOffset={8} class="w-64">
      <DropdownMenu.Label>Learning progress</DropdownMenu.Label>
      <div class="px-2 pb-2 text-xs text-muted-foreground">
        {completed} of {knownIds.length} questions completed on this device.
      </div>
      <div class="px-2 pb-2">
        <Progress.Root
          value={completionPercentage}
          class="h-1.5"
          aria-label="Handbook completion"
        />
      </div>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        onSelect={() => {
          qrMode = 'overview';
          qrOpen = true;
        }}
      >
        <SlidersHorizontal aria-hidden="true" />
        Manage Progress
      </DropdownMenu.Item>
      {#if storageMessage}
        <DropdownMenu.Separator />
        <div class="px-2 py-1.5 text-xs text-muted-foreground">
          {storageMessage}
        </div>
      {/if}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
  {#if navigationMode || navigationMessage}
    <div
      class="pointer-events-auto absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2"
      aria-live="polite"
      aria-atomic="true"
    >
      {#if navigationMode}
        <input
          bind:this={navigationInput}
          class="h-8 w-36 rounded-md border border-border bg-popover px-2 py-1 text-center text-base text-popover-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="text"
          value={navigationSequence}
          readonly
          aria-label="Card number. Type digits and press Enter to navigate, or Escape to cancel."
          placeholder="Go to card…"
        />
      {:else}
        <p
          class="rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm"
          role="status"
        >
          {navigationMessage}
        </p>
      {/if}
    </div>
  {/if}
  <ProgressQrTransfer
    bind:open={qrOpen}
    bind:mode={qrMode}
    snapshot={currentSnapshot}
    questionIds={questionManifest}
    onImported={applySnapshot}
  />
  <span class="sr-only" role="status" aria-live="polite">{storageMessage}</span>
</div>
