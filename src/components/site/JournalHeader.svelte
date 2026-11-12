<script lang="ts">
  import { onMount } from 'svelte';
  import { SiteHeader, Button, Tooltip } from '@weluvabid/iris/components';
  import { BookSearch, FolderKanban, Moon, Sun, Search, CircleHelp } from '@weluvabid/iris/lucide';
  import { SiGithub } from '@weluvabid/iris/simple-icons';
  import { getInitialTheme, toggleTheme } from '@weluvabid/iris/theme';
  import SearchPanel from '@components/search/SearchPanel.svelte';
  import HelpDialog from '@components/site/HelpDialog.svelte';
  import { installKeyboardController } from '@lib/keyboard/controller';
  import { withBase } from '@lib/journal';

  let theme = $state<'light' | 'dark'>('light');
  let searchOpen = $state(false);
  let helpOpen = $state(false);

  onMount(() => {
    theme = getInitialTheme();

    return installKeyboardController({
      onSearch: () => {
        helpOpen = false;
        searchOpen = true;
      },
      onHelp: () => {
        helpOpen = true;
      },
    });
  });

  function handleThemeToggle(): void {
    theme = toggleTheme(theme);
  }
</script>

<Tooltip.Provider delayDuration={300}>
  <SiteHeader>
    <a
      class="inline-flex min-h-10 shrink-0 items-center rounded-full font-semibold tracking-tight text-foreground no-underline"
      href={withBase('/')}
      aria-label="Journal home"
    >
      fa
    </a>

    <nav class="flex shrink-0 items-center gap-1" aria-label="Primary navigation">
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              variant="ghost"
              size="icon"
              class="rounded-full"
              href={withBase('/journal/')}
              aria-label="Browse writing"
            >
              <BookSearch aria-hidden="true" />
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Browse writing</Tooltip.Content>
      </Tooltip.Root>

      <div class="hidden sm:block">
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <Button.Root
                {...props}
                variant="ghost"
                size="icon"
                class="rounded-full"
                href={withBase('/projects/')}
                aria-label="Projects"
              >
                <FolderKanban aria-hidden="true" />
              </Button.Root>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>Projects</Tooltip.Content>
        </Tooltip.Root>
      </div>

      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              variant="ghost"
              size="icon"
              class="rounded-full"
              aria-label="Search Journal"
              aria-keyshortcuts="Meta+K Control+K"
              onclick={() => (searchOpen = true)}
            >
              <Search aria-hidden="true" />
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Search</Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              variant="ghost"
              size="icon"
              class="rounded-full"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={theme === 'dark'}
              onclick={handleThemeToggle}
            >
              {#if theme === 'dark'}<Sun aria-hidden="true" />{:else}<Moon
                  aria-hidden="true"
                />{/if}
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          >{theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}</Tooltip.Content
        >
      </Tooltip.Root>

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

      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button.Root
              {...props}
              variant="ghost"
              size="icon"
              class="rounded-full"
              aria-label="Help and keyboard shortcuts"
              aria-keyshortcuts="?"
              onclick={() => (helpOpen = true)}
            >
              <CircleHelp aria-hidden="true" />
            </Button.Root>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Help</Tooltip.Content>
      </Tooltip.Root>
    </nav>
  </SiteHeader>
</Tooltip.Provider>
<HelpDialog bind:open={helpOpen} />
<SearchPanel bind:open={searchOpen} />
