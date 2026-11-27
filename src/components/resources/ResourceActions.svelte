<script lang="ts">
  import { Button, Collapsible, Tooltip } from '@weluvabid/iris/components';
  import { ChevronDown, ExternalLink, Workflow } from '@weluvabid/iris/lucide';
  import { SiGit, SiStackblitz } from '@weluvabid/iris/simple-icons';

  type Resource = { label: string; url?: string };

  let {
    git,
    demo,
    stackblitz,
    diagram,
    resources = [],
    title,
    section = 'all',
  }: {
    git?: string;
    demo?: string;
    stackblitz?: string;
    diagram?: string;
    resources?: readonly Resource[];
    title: string;
    section?: 'all' | 'actions' | 'additional';
  } = $props();

  const visibleResources = $derived(
    resources.filter(
      (resource): resource is Resource & { url: string } =>
        Boolean(resource.url) &&
        resource.url !== git &&
        resource.url !== demo &&
        resource.url !== stackblitz,
    ),
  );
</script>

<Tooltip.Provider delayDuration={300}>
  {#if section !== 'additional' && (git || demo || stackblitz || diagram)}
    <nav class="mt-3 flex flex-wrap items-center gap-2" aria-label={`${title} resources`}>
      {#if git}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <Button.Root
                {...props}
                href={git}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="icon"
                class="rounded-full"
                aria-label="Source repository (opens in a new tab)"
              >
                <SiGit class="size-5" aria-hidden="true" />
              </Button.Root>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>Source repository</Tooltip.Content>
        </Tooltip.Root>
      {/if}
      {#if demo}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <Button.Root
                {...props}
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="icon"
                class="rounded-full"
                aria-label="Live demo (opens in a new tab)"
              >
                <ExternalLink class="size-5" aria-hidden="true" />
              </Button.Root>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>Live demo</Tooltip.Content>
        </Tooltip.Root>
      {/if}
      {#if diagram}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <Button.Root
                {...props}
                href={diagram}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="icon"
                class="rounded-full"
                aria-label="View architecture diagram (opens in a new tab)"
              >
                <Workflow class="size-5" aria-hidden="true" />
              </Button.Root>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>View architecture diagram</Tooltip.Content>
        </Tooltip.Root>
      {/if}
      {#if stackblitz}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <Button.Root
                {...props}
                href={stackblitz}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="icon"
                class="rounded-full"
                aria-label="Open StackBlitz demo (opens in a new tab)"
              >
                <SiStackblitz class="size-5" aria-hidden="true" />
              </Button.Root>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>Live demo on StackBlitz</Tooltip.Content>
        </Tooltip.Root>
      {/if}
    </nav>
  {/if}
  {#if section !== 'actions' && visibleResources.length > 0}
    <Collapsible.Root class="mt-3 min-w-0">
      <Collapsible.Trigger
        class="group inline-flex min-h-9 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span>Additional resources ({visibleResources.length})</span>
        <ChevronDown
          class="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180 size-4"
          aria-hidden="true"
        />
      </Collapsible.Trigger>
      <Collapsible.Content
        class="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up"
      >
        <nav aria-label={`${title} additional resources`}>
          <ul class="flex flex-col gap-2 pt-2">
            {#each visibleResources as resource (resource.url)}
              <li>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex max-w-full items-center gap-1 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <span class="break-words">{resource.label}</span>
                  <ExternalLink class="size-3.5 shrink-0" aria-hidden="true" />
                  <span class="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}
</Tooltip.Provider>
