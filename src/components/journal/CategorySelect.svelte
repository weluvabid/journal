<script lang="ts">
  import { onMount, tick } from 'svelte';

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

  const normalizedBase = base.replace(/^\/+|\/+$/gu, '');
  const prefix = normalizedBase ? `/${normalizedBase}` : '';

  function categoryHref(value: string): string {
    return value === 'all'
      ? `${prefix}/journal/`
      : `${prefix}/journal/category/${encodeURIComponent(value)}/`;
  }

  function updateScrollAffordances() {
    if (!viewport) {
      return;
    }

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    canScrollLeft = maxScrollLeft > 1 && viewport.scrollLeft > 1;
    canScrollRight = maxScrollLeft > 1 && viewport.scrollLeft < maxScrollLeft - 1;
  }

  function revealCurrentCategory() {
    if (!viewport) {
      return;
    }

    const active = viewport.querySelector<HTMLElement>('[aria-current="page"]');

    if (!active) {
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const fullyVisible =
      activeRect.left >= viewportRect.left && activeRect.right <= viewportRect.right;

    if (!fullyVisible) {
      const centeredLeft =
        viewport.scrollLeft +
        activeRect.left -
        viewportRect.left -
        (viewport.clientWidth - activeRect.width) / 2;
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

      viewport.scrollLeft = Math.max(0, Math.min(centeredLeft, maxScrollLeft));
    }

    updateScrollAffordances();
  }

  onMount(() => {
    if (!viewport || !track) {
      return;
    }

    viewport.addEventListener('scroll', updateScrollAffordances, { passive: true });
    void tick().then(revealCurrentCategory);

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(revealCurrentCategory);

      resizeObserver.observe(viewport);
      resizeObserver.observe(track);
      updateScrollAffordances();

      return () => {
        viewport.removeEventListener('scroll', updateScrollAffordances);
        resizeObserver.disconnect();
      };
    }

    window.addEventListener('resize', revealCurrentCategory);
    updateScrollAffordances();

    return () => {
      viewport.removeEventListener('scroll', updateScrollAffordances);
      window.removeEventListener('resize', revealCurrentCategory);
    };
  });

  $effect(() => {
    void categories;
    void tick().then(updateScrollAffordances);
  });
</script>

<nav class="relative min-w-0 max-w-full" aria-label="Journal categories">
  <div
    bind:this={viewport}
    tabindex="0"
    class="block w-full min-w-0 max-w-full snap-x snap-proximity touch-pan-x overflow-x-auto overscroll-x-contain pb-1 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    aria-label="Browse journal categories"
  >
    <div bind:this={track} class="flex w-max min-w-full flex-nowrap gap-2">
      <a
        href={categoryHref('all')}
        aria-current={current === 'all' ? 'page' : undefined}
        class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        class:bg-muted={current === 'all'}
      >
        All entries
      </a>
      {#each categories as category (category.id)}
        <a
          href={categoryHref(category.id)}
          aria-current={current === category.id ? 'page' : undefined}
          class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
