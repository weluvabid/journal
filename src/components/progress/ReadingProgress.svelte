<script lang="ts">
  import { onMount } from 'svelte';
  import { Tooltip } from '@weluvabid/iris/components';
  import { notify } from '@lib/notifications';
  import { subscribeToProgress, updateQuestionReadingProgress } from '@lib/progress/service';

  interface Props {
    questionId: string;
  }
  const { questionId }: Props = $props();
  let position = $state(0);
  let footerVisible = $state(false);
  let footerOverlapsControl = $state(false);
  let compactViewport = $state(false);
  let footerElement: HTMLElement | null = null;
  let article: HTMLElement | null = null;
  let persistTimer: number | undefined;
  let frame = 0;
  let lastPersisted = -1;
  let storageWarningShown = false;
  let trackingPaused = false;

  function measure(): number {
    if (!article) {
      return 0;
    }

    const bounds = article.getBoundingClientRect();
    const articleTop = window.scrollY + bounds.top;
    const scrollable = Math.max(0, article.scrollHeight - window.innerHeight);

    if (scrollable === 0) {
      return window.scrollY + window.innerHeight >= articleTop + article.scrollHeight ? 1 : 0;
    }

    return Math.min(1, Math.max(0, (window.scrollY - articleTop) / scrollable));
  }

  function persist(force = false): void {
    const next = Math.round(position * 65535);

    if (!force && (next === lastPersisted || Math.abs(next - lastPersisted) < 655)) {
      return;
    }

    if (next === lastPersisted) {
      return;
    }

    try {
      const result = updateQuestionReadingProgress(questionId, next);
      const savedPosition = result.snapshot.readingProgress[questionId]?.position ?? 0;

      position = Math.max(position, savedPosition / 65535);
      lastPersisted = Math.max(lastPersisted, savedPosition);

      if (!result.persisted && !storageWarningShown) {
        storageWarningShown = true;
        notify('warning', 'Reading progress is available in this tab only', {
          description: 'Browser storage is unavailable.',
        });
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Cannot update reading progress: saved progress is invalid'
      ) {
        notify('error', 'Reading position could not be saved', {
          description: 'Stored progress is invalid. Use Manage Progress to recover it.',
        });

        return;
      }

      throw error;
    }
  }

  function updateFooterControlOverlap(): void {
    if (!footerElement) {
      return;
    }

    const bounds = footerElement.getBoundingClientRect();
    const controlLeft = window.innerWidth - 56;
    const controlTop = window.innerHeight - 56;
    const controlRight = window.innerWidth - 24;
    const controlBottom = window.innerHeight - 24;

    footerOverlapsControl =
      bounds.left < controlRight &&
      bounds.right > controlLeft &&
      bounds.top < controlBottom &&
      bounds.bottom > controlTop;
  }

  function handleScroll(): void {
    trackingPaused = false;

    if (frame) {
      return;
    }

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      position = Math.max(position, measure());
      updateFooterControlOverlap();

      if (persistTimer !== undefined) {
        window.clearTimeout(persistTimer);
      }

      persistTimer = window.setTimeout(() => {
        persistTimer = undefined;
        persist();
      }, 1200);
    });
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      flush();
    }
  }

  function flush(): void {
    if (trackingPaused || persistTimer === undefined) {
      return;
    }

    window.clearTimeout(persistTimer);
    persistTimer = undefined;
    persist(true);
  }

  onMount(() => {
    article = document.querySelector<HTMLElement>('[data-article-swipe]');

    if (!article) {
      throw new Error('Reading progress requires an article container');
    }

    footerElement = document.querySelector<HTMLElement>('footer');

    if (!footerElement) {
      throw new Error('Reading progress requires a footer element');
    }

    const compactViewportQuery = window.matchMedia('(max-width: 1023px)');
    const handleViewportModeChange = (): void => {
      compactViewport = compactViewportQuery.matches;
      handleScroll();
    };

    handleViewportModeChange();
    compactViewportQuery.addEventListener('change', handleViewportModeChange);

    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        footerVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );

    footerObserver.observe(footerElement);

    const unsubscribe = subscribeToProgress((result) => {
      if (!result.ok) {
        return;
      }

      const savedPosition = result.snapshot.readingProgress[questionId]?.position ?? 0;
      const isReset =
        savedPosition < lastPersisted ||
        (savedPosition === 0 &&
          position > 0 &&
          result.snapshot.completed.length === 0 &&
          Object.keys(result.snapshot.readingProgress).length === 0);

      if (isReset) {
        if (persistTimer !== undefined) {
          window.clearTimeout(persistTimer);
          persistTimer = undefined;
        }

        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }

        trackingPaused = true;
        position = savedPosition / 65535;
        lastPersisted = savedPosition;

        return;
      }

      position = Math.max(position, savedPosition / 65535);
      lastPersisted = Math.max(lastPersisted, savedPosition);
    });

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('astro:before-preparation', flush);

    return () => {
      unsubscribe();
      footerObserver.disconnect();
      compactViewportQuery.removeEventListener('change', handleViewportModeChange);
      footerElement = null;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('astro:before-preparation', flush);

      if (persistTimer !== undefined) {
        window.clearTimeout(persistTimer);
      }

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  });
</script>

{#if position > 0 && !(compactViewport ? footerVisible : footerOverlapsControl)}
  <Tooltip.Provider delayDuration={300}>
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <button
            {...props}
            type="button"
            class="fixed bottom-6 right-6 z-50 grid size-8 appearance-none place-items-center rounded-full border-0 bg-background/90 p-0 text-border ring-1 ring-border/70 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            role="progressbar"
            aria-label={`Article reading progress: ${Math.round(position * 100)}%`}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(position * 100)}
          >
            <svg aria-hidden="true" class="size-7 -rotate-90" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="currentColor" stroke-width="2" />
              <circle
                class="text-primary transition-[stroke-dashoffset] duration-150"
                cx="14"
                cy="14"
                r="11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-dasharray="69.115"
                stroke-dashoffset={69.115 * (1 - position)}
              />
            </svg>
          </button>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>Reading progress · {Math.round(position * 100)}%</Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/if}
