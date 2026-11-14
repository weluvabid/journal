<script lang="ts">
  import { tick } from 'svelte';
  import { tagHref } from '@lib/journal-tags';

  interface Props {
    tags?: readonly string[];
    label: string;
  }

  let { tags = [], label }: Props = $props();
  let viewport: HTMLElement | undefined = $state();
  let track: HTMLDivElement | undefined = $state();
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function updateScrollAffordances(element: HTMLElement | undefined = viewport) {
    if (!element) {
      return;
    }

    const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);

    canScrollLeft = maxScrollLeft > 1 && element.scrollLeft > 1;
    canScrollRight = maxScrollLeft > 1 && element.scrollLeft < maxScrollLeft - 1;
  }

  $effect(() => {
    const viewportElement = viewport;
    const trackElement = track;

    if (!viewportElement || !trackElement) {
      return;
    }

    const update = () => updateScrollAffordances(viewportElement);

    viewportElement.addEventListener('scroll', update, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(update);

      resizeObserver.observe(viewportElement);
      resizeObserver.observe(trackElement);
      update();

      return () => {
        viewportElement.removeEventListener('scroll', update);
        resizeObserver.disconnect();
      };
    }

    window.addEventListener('resize', update);
    update();

    return () => {
      viewportElement.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  });

  $effect(() => {
    void tags;
    void tick().then(() => updateScrollAffordances());
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
            class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
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
