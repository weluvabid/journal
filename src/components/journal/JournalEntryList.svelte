<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { Button } from '@weluvabid/iris/components';
  import { SvelteSet } from 'svelte/reactivity';
  import { InfiniteLoader, LoaderState } from 'svelte-infinite';
  import JournalEntryCard from '@components/cards/JournalEntryCard.svelte';
  import { JOURNAL_PAGE_SIZE } from '@lib/journal-pagination';
  import { fetchJournalPage } from '@lib/journal-list/fetch-page';
  import type { JournalListEntry } from '@lib/journal-list/types';

  interface Props {
    readonly initialEntries: readonly JournalListEntry[];
    readonly nextPageUrl: string | null;
    readonly ariaLabel: string;
  }

  let { initialEntries, nextPageUrl: initialNextPageUrl, ariaLabel }: Props = $props();

  // Props seed pagination once; subsequent prop updates must not discard appended entries.
  const initialState = untrack(() => ({
    entries: [...initialEntries],
    nextPageUrl: initialNextPageUrl,
    seenIds: new SvelteSet(initialEntries.map((entry) => entry.id)),
  }));

  let entries = $state<JournalListEntry[]>(initialState.entries);
  let nextPageUrl = $state<string | null>(initialState.nextPageUrl);
  let requestInFlight = false;

  const loaderState = new LoaderState();
  const seenIds = initialState.seenIds;
  const requestedPageUrls = new SvelteSet<string>();
  let destroyed = false;
  let activeRequest: AbortController | undefined;

  onDestroy(() => {
    destroyed = true;

    activeRequest?.abort();
  });

  async function loadMore(): Promise<void> {
    if (requestInFlight || !nextPageUrl || destroyed) {
      return;
    }

    requestInFlight = true;

    const controller = new AbortController();

    activeRequest = controller;

    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const { response: payload, requestUrl } = await fetchJournalPage({
        pageUrl: nextPageUrl,
        currentUrl: window.location.href,
        currentOrigin: window.location.origin,
        pageSize: JOURNAL_PAGE_SIZE,
        seenIds,
        requestedPageUrls,
        signal: controller.signal,
      });

      if (destroyed) {
        return;
      }

      requestedPageUrls.add(requestUrl.href);

      for (const entry of payload.items) {
        seenIds.add(entry.id);
      }

      entries.push(...payload.items);

      nextPageUrl = payload.nextPageUrl;

      if (nextPageUrl === null) {
        loaderState.complete();
      } else {
        loaderState.loaded();
      }
    } catch (error) {
      if (!destroyed) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to load more journal entries.', error);
        }

        loaderState.error();
      }
    } finally {
      window.clearTimeout(timeoutId);

      if (activeRequest === controller) {
        activeRequest = undefined;
      }

      requestInFlight = false;
    }
  }
</script>

{#snippet entryCard(entry: JournalListEntry, index: number)}
  <li><JournalEntryCard {entry} {index} /></li>
{/snippet}

{#if initialNextPageUrl}
  <InfiniteLoader
    {loaderState}
    triggerLoad={loadMore}
    intersectionOptions={{ rootMargin: '0px 0px 480px 0px' }}
  >
    <ol class="space-y-3" data-keyboard-navigation="primary" aria-label={ariaLabel}>
      {#each entries as entry, index (entry.id)}
        {@render entryCard(entry, index)}
      {/each}
    </ol>

    {#snippet loading()}
      <p class="py-4 text-center text-sm text-muted-foreground" role="status">
        Loading more entries…
      </p>
    {/snippet}

    {#snippet error(attemptLoad)}
      <div class="flex flex-col items-center gap-3 py-4 text-center" role="alert">
        <p class="text-sm text-muted-foreground">More entries couldn't be loaded.</p>
        <Button.Root type="button" variant="outline" onclick={attemptLoad}>Try again</Button.Root>
      </div>
    {/snippet}

    {#snippet noData()}
      <p class="py-4 text-center text-xs text-muted-foreground">You've reached the end.</p>
    {/snippet}

    {#snippet coolingOff()}
      <p class="py-4 text-center text-xs text-muted-foreground">
        A moment — preparing the next entries.
      </p>
    {/snippet}
  </InfiniteLoader>
{:else}
  <ol class="space-y-3" data-keyboard-navigation="primary" aria-label={ariaLabel}>
    {#each entries as entry, index (entry.id)}
      {@render entryCard(entry, index)}
    {/each}
  </ol>
{/if}
