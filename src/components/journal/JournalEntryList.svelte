<script lang="ts">
  import { onDestroy } from 'svelte';
  import { InfiniteLoader, LoaderState } from 'svelte-infinite';
  import JournalEntryCard from '@components/cards/JournalEntryCard.svelte';
  import { JOURNAL_PAGE_SIZE } from '@lib/journal-pagination';

  interface JournalEntry {
    readonly id: string;
    readonly title: string;
    readonly summary: string;
    readonly type: 'engineering-note' | 'build-log' | 'deep-dive' | 'retrospective';
    readonly date: string;
    readonly dateLabel: string;
    readonly tags: readonly string[];
    readonly href: string;
  }

  interface PageResponse {
    readonly items: readonly JournalEntry[];
    readonly nextPageUrl: string | null;
  }

  interface Props {
    readonly initialEntries: readonly JournalEntry[];
    readonly nextPageUrl: string | null;
    readonly ariaLabel: string;
  }

  let { initialEntries, nextPageUrl: initialNextPageUrl, ariaLabel }: Props = $props();

  let entries = $state<JournalEntry[]>([...initialEntries]);
  let nextPageUrl = $state<string | null>(initialNextPageUrl);
  let requestInFlight = false;
  const loaderState = new LoaderState();
  const seenIds = new Set(initialEntries.map((entry) => entry.id));
  const requestedPageUrls = new Set<string>();
  let destroyed = false;

  onDestroy(() => {
    destroyed = true;
  });

  function isPageResponse(value: unknown): value is PageResponse {
    if (typeof value !== 'object' || value === null) return false;

    const candidate = value as Record<string, unknown>;
    if (!Array.isArray(candidate.items)) return false;
    if (candidate.nextPageUrl !== null && typeof candidate.nextPageUrl !== 'string') return false;

    return candidate.items.every((item) => {
      if (typeof item !== 'object' || item === null) return false;
      const entry = item as Record<string, unknown>;

      return (
        typeof entry.id === 'string' &&
        typeof entry.title === 'string' &&
        typeof entry.summary === 'string' &&
        typeof entry.type === 'string' &&
        typeof entry.date === 'string' &&
        typeof entry.dateLabel === 'string' &&
        typeof entry.href === 'string' &&
        ['engineering-note', 'build-log', 'deep-dive', 'retrospective'].includes(String(entry.type)) &&
        Array.isArray(entry.tags) &&
        entry.tags.every((tag) => typeof tag === 'string')
      );
    });
  }

  async function loadMore(): Promise<void> {
    if (requestInFlight || !nextPageUrl || destroyed) return;

    requestInFlight = true;

    try {
      const requestUrl = new URL(nextPageUrl, window.location.href);
      if (requestUrl.origin !== window.location.origin) {
        throw new TypeError('Journal pagination returned a cross-origin request URL.');
      }
      if (requestedPageUrls.has(requestUrl.href)) {
        throw new Error(`Journal pagination attempted to revisit ${requestUrl.pathname}.`);
      }

      const response = await fetch(requestUrl, {
        headers: { Accept: 'application/json' },
        cache: 'default',
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`Journal pagination request failed (${response.status}).`);
      }

      const payload: unknown = await response.json();
      if (!isPageResponse(payload)) {
        throw new TypeError('Journal pagination returned an invalid response.');
      }

      if (destroyed) return;
      if (payload.items.length > JOURNAL_PAGE_SIZE) {
        throw new RangeError(`Journal pagination returned more than ${JOURNAL_PAGE_SIZE} entries in one page.`);
      }
      const followingPageUrl = payload.nextPageUrl === null
        ? null
        : new URL(payload.nextPageUrl, window.location.href);
      if (followingPageUrl && followingPageUrl.origin !== window.location.origin) {
        throw new TypeError('Journal pagination returned a cross-origin next-page URL.');
      }
      if (followingPageUrl && requestedPageUrls.has(followingPageUrl.href)) {
        throw new Error(`Journal pagination contains a cycle at ${followingPageUrl.pathname}.`);
      }

      const pageIds = new Set<string>();
      for (const entry of payload.items) {
        if (pageIds.has(entry.id) || seenIds.has(entry.id)) {
          throw new Error(`Journal pagination returned duplicate entry id: ${entry.id}`);
        }
        pageIds.add(entry.id);
      }

      if (payload.items.length === 0 && payload.nextPageUrl !== null) {
        throw new Error('Journal pagination returned an empty page with more pages remaining.');
      }

      requestedPageUrls.add(requestUrl.href);
      for (const entry of payload.items) seenIds.add(entry.id);
      entries.push(...payload.items);
      nextPageUrl = payload.nextPageUrl;

      if (nextPageUrl === null) {
        loaderState.complete();
      } else {
        loaderState.loaded();
      }
    } catch (error) {
      if (!destroyed) {
        console.error('Unable to load more journal entries.', error);
        loaderState.error();
      }
    } finally {
      requestInFlight = false;
    }
  }
</script>

{#snippet entryCard(entry: JournalEntry, index: number)}
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
      <p class="py-4 text-center text-sm text-muted-foreground" role="status">Loading more entries…</p>
    {/snippet}

    {#snippet error(attemptLoad)}
      <div class="flex flex-col items-center gap-3 py-4 text-center" role="alert">
        <p class="text-sm text-muted-foreground">More entries couldn't be loaded.</p>
        <button
          type="button"
          class="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onclick={attemptLoad}
        >
          Try again
        </button>
      </div>
    {/snippet}

    {#snippet noData()}
      <p class="py-4 text-center text-xs text-muted-foreground">You've reached the end.</p>
    {/snippet}

    {#snippet coolingOff()}
      <p class="py-4 text-center text-xs text-muted-foreground">A moment — preparing the next entries.</p>
    {/snippet}
  </InfiniteLoader>
{:else}
  <ol class="space-y-3" data-keyboard-navigation="primary" aria-label={ariaLabel}>
    {#each entries as entry, index (entry.id)}
      {@render entryCard(entry, index)}
    {/each}
  </ol>
{/if}
