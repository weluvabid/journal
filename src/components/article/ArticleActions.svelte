<script lang="ts">
  import { SiGit, SiStackblitz, SiMermaid } from '@weluvabid/iris/simple-icons';

  type ArticleLinks = {
    git?: string;
    stackblitz?: string;
    mermaid?: string;
  };

  let { links, title }: { links: ArticleLinks; title: string } = $props();
  console.log(links);
</script>

<nav class="mt-4 flex items-center gap-2" aria-label={`${title} resources`}>
  {#if links.git}
    <a
      href={links.git}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label="Source repository (opens in a new tab)"
      title="Source repository"
    >
      <SiGit class="size-5" aria-hidden="true" />
    </a>
  {/if}
  {#if links.stackblitz}
    <a
      href={links.stackblitz}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label="Open interactive project in StackBlitz (opens in a new tab)"
      title="Open in StackBlitz"
    >
      <SiStackblitz class="size-5" aria-hidden="true" />
    </a>
  {/if}
  {#if links.mermaid}
    <a
      href={links.mermaid}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label="Open editable Mermaid diagram (opens in a new tab)"
      title="Open Mermaid diagram"
    >
      <SiMermaid class="size-5" aria-hidden="true" />
    </a>
  {/if}
</nav>
