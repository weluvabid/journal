<script lang="ts">
  import { Button } from '@weluvabid/iris/components';
  import { SiGit, SiStackblitz, SiMermaid } from '@weluvabid/iris/simple-icons';

  type ArticleLinks = {
    git?: string;
    stackblitz?: string;
    mermaid?: string;
  };

  let { links, title }: { links: ArticleLinks; title: string } = $props();
</script>

<nav class="mt-4 flex items-center gap-2" aria-label={`${title} resources`}>
  {#if links.git}
    <Button.Root
      href={links.git}
      target="_blank"
      rel="noopener noreferrer"
      variant="ghost"
      size="icon"
      class="rounded-full hover:bg-muted hover:text-foreground"
      aria-label="Source repository (opens in a new tab)"
      title="Source repository"
    >
      <SiGit class="size-5" aria-hidden="true" />
    </Button.Root>
  {/if}
  {#if links.stackblitz}
    <Button.Root
      href={links.stackblitz}
      target="_blank"
      rel="noopener noreferrer"
      variant="ghost"
      size="icon"
      class="rounded-full hover:bg-muted hover:text-foreground"
      aria-label="Open interactive project in StackBlitz (opens in a new tab)"
      title="Open in StackBlitz"
    >
      <SiStackblitz class="size-5" aria-hidden="true" />
    </Button.Root>
  {/if}
  {#if links.mermaid}
    <Button.Root
      href={links.mermaid}
      target="_blank"
      rel="noopener noreferrer"
      variant="ghost"
      size="icon"
      class="rounded-full hover:bg-muted hover:text-foreground"
      aria-label="Open editable Mermaid diagram (opens in a new tab)"
      title="Open Mermaid diagram"
    >
      <SiMermaid class="size-5" aria-hidden="true" />
    </Button.Root>
  {/if}
</nav>
