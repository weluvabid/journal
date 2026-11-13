<script lang="ts">
  import { Badge } from '@weluvabid/iris/components';
  import ContentCard from './ContentCard.svelte';
  import TagList from './TagList.svelte';

  interface Entry {
    readonly id: string;
    readonly title: string;
    readonly summary: string;
    readonly type: string;
    readonly date: string;
    readonly dateLabel: string;
    readonly tags: readonly string[];
    readonly series?: { readonly part: number; readonly totalParts: number };
    readonly href: string;
  }

  interface Props {
    entry: Entry;
    index: number;
    variant?: 'list' | 'featured';
    class?: string;
  }

  let { entry, index, variant = 'list', class: className = '' }: Props = $props();
  const number = $derived(String(index + 1).padStart(2, '0'));
</script>

<ContentCard href={entry.href} label={`Read ${entry.title}`} class={className}>
  {#if variant === 'featured'}
    <div class="flex h-full min-w-0 flex-col gap-3 p-5">
      <div class="flex items-center gap-2">
        <span class="text-xs tabular-nums text-muted-foreground">{number}</span>
        <Badge.Badge variant="secondary" class="capitalize"
          >{entry.type.replaceAll('-', ' ')}</Badge.Badge
        >
        {#if entry.series}
          <Badge.Badge variant="outline">
            Series · {entry.series.part}/{entry.series.totalParts}
          </Badge.Badge>
        {/if}
      </div>
      <div class="min-w-0">
        <h2 class="font-medium tracking-tight">{entry.title}</h2>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">{entry.summary}</p>
      </div>
      <div class="block w-full min-w-0 max-w-full">
        <TagList tags={entry.tags} label={entry.title} />
      </div>
      <time class="mt-auto pt-4 text-xs text-muted-foreground" datetime={entry.date}
        >{entry.dateLabel}</time
      >
    </div>
  {:else}
    <div class="flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex min-w-0 gap-4">
        <span class="pt-1 text-xs tabular-nums text-muted-foreground">{number}</span>
        <div class="min-w-0">
          <h2 class="font-semibold tracking-tight">{entry.title}</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{entry.summary}</p>
          {#if entry.series}
            <div class="mt-2">
              <Badge.Badge variant="outline">
                Series · Part {entry.series.part}/{entry.series.totalParts}
              </Badge.Badge>
            </div>
          {/if}
          <div class="block w-full min-w-0 max-w-full">
            <TagList tags={entry.tags} label={entry.title} />
          </div>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <time datetime={entry.date}>{entry.dateLabel}</time><span aria-hidden="true">·</span><span
          class="capitalize">{entry.type.replaceAll('-', ' ')}</span
        >
      </div>
    </div>
  {/if}
</ContentCard>
