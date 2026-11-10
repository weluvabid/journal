<script lang="ts">
  import { AlertDialog, Button, Dialog, Progress } from '@weluvabid/iris/components';
  import { ArrowLeft, Download, ImageUp, Trash2 } from '@weluvabid/iris/lucide';
  import { notify } from '@lib/notifications';
  import { decodeProgressQr, encodeProgressQr } from '@lib/progress/qr';
  import { clearProgress, mergeProgress, replaceProgress } from '@lib/progress/service';
  import { getInProgressIds, type ProgressSnapshot } from '@lib/progress/model';

  interface Props {
    open?: boolean;
    mode?: 'overview' | 'export' | 'import';
    snapshot: ProgressSnapshot;
    questionIds: string[];
    onImported: (snapshot: ProgressSnapshot) => void;
  }

  let {
    open = $bindable(false),
    mode = $bindable('overview'),
    snapshot,
    questionIds,
    onImported,
  }: Props = $props();
  let qrUrl = $state('');
  let qrError = $state(false);
  let pendingSnapshot = $state<ProgressSnapshot | undefined>();
  let busy = $state(false);
  let clearDialogOpen = $state(false);
  let fileInput = $state<HTMLInputElement>();

  const inProgressCount = $derived(
    getInProgressIds(snapshot).filter((id) => questionIds.includes(id)).length,
  );
  const completedCount = $derived(
    snapshot.completed.filter((id) => questionIds.includes(id)).length,
  );
  const completionPercentage = $derived(
    questionIds.length ? (completedCount / questionIds.length) * 100 : 0,
  );

  $effect(() => {
    if (!open || mode !== 'export') {
      return;
    }

    let cancelled = false;

    qrUrl = '';
    qrError = false;

    void (async () => {
      const [{ default: encodeQR }, { svgToPng }] = await Promise.all([
        import('qr'),
        import('qr/dom.js'),
      ]);
      const payload = encodeProgressQr(snapshot, questionIds);
      const svg = encodeQR(payload, 'svg', { ecc: 'quartile', border: 4 });
      const pngDataUrl = await svgToPng(svg, 640, 640);

      if (cancelled) {
        return;
      }

      qrUrl = pngDataUrl;
    })().catch((error: unknown) => {
      if (cancelled) {
        return;
      }

      qrError = true;
      notify('error', 'Could not generate progress QR image', {
        description:
          error instanceof Error ? error.message : 'An unexpected QR generation error occurred.',
      });
    });

    return () => {
      cancelled = true;
    };
  });

  function selectMode(next: 'export' | 'import'): void {
    pendingSnapshot = undefined;
    mode = next;
  }

  async function importQrImage(event: Event): Promise<void> {
    const input = event.currentTarget;

    if (!(input instanceof HTMLInputElement) || !input.files?.[0]) {
      return;
    }

    const file = input.files[0];

    input.value = '';
    pendingSnapshot = undefined;

    if (!file.type.startsWith('image/')) {
      notify('error', 'Choose an image file containing a Frontend Atlas QR code.');

      return;
    }

    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      notify('error', 'Image rejected', {
        description: 'The image must be between 1 byte and 10 MiB.',
      });

      return;
    }

    busy = true;
    let bitmap: ImageBitmap | undefined;

    try {
      bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;

      if (bitmap.width === 0 || bitmap.height === 0 || pixels > 16_000_000) {
        throw new RangeError('Image dimensions exceed the 16-megapixel limit.');
      }

      const canvas = document.createElement('canvas');

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) {
        throw new Error('Canvas image processing is unavailable in this browser.');
      }

      context.drawImage(bitmap, 0, 0);
      const { default: decodeQR } = await import('qr/decode.js');
      const payload = decodeQR(context.getImageData(0, 0, canvas.width, canvas.height), {
        effort: Infinity,
        timeLimit: Infinity,
      });

      pendingSnapshot = decodeProgressQr(payload, questionIds);
    } catch (error) {
      // Keep decoder details in developer tools; decoder-specific messages (for
      // example, "finder") are implementation details and must never reach users.
      console.warn('Progress QR image import was rejected:', error);

      if (
        error instanceof RangeError &&
        error.message === 'Image dimensions exceed the 16-megapixel limit.'
      ) {
        notify('error', 'Image is too large', {
          description: 'Choose an image smaller than 16 megapixels.',
        });
      } else if (
        error instanceof DOMException &&
        [
          'EncodingError',
          'InvalidStateError',
          'NotSupportedError',
          'OperationError',
          'SecurityError',
        ].includes(error.name)
      ) {
        notify('error', 'This image could not be read', {
          description: 'Try a PNG or JPEG image exported from Frontend Atlas.',
        });
      } else {
        notify('error', 'No valid Frontend Atlas progress QR code was found.', {
          description:
            'Choose an image containing a progress QR code exported from Frontend Atlas.',
        });
      }
    } finally {
      bitmap?.close();
      busy = false;
    }
  }

  function applyImportedProgress(strategy: 'merge' | 'replace'): void {
    if (!pendingSnapshot) {
      throw new Error('Cannot apply QR import without a validated snapshot.');
    }

    const incomingCount = pendingSnapshot.completed.length;

    try {
      const result =
        strategy === 'merge' ? mergeProgress(pendingSnapshot) : replaceProgress(pendingSnapshot);

      onImported(result.snapshot);
      pendingSnapshot = undefined;

      if (!result.persisted) {
        notify('warning', 'Progress is available in this tab only', {
          description: 'Browser storage is unavailable, so the change was not saved permanently.',
        });
      } else {
        notify('success', strategy === 'merge' ? 'Progress merged' : 'Progress replaced', {
          description: `${incomingCount} completed questions imported.`,
        });
      }

      mode = 'overview';
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Cannot merge progress: saved progress is invalid'
      ) {
        notify('error', 'Local progress is invalid', {
          description: 'Replace local progress to recover it.',
        });

        return;
      }

      throw error;
    }
  }

  function exportDownloaded(): void {
    if (!qrUrl) {
      throw new Error('Cannot export progress before the QR image has been generated.');
    }

    notify('success', 'Progress QR image downloaded');
  }

  function handleClearProgress(): void {
    const result = clearProgress();

    onImported(result.snapshot);
    clearDialogOpen = false;

    if (result.persisted) {
      notify('success', 'Local progress cleared');
    } else {
      notify('warning', 'Progress cleared for this tab only', {
        description: 'Browser storage is unavailable.',
      });
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden sm:max-w-lg"
  >
    <Dialog.Header class="shrink-0">
      <Dialog.Title>Manage Progress</Dialog.Title>
      <Dialog.Description>
        Your learning progress is stored locally on this device. Transfer it between devices using a
        QR image.
      </Dialog.Description>
    </Dialog.Header>

    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-1">
      {#if mode === 'overview'}
        <section
          class="space-y-3 rounded-lg border border-border p-4"
          aria-label="Current learning progress"
        >
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="text-muted-foreground">Completed</span>
            <span class="font-medium tabular-nums">{completedCount} / {questionIds.length}</span>
          </div>
          <Progress.Root value={completionPercentage} class="h-2" aria-label="Overall completion" />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>{inProgressCount} in progress</span>
            <span>{Math.round(completionPercentage)}% complete</span>
          </div>
        </section>

        <section class="space-y-2" aria-labelledby="transfer-progress-heading">
          <h3 id="transfer-progress-heading" class="text-sm font-medium">Transfer progress</h3>
          <div class="grid gap-2 sm:grid-cols-2">
            <Button.Root
              variant="outline"
              class="justify-start"
              onclick={() => selectMode('export')}
            >
              <Download class="size-4" /> Export QR image
            </Button.Root>
            <Button.Root
              variant="outline"
              class="justify-start"
              onclick={() => selectMode('import')}
            >
              <ImageUp class="size-4" /> Import QR image
            </Button.Root>
          </div>
        </section>

        <div class="border-t border-border pt-3">
          <Button.Root
            variant="ghost"
            class="text-destructive hover:text-destructive"
            onclick={() => (clearDialogOpen = true)}
          >
            <Trash2 class="size-4" /> Clear local progress
          </Button.Root>
        </div>
      {:else if mode === 'export'}
        <div class="space-y-4">
          <Button.Root variant="ghost" size="sm" onclick={() => (mode = 'overview')}>
            <ArrowLeft class="size-4" aria-hidden="true" />
            Back to progress
          </Button.Root>
          <div class="flex flex-col items-center gap-3 py-2">
            {#if qrUrl}
              <img
                src={qrUrl}
                alt="Frontend Atlas progress QR code"
                class="aspect-square w-48 max-w-full rounded-md bg-white p-2"
              />
              <a
                href={qrUrl}
                download="frontend-atlas-progress.png"
                onclick={exportDownloaded}
                class="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
              >
                <Download class="size-4" /> Save QR image
              </a>
            {:else if qrError}
              <p class="text-sm text-muted-foreground" role="status">QR image generation failed.</p>
            {:else}
              <div
                class="size-48 max-w-full animate-pulse rounded-md bg-muted"
                role="status"
                aria-label="Generating progress QR image"
              ></div>
            {/if}
            <p class="max-w-sm text-center text-xs text-muted-foreground">
              This image contains your learning states and saved reading positions. Transfer it to
              another device and import it there. Anyone with the image can read its progress data,
              so keep it somewhere safe.
            </p>
          </div>
        </div>
      {:else}
        <div class="space-y-3">
          <Button.Root variant="ghost" size="sm" onclick={() => (mode = 'overview')}>
            <ArrowLeft class="size-4" aria-hidden="true" />
            Back to progress
          </Button.Root>
          <p class="text-sm text-muted-foreground">
            Select a previously exported Frontend Atlas QR image. We'll validate it and show you
            what it contains before changing progress on this device.
          </p>
          <Button.Root
            variant="outline"
            class="w-full"
            disabled={busy}
            onclick={() => fileInput?.click()}
          >
            <ImageUp class="size-4" />
            {busy ? 'Reading image…' : 'Choose QR image'}
          </Button.Root>
          <input
            bind:this={fileInput}
            class="sr-only"
            type="file"
            accept="image/*"
            onchange={importQrImage}
            aria-label="Choose an image containing a Frontend Atlas progress QR code"
          />
          {#if pendingSnapshot}
            <div class="space-y-3 rounded-md border border-border p-3 text-sm">
              <p class="font-medium">QR code validated</p>
              <p class="text-muted-foreground">
                {pendingSnapshot.completed.length} completed · {Object.keys(
                  pendingSnapshot.readingProgress,
                ).length} saved reading positions.
              </p>
              <div class="space-y-3">
                <div>
                  <Button.Root size="sm" onclick={() => applyImportedProgress('merge')}
                    >Merge progress</Button.Root
                  >
                  <p class="mt-1 text-xs text-muted-foreground">
                    Combine this QR snapshot with progress already on this device. Completed states
                    are preserved, and the latest saved reading position wins.
                  </p>
                </div>
                <div>
                  <Button.Root
                    size="sm"
                    variant="outline"
                    onclick={() => applyImportedProgress('replace')}
                    >Replace local progress</Button.Root
                  >
                  <p class="mt-1 text-xs text-muted-foreground">
                    Replace all progress on this device with the contents of this QR image.
                  </p>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <Dialog.Footer class="shrink-0">
      <Button.Root variant="outline" onclick={() => (open = false)}>Close</Button.Root>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={clearDialogOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Clear all progress?</AlertDialog.Title>
      <AlertDialog.Description>
        This permanently deletes all learning states and saved reading positions stored on this
        device. This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={handleClearProgress}>Clear progress</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
