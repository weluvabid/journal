<script lang="ts">
  import { onMount } from 'svelte';
  import { Command, Alert, Spinner, Kbd } from '@weluvabid/iris/components';
  import { questionHref, rankSearchResults, type SearchDocument } from '@lib/atlas';
  import { isAbortError, loadSearchIndex } from '@lib/search';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
  let documents: SearchDocument[] = $state([]);
  let query = $state('');
  let loading = $state(true);
  let loadError = $state('');

  const results = $derived(rankSearchResults(documents, query, 10));
  const normalizedQuery = $derived(query.trim());

  onMount(() => {
    const controller = new AbortController();

    async function loadIndex(): Promise<void> {
      try {
        documents = await loadSearchIndex(controller.signal);
      } catch (error) {
        if (!isAbortError(error)) {
          loadError =
            error instanceof Error ? error.message : 'An unexpected search error occurred';
        }
      } finally {
        if (!controller.signal.aborted) {
          loading = false;
        }
      }
    }

    void loadIndex();

    return () => controller.abort();
  });
</script>

{#snippet commandContents()}
  <Command.Input
    bind:value={query}
    placeholder="Search questions and concepts…"
    class="text-base"
    aria-label="Search questions and concepts"
  />
  <Command.List>
    {#if loading}
      <div class="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
        <Spinner.Spinner /> Loading the handbook index…
      </div>
    {:else if loadError}
      <div class="p-3">
        <Alert.Root variant="destructive"
          ><Alert.Title>Search unavailable</Alert.Title><Alert.Description
            >{loadError}</Alert.Description
          ></Alert.Root
        >
      </div>
    {:else if !normalizedQuery}
      <Command.Empty>Start typing to search {documents.length} questions.</Command.Empty>
    {:else if results.length === 0}
      <Command.Empty>No results for “{normalizedQuery}”. Try a broader term.</Command.Empty>
    {:else}
      <Command.Group heading="Questions">
        {#each results as result (result.id)}
          <Command.LinkItem
            href={questionHref(result.id)}
            value={`${result.title} ${result.summary} ${result.tags.join(' ')}`}
          >
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium">{result.title}</span>
              <span class="mt-0.5 block truncate text-xs text-muted-foreground"
                >{result.summary}</span
              >
            </span>
            <span class="shrink-0 text-xs text-muted-foreground">{result.minutes} min</span>
          </Command.LinkItem>
        {/each}
      </Command.Group>
    {/if}
  </Command.List>
  {#if !loading && !loadError}
    <div
      class="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground"
    >
      <span>{normalizedQuery ? `${results.length} matching questions` : 'Search the handbook'}</span
      >
      <span><Kbd.Kbd>↑↓</Kbd.Kbd> Navigate <Kbd.Kbd class="ml-2">↵</Kbd.Kbd> Open</span>
    </div>
  {/if}
{/snippet}

<Command.Dialog
  bind:open
  title="Search Frontend Atlas"
  description={documents.length > 0
    ? `Search ${documents.length} questions and concepts across the handbook.`
    : 'Search questions and concepts across the handbook.'}
  shouldFilter={false}
>
  {@render commandContents()}
</Command.Dialog>
