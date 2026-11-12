<script lang="ts">
  import { tagHref, type TagCollection } from '@lib/journal-tags';
  interface Props { tags?: readonly string[]; label: string; collection?: TagCollection }
  let { tags = [], label, collection = 'journal' }: Props = $props();
</script>

{#if tags.length > 0}
  <nav class="pointer-events-auto mt-3 flex min-w-0 max-w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" aria-label={`Tags for ${label}`}>
    {#each tags as tag (tag)}
      <a href={tagHref(tag, collection)} class="inline-flex shrink-0 snap-start items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{tag}</a>
    {/each}
  </nav>
{/if}
