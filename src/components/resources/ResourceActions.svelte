<script lang="ts">
  import { Button, Tooltip } from '@weluvabid/iris/components';
  import { SiGit } from '@weluvabid/iris/simple-icons';

  let {
    git,
    title,
  }: {
    git: string;
    title: string;
  } = $props();
</script>

<Tooltip.Provider delayDuration={300}>
  <nav class="mt-3 flex items-center gap-2" aria-label={`${title} resources`}>
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
            class="rounded-full hover:bg-muted hover:text-foreground"
            aria-label="Source repository (opens in a new tab)"
          >
            <SiGit class="size-5" aria-hidden="true" />
          </Button.Root>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>Source repository</Tooltip.Content>
    </Tooltip.Root>
  </nav>
</Tooltip.Provider>
