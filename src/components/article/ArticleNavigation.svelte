<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { navigate } from 'astro:transitions/client';
  import { attachArticleSwipeNavigation } from '@lib/navigation/article-gestures';
  import { parseJournalNavigationContext, resolveJournalNavigation } from '@lib/journal-navigation';
  import { entryHref } from '@lib/journal';
  import { Button, Tooltip } from '@weluvabid/iris/components';
  import { ChevronLeft, ChevronRight } from '@weluvabid/iris/lucide';

  interface Entry {
    id: string;
    title: string;
  }

  interface NavigationTarget extends Entry {
    url: string;
  }

  interface Props {
    currentId: string;
    categoryId: string;
    allEntries: Entry[];
    categoryEntries: Entry[];
    previous: NavigationTarget | null;
    next: NavigationTarget | null;
  }

  const { currentId, categoryId, allEntries, categoryEntries, previous, next }: Props = $props();
  let previousTarget = $state<NavigationTarget | null>(untrack(() => previous));
  let nextTarget = $state<NavigationTarget | null>(untrack(() => next));

  onMount(() => {
    const context = parseJournalNavigationContext(window.location.search, categoryId);
    const sequence = context.type === 'category' ? categoryEntries : allEntries;
    const { previous: previousEntry, next: nextEntry } = resolveJournalNavigation(
      currentId,
      sequence.map((entry) => ({ data: entry })),
    );
    const hrefContext = context.type === 'category' ? { categoryId: context.categoryId } : 'all';

    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-series-entry]')) {
      const id = link.dataset.seriesEntry;

      if (id) {
        link.href = entryHref(id, hrefContext);
      }
    }

    previousTarget = previousEntry
      ? { ...previousEntry.data, url: entryHref(previousEntry.data.id, hrefContext) }
      : null;
    nextTarget = nextEntry
      ? { ...nextEntry.data, url: entryHref(nextEntry.data.id, hrefContext) }
      : null;

    return attachArticleSwipeNavigation(
      {
        previousUrl: previousTarget?.url ?? null,
        nextUrl: nextTarget?.url ?? null,
      },
      (destination) => {
        void navigate(destination);
      },
    );
  });
</script>

{#if previousTarget || nextTarget}
  <Tooltip.Provider delayDuration={350}>
    <nav
      class="pointer-events-none fixed inset-0 z-30 hidden lg:block"
      aria-label="Navigate between journal entries"
    >
      {#if previousTarget}
        <div
          class="pointer-events-none absolute top-1/2 -translate-y-1/2 [left:max(1rem,calc((100vw-48rem)/2-3.5rem))]"
        >
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button.Root
                  {...props}
                  variant="ghost"
                  size="icon"
                  class="pointer-events-auto rounded-full border border-border/70 bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
                  href={previousTarget.url}
                  data-article-previous
                  aria-keyshortcuts="["
                  aria-label={`Previous entry: ${previousTarget.title}`}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button.Root>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content side="right">{previousTarget.title}</Tooltip.Content>
          </Tooltip.Root>
        </div>
      {/if}

      {#if nextTarget}
        <div
          class="pointer-events-none absolute top-1/2 -translate-y-1/2 [right:max(1rem,calc((100vw-48rem)/2-3.5rem))]"
        >
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button.Root
                  {...props}
                  variant="ghost"
                  size="icon"
                  class="pointer-events-auto rounded-full border border-border/70 bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
                  href={nextTarget.url}
                  data-article-next
                  aria-keyshortcuts="]"
                  aria-label={`Next entry: ${nextTarget.title}`}
                >
                  <ChevronRight aria-hidden="true" />
                </Button.Root>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content side="left">{nextTarget.title}</Tooltip.Content>
          </Tooltip.Root>
        </div>
      {/if}
    </nav>
  </Tooltip.Provider>
{/if}
