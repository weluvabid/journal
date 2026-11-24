<script lang="ts">
  import { Root, Trigger, Content } from '@weluvabid/iris/components/ui/popover';
  import { tagHref, type TagScope } from '@lib/journal-tags';

  interface Props {
    tags?: readonly string[];
    label: string;
    scope?: TagScope;
  }

  const VISIBLE_TAG_LIMIT = 3;
  const chipClass =
    'pointer-events-auto inline-flex shrink-0 items-center rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring';

  let { tags = [], label, scope = 'journal' }: Props = $props();
  let visibleTags = $derived(tags.slice(0, VISIBLE_TAG_LIMIT));
  let overflowTags = $derived(tags.slice(VISIBLE_TAG_LIMIT));
</script>

{#if tags.length > 0}
  <div class="pointer-events-none relative mt-3 flex min-w-0 max-w-full flex-wrap items-center gap-2">
    {#each visibleTags as tag (tag)}
      <a href={tagHref(tag, scope)} class={chipClass}>{tag}</a>
    {/each}

    {#if overflowTags.length > 0}
      <Root>
        <Trigger
          type="button"
          aria-label={`Show ${overflowTags.length} more tags for ${label}`}
          class={`${chipClass} cursor-pointer bg-secondary/60`}
        >
          +{overflowTags.length}
        </Trigger>
        <Content
          align="start"
          side="bottom"
          class="box-border w-full max-w-[24rem] gap-2 p-3"
          style="width: min(24rem, calc(100vw - 2rem)); max-width: min(24rem, calc(100vw - 2rem));"
          aria-label={`More tags for ${label}`}
        >
          <p class="text-xs font-medium text-muted-foreground">More topics</p>
          <div class="flex w-full min-w-0 flex-wrap gap-2">
            {#each overflowTags as tag (tag)}
              <a href={tagHref(tag, scope)} class={chipClass}>{tag}</a>
            {/each}
          </div>
        </Content>
      </Root>
    {/if}
  </div>
{/if}
