<script lang="ts">
  import ContentCard from './ContentCard.svelte';
  import TagList from './TagList.svelte';
  interface Entry {
    readonly id: string; readonly title: string; readonly summary: string;
    readonly type: string; readonly date: string; readonly dateLabel: string;
    readonly tags: readonly string[]; readonly href: string;
  }
  interface Props { entry: Entry; index: number }
  let { entry, index }: Props = $props();
</script>

<ContentCard href={entry.href} label={`Read ${entry.title}`}>
  <div class="pointer-events-none flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex min-w-0 gap-4">
      <span class="pt-1 text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
      <div class="min-w-0">
        <h2 class="font-semibold tracking-tight">{entry.title}</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{entry.summary}</p>
        <div class="pointer-events-auto inline-block min-w-0 max-w-full"><TagList tags={entry.tags} label={entry.title} /></div>
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
      <time datetime={entry.date}>{entry.dateLabel}</time><span aria-hidden="true">·</span><span class="capitalize">{entry.type.replaceAll('-', ' ')}</span>
    </div>
  </div>
</ContentCard>
