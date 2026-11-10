<script lang="ts">
  import { onMount } from 'svelte';
  import { attachArticleSwipeNavigation } from '@lib/navigation/article-gestures';
  import { Button, Tooltip } from '@weluvabid/iris/components';
  import { ChevronLeft, ChevronRight } from '@weluvabid/iris/lucide';

  interface NavigationTarget {
    title: string;
    url: string;
  }

  interface Props {
    previous: NavigationTarget | null;
    next: NavigationTarget | null;
  }

  const { previous, next }: Props = $props();

  onMount(() =>
    attachArticleSwipeNavigation({
      previousUrl: previous?.url ?? null,
      nextUrl: next?.url ?? null,
    }),
  );
</script>

{#if previous || next}
  <Tooltip.Provider delayDuration={350}>
    <nav
      class="pointer-events-none fixed inset-0 z-30 hidden lg:block"
      aria-label="Navigate between questions in this domain"
    >
      {#if previous}
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
                  href={previous.url}
                  data-article-previous
                  aria-keyshortcuts="["
                  aria-label={`Previous question: ${previous.title}`}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button.Root>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content side="right">{previous.title}</Tooltip.Content>
          </Tooltip.Root>
        </div>
      {/if}

      {#if next}
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
                  href={next.url}
                  data-article-next
                  aria-keyshortcuts="]"
                  aria-label={`Next question: ${next.title}`}
                >
                  <ChevronRight aria-hidden="true" />
                </Button.Root>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content side="left">{next.title}</Tooltip.Content>
          </Tooltip.Root>
        </div>
      {/if}
    </nav>
  </Tooltip.Provider>
{/if}
