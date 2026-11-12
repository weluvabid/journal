<script lang="ts">
  import { Dialog, Kbd } from '@weluvabid/iris/components';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] min-h-0 flex-col overflow-hidden sm:max-w-lg"
  >
    <Dialog.Header class="shrink-0">
      <Dialog.Title>Keyboard shortcuts</Dialog.Title>
      <Dialog.Description>Navigate Journal without leaving the keyboard.</Dialog.Description>
    </Dialog.Header>

    <div class="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain py-1">
      <section aria-labelledby="help-navigation-heading">
        <h3
          id="help-navigation-heading"
          class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Navigation
        </h3>
        <dl class="space-y-3">
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted-foreground">Open search</dt>
            <dd class="flex items-center gap-1">
              <Kbd.Kbd>⌘ K</Kbd.Kbd><span class="text-muted-foreground">/</span><Kbd.Kbd
                >Ctrl K</Kbd.Kbd
              >
            </dd>
          </div>


          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted-foreground">Go to numbered card</dt>
            <dd class="flex items-center gap-1">
              <Kbd.Kbd>G</Kbd.Kbd><span class="text-muted-foreground">then number</span>
            </dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted-foreground">Previous / next article</dt>
            <dd class="flex items-center gap-1"><Kbd.Kbd>[</Kbd.Kbd><span class="text-muted-foreground">/</span><Kbd.Kbd>]</Kbd.Kbd></dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted-foreground">Open selected card</dt>
            <dd><Kbd.Kbd>Enter</Kbd.Kbd></dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted-foreground">Edit card number</dt>
            <dd><Kbd.Kbd>Backspace</Kbd.Kbd></dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="help-general-heading">
        <h3
          id="help-general-heading"
          class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          General
        </h3>
        <dl class="space-y-3">
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted-foreground">Open help</dt>
            <dd><Kbd.Kbd>?</Kbd.Kbd></dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted-foreground">Close dialog or cancel card navigation</dt>
            <dd><Kbd.Kbd>Esc</Kbd.Kbd></dd>
          </div>
        </dl>
      </section>
      <p class="text-xs text-muted-foreground">
        On touch screens, use the navigation controls to explore related writing. For
        numbered cards, press G, type the card number, then press Enter. Backspace edits the number;
        the sequence expires after two seconds of inactivity.
      </p>
    </div>
  </Dialog.Content>
</Dialog.Root>
