<script lang="ts">
  import { Button, Tooltip } from '@weluvabid/iris/components';
  import { SiGit, SiStackblitz, SiMermaid } from '@weluvabid/iris/simple-icons';
  import GhostMark from '@components/brand/GhostMark.svelte';

  type ResourceLinks = {
    git?: string;
    stackblitz?: string;
    mermaid?: string;
  };

  let { links, title, journalHref }: {
    links: ResourceLinks;
    title: string;
    journalHref?: string;
  } = $props();
</script>

<Tooltip.Provider delayDuration={300}>
  <nav class="mt-4 flex items-center gap-2" aria-label={`${title} resources`}>
    {#if links.git}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              href={links.git}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="icon"
              class="rounded-full hover:bg-muted hover:text-foreground"
              aria-label="Source repository (opens in a new tab)"
            >
              <SiGit class="size-5" aria-hidden="true" />
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Source repository</Tooltip.Content>
      </Tooltip.Root>
    {/if}

    {#if links.stackblitz}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              href={links.stackblitz}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="icon"
              class="rounded-full hover:bg-muted hover:text-foreground"
              aria-label="Open interactive project in StackBlitz (opens in a new tab)"
            >
              <SiStackblitz class="size-5" aria-hidden="true" />
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Open in StackBlitz</Tooltip.Content>
      </Tooltip.Root>
    {/if}

    {#if journalHref}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              href={journalHref}
              variant="ghost"
              size="icon"
              class="ghost-link rounded-full hover:bg-muted hover:text-foreground"
              aria-label="Read the related journal entry"
            >
              <GhostMark class="size-5" gradientId="project-journal-ghost" />
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Related journal entry</Tooltip.Content>
      </Tooltip.Root>
    {/if}

    {#if links.mermaid}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              href={links.mermaid}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="icon"
              class="rounded-full hover:bg-muted hover:text-foreground"
              aria-label="Open editable Mermaid diagram (opens in a new tab)"
            >
              <SiMermaid class="size-5" aria-hidden="true" />
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Open Mermaid diagram</Tooltip.Content>
      </Tooltip.Root>
    {/if}
  </nav>
</Tooltip.Provider>
