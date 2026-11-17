<script lang="ts">
  import { Root } from '@weluvabid/iris/components/ui/scroll-area';
  import { tagHref, type TagScope } from '@lib/journal-tags';

  interface Props {
    tags?: readonly string[];
    label: string;
    scope?: TagScope;
  }

  let { tags = [], label, scope = 'journal' }: Props = $props();
</script>

{#if tags.length > 0}
  <div class="relative mt-3 min-w-0 max-w-full overflow-hidden">
    <Root
      orientation="horizontal"
      class="pointer-events-inherit relative h-9 w-full min-w-0 max-w-full"
      scrollbarXClasses="!absolute !inset-x-0 !bottom-0 !left-0 !right-0 !h-1.5 !w-full"
    >
      <div
        role="group"
        aria-label={`Tags for ${label}`}
        class="flex w-max min-w-full flex-nowrap gap-2 px-0.5 pb-2"
      >
        <div class="inline-flex w-max flex-nowrap gap-2 pointer-events-auto">
          {#each tags as tag (tag)}
            <a
              href={tagHref(tag, scope)}
              class="inline-flex shrink-0 items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              >{tag}</a
            >
          {/each}
        </div>
      </div>
    </Root>
  </div>
{/if}
