<script lang="ts">
  import { tick } from 'svelte';
  import { tagHref } from '@lib/journal-tags';
  import { getHorizontalScrollState, observeHorizontalScroll } from '@lib/horizontal-scroll';

  interface Props {
    tags?: readonly string[];
    label: string;
  }

  let { tags = [], label }: Props = $props();
  let viewport: HTMLElement | undefined = $state();
  let track: HTMLDivElement | undefined = $state();
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function syncScrollState(state: { canScrollLeft: boolean; canScrollRight: boolean }) {
    canScrollLeft = state.canScrollLeft;
    canScrollRight = state.canScrollRight;
  }

  $effect(() => {
    const viewportElement = viewport;
    const trackElement = track;
    if (!viewportElement || !trackElement) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void tick().then(() => {
      if (!cancelled) {
        cleanup = observeHorizontalScroll(viewportElement, trackElement, syncScrollState);
      }
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  });

  $effect(() => {
    void tags;
    void tick().then(() => {
      if (viewport && track) {
        syncScrollState(getHorizontalScrollState(viewport));
      }
    });
  });
</script>

{#if tags.length > 0}
  <div class="relative mt-3 min-w-0 max-w-full">
    <div
      bind:this={viewport}
      role="group"
      class="pointer-events-auto block w-fit min-w-0 max-w-full snap-x snap-proximity overflow-x-auto overscroll-x-contain pb-1"
      aria-label={`Tags for ${label}`}
    >
      <div bind:this={track} class="flex w-max flex-nowrap gap-2">
        {#each tags as tag (tag)}
          <a
            href={tagHref(tag)}
            class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            >{tag}</a
          >
        {/each}
      </div>
    </div>
    <span
      class="pointer-events-none absolute inset-y-0 left-0 z-10 w-3 shadow-[inset_12px_0_16px_-14px_rgba(255,255,255,0.18)] motion-safe:transition-opacity"
      class:opacity-100={canScrollLeft}
      class:opacity-0={!canScrollLeft}
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute inset-y-0 right-0 z-10 w-3 shadow-[inset_-12px_0_16px_-14px_rgba(255,255,255,0.18)] motion-safe:transition-opacity"
      class:opacity-100={canScrollRight}
      class:opacity-0={!canScrollRight}
      aria-hidden="true"
    ></span>
  </div>
{/if}
