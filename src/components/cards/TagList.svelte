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
  let canScrollRight = $state(false);

  function updateScrollAffordance() {
    if (!viewport) return;

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    canScrollRight = maxScrollLeft > 1 && viewport.scrollLeft < maxScrollLeft - 1;
  }

  onMount(() => {
    if (!viewport || !track) return;

    viewport.addEventListener('scroll', updateScrollAffordance, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateScrollAffordance);
      resizeObserver.observe(viewport);
      resizeObserver.observe(track);

      updateScrollAffordance();

      return () => {
        viewport.removeEventListener('scroll', updateScrollAffordance);
        resizeObserver.disconnect();
      };
    }

    window.addEventListener('resize', updateScrollAffordance);
    updateScrollAffordance();

    return () => {
      viewport.removeEventListener('scroll', updateScrollAffordance);
      window.removeEventListener('resize', updateScrollAffordance);
    };
  });

  $effect(() => {
    const currentTags = tags;
    void currentTags;
    void tick().then(updateScrollAffordance);
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
      class="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background via-background/80 to-transparent motion-safe:transition-opacity"
      class:opacity-100={canScrollRight}
      class:opacity-0={!canScrollRight}
      aria-hidden="true"
    ></span>
  </div>
{/if}
