<script lang="ts">
  import { SiteFooter, Button, Tooltip } from '@weluvabid/iris/components';
  import { SiGithub } from '@weluvabid/iris/simple-icons';
  import { withBase } from '@lib/journal';
</script>

<Tooltip.Provider delayDuration={300}>
  <SiteFooter>
    <a
      class="font-semibold tracking-tight text-foreground no-underline"
      href={withBase('/')}
      aria-label="Journal home"
    >
      fa
    </a>
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <Button.Root
            {...props}
            variant="ghost"
            size="icon"
            class="rounded-full"
            href="https://github.com/weluvabid/journal"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Journal on GitHub (opens in a new tab)"
          >
            <SiGithub aria-hidden="true" />
          </Button.Root>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>GitHub repository</Tooltip.Content>
    </Tooltip.Root>
  </SiteFooter>
</Tooltip.Provider>
