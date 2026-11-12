<script lang="ts">
  import { SiteFooter, Button, Tooltip } from '@weluvabid/iris/components';
  import { NotebookText, FileText, FolderKanban } from '@weluvabid/iris/lucide';
  import { SiGithub } from '@weluvabid/iris/simple-icons';
  import { withBase } from '@lib/journal';
  import GhostMark from '@components/brand/GhostMark.svelte';
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
        href={withBase('/journal/')}
        class="h-auto min-h-14 min-w-20 flex-col gap-1 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
        aria-label="Writing"
      >
        <NotebookText class="size-5" aria-hidden="true" />
        <span class="text-xs leading-none">Writing</span>
      </Button.Root>
      <Button.Root
        variant="ghost"
        href={withBase('/projects/')}
        class="h-auto min-h-14 min-w-20 flex-col gap-1 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
      >
        <FolderKanban class="size-5" aria-hidden="true" />
        <span class="text-xs leading-none">Projects</span>
      </Button.Root>
      <Button.Root
        variant="ghost"
        href="https://example.com/resume"
        target="_blank"
        rel="noopener noreferrer"
        class="h-auto min-h-14 min-w-20 flex-col gap-1 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
        aria-label="Resume (opens in a new tab)"
      >
        <FileText class="size-5" aria-hidden="true" />
        <span class="text-xs leading-none">Resume</span>
      </Button.Root>
    </div>
  </nav>

  <SiteFooter>
    <a
      class="ghost-link inline-flex size-10 items-center justify-center text-foreground no-underline"
      href={withBase('/')}
      aria-label="Journal home"
    >
      <GhostMark class="h-7 w-auto" gradientId="footer-ghost-fill" />
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
            <SiGithub class="size-6" aria-hidden="true" />
          </Button.Root>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>GitHub repository</Tooltip.Content>
    </Tooltip.Root>
  </SiteFooter>
</Tooltip.Provider>
