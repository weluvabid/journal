<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { categoryHref } from '@lib/category-href';
  import { getHorizontalScrollState, observeHorizontalScroll } from '@lib/horizontal-scroll';

  interface CategoryOption {
    readonly id: string;
    readonly name: string;
  }

  let {
    categories,
    current = 'all',
    base = '/',
  }: {
    categories: readonly CategoryOption[];
    current?: string;
    base?: string;
  } = $props();

  let viewport: HTMLElement;
  let track: HTMLDivElement;
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function syncScrollState(state: { canScrollLeft: boolean; canScrollRight: boolean }) {
    canScrollLeft = state.canScrollLeft;
    canScrollRight = state.canScrollRight;
  }

  onMount(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void tick().then(() => {
      if (cancelled || !viewport || !track) return;
      cleanup = observeHorizontalScroll(viewport, track, syncScrollState, {
        revealSelector: '[aria-current="page"]',
      });
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  });

  $effect(() => {
    void categories;
    void current;
    void tick().then(() => {
      if (viewport && track) {
        // The observer handles resize and scroll; this refreshes after category changes.
        syncScrollState(getHorizontalScrollState(viewport));
      }
    });
  });
</script>

<nav class="relative min-w-0 max-w-full" aria-label="Journal categories">
  <div
    bind:this={viewport}
    class="block w-full min-w-0 max-w-full snap-x snap-proximity touch-pan-x overflow-x-auto overscroll-x-contain pb-1"
    aria-label="Browse journal categories"
  >
    <div bind:this={track} class="flex w-max min-w-full flex-nowrap gap-2">
      <a
        href={categoryHref('all', base)}
        aria-current={current === 'all' ? 'page' : undefined}
        class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        class:bg-muted={current === 'all'}
      >
        All entries
      </a>
      {#each categories as category (category.id)}
        <a
          href={categoryHref(category.id, base)}
          aria-current={current === category.id ? 'page' : undefined}
          class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          class:bg-muted={current === category.id}
        >
          {category.name}
        </a>
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
</nav>
