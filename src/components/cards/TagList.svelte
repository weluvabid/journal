<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { tagHref, type TagCollection } from '@lib/journal-tags';

  interface Props {
    tags?: readonly string[];
    label: string;
    collection?: TagCollection;
  }

  let { tags = [], label, collection = 'journal' }: Props = $props();
  let viewport: HTMLElement;
  let track: HTMLDivElement;
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function updateScrollAffordances() {
    if (!viewport) return;

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    canScrollLeft = maxScrollLeft > 1 && viewport.scrollLeft > 1;
    canScrollRight = maxScrollLeft > 1 && viewport.scrollLeft < maxScrollLeft - 1;
  }

  onMount(() => {
    if (!viewport || !track) return;

    viewport.addEventListener('scroll', updateScrollAffordances, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateScrollAffordances);
      resizeObserver.observe(viewport);
      resizeObserver.observe(track);
      updateScrollAffordances();

      return () => {
        viewport.removeEventListener('scroll', updateScrollAffordances);
        resizeObserver.disconnect();
      };
    }

    window.addEventListener('resize', updateScrollAffordances);
    updateScrollAffordances();

    return () => {
      viewport.removeEventListener('scroll', updateScrollAffordances);
      window.removeEventListener('resize', updateScrollAffordances);
    };
  });

  $effect(() => {
    void tags;
    void tick().then(updateScrollAffordances);
  });
</script>

{#if tags.length > 0}
  <div class="relative mt-3 min-w-0 max-w-full">
    <div
      bind:this={viewport}
      role="group"
      tabindex="0"
      class="pointer-events-auto block w-full min-w-0 max-w-full snap-x snap-proximity touch-pan-x overflow-x-auto overscroll-x-contain pb-1 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`Tags for ${label}`}
    >
      <div bind:this={track} class="flex w-max min-w-full flex-nowrap gap-2">
        {#each tags as tag (tag)}
          <a
            href={tagHref(tag, collection)}
            class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
