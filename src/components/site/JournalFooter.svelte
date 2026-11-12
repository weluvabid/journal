<script lang="ts">
  import { SiteFooter, Button, Tooltip } from '@weluvabid/iris/components';
  import { FileText, FolderKanban } from '@weluvabid/iris/lucide';
  import { SiGithub } from '@weluvabid/iris/simple-icons';
  import { withBase } from '@lib/journal';
  import ghostMark from '../../../brand/me/brand/mark.svg?url';
  import ghostMarkLight from '../../../brand/me/brand/mark-dark.svg?url';
</script>

<Tooltip.Provider delayDuration={300}>
  <nav
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:hidden"
    aria-label="Bottom navigation"
  >
    <div
      class="pointer-events-auto flex items-stretch gap-2 rounded-2xl border border-border bg-background/90 p-2 shadow-lg shadow-black/10 backdrop-blur-xl dark:shadow-black/35"
    >
      <Button.Root
        variant="ghost"
        href={withBase('/projects/')}
        class="h-auto min-h-14 min-w-24 flex-col gap-1 rounded-xl px-5 py-2 text-muted-foreground hover:text-foreground"
      >
        <FolderKanban class="size-5" aria-hidden="true" />
        <span class="text-xs leading-none">Projects</span>
      </Button.Root>
      <Button.Root
        variant="ghost"
        href="https://example.com/resume"
        target="_blank"
        rel="noopener noreferrer"
        class="h-auto min-h-14 min-w-24 flex-col gap-1 rounded-xl px-5 py-2 text-muted-foreground hover:text-foreground"
        aria-label="Resume (opens in a new tab)"
      >
        <FileText class="size-5" aria-hidden="true" />
        <span class="text-xs leading-none">Resume</span>
      </Button.Root>
    </div>
  </nav>

  <SiteFooter>
    <a
      class="font-semibold tracking-tight text-foreground no-underline"
      href={withBase('/')}
      aria-label="Journal home"
    >
      <img
        src={ghostMarkLight}
        alt=""
        aria-hidden="true"
        width="35"
        height="32"
        class="block h-8 w-auto dark:hidden"
      />
      <img
        src={ghostMark}
        alt=""
        aria-hidden="true"
        width="35"
        height="32"
        class="hidden h-8 w-auto dark:block"
      />
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
