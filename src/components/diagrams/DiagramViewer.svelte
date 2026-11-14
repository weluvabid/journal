onMount(() => <script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Skeleton } from '@weluvabid/iris/components';
  import { ExternalLink, RotateCcw, ZoomIn, ZoomOut } from '@weluvabid/iris/lucide';
  import {
    createDiagramViewer,
    destroyDiagramViewer,
    fitDiagramViewer,
  } from '@lib/diagrams/viewer';
  import type { DiagramViewer as Viewer } from '@lib/diagrams/viewer';

  interface Props {
    src: string;
    alt: string;
    caption?: string;
  }

  let { src, alt, caption }: Props = $props();

  let objectElement: HTMLObjectElement;
  let panzoomElement: HTMLDivElement;
  let stageElement: HTMLDivElement;

  let viewer: Viewer | null = null;
  let initialization: Promise<void> | null = null;
  let abortController: AbortController | null = null;
  let loadTimeout: ReturnType<typeof setTimeout> | null = null;
  let fitFrame: number | null = null;

  let ready = $state(false);
  let failed = $state(false);
  let controlsFailed = $state(false);

  function initializeViewer(): Promise<void> {
    if (viewer || initialization || failed) {
      return initialization ?? Promise.resolve();
    }

    abortController = new AbortController();

    initialization = createDiagramViewer(
      panzoomElement,
      stageElement,
      abortController.signal,
    )
      .then((instance) => {
        if (!instance) return;

        viewer = instance;
        ready = true;
        failed = false;
        controlsFailed = false;

        scheduleDiagramFit();
      })
      .catch(() => {
        if (!abortController?.signal.aborted) {
          controlsFailed = true;
        }
      })
      .finally(() => {
        initialization = null;
      });

    return initialization;
  }

  function clearLoadTimeout(): void {
    if (loadTimeout === null) return;

    clearTimeout(loadTimeout);
    loadTimeout = null;
  }

  function handleObjectLoad(): void {
    clearLoadTimeout();

    if (!objectElement.contentDocument?.querySelector('svg')) {
      failed = true;
      return;
    }

    failed = false;
    void initializeViewer();
  }

  function handleLoadError(): void {
    clearLoadTimeout();
    failed = true;
  }

  function zoomIn(): void {
    viewer?.zoomIn();
  }

  function zoomOut(): void {
    viewer?.zoomOut();
  }

  function resetView(): void {
    viewer?.reset();
  }

  function scheduleDiagramFit(): void {
    if (fitFrame !== null) {
      cancelAnimationFrame(fitFrame);
    }

    fitFrame = requestAnimationFrame(() => {
      fitFrame = null;
      fitDiagramViewer(viewer);
    });
  }

  function preventNativeTouch(event: TouchEvent): void {
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  onMount(() => {
    objectElement.addEventListener('load', handleObjectLoad);
    objectElement.addEventListener('error', handleLoadError);

    // The SVG may load before component hydration.
    if (objectElement.contentDocument?.querySelector('svg')) {
      void initializeViewer();
    } else {
      loadTimeout = setTimeout(handleLoadError, 10_000);
    }

    let lastWidth = stageElement.getBoundingClientRect().width;
    let lastHeight = stageElement.getBoundingClientRect().height;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const { width, height } = entry.contentRect;

      if (
        Math.abs(width - lastWidth) > 1 ||
        Math.abs(height - lastHeight) > 1
      ) {
        lastWidth = width;
        lastHeight = height;
        scheduleDiagramFit();
      }
    });

    // Prevent Safari's native touch handling from taking over diagram gestures.
    stageElement.addEventListener('touchmove', preventNativeTouch, {
      passive: false,
    });

    resizeObserver.observe(stageElement);

    return () => {
      clearLoadTimeout();

      if (fitFrame !== null) {
        cancelAnimationFrame(fitFrame);
        fitFrame = null;
      }

      abortController?.abort();

      stageElement.removeEventListener('touchmove', preventNativeTouch);
      resizeObserver.disconnect();

      objectElement.removeEventListener('load', handleObjectLoad);
      objectElement.removeEventListener('error', handleLoadError);

      destroyDiagramViewer(viewer, stageElement);

      viewer = null;
    };
  });
</script>

<figure class="my-8 min-w-0">
  <div class="diagram-viewer overflow-hidden rounded-xl border border-border bg-muted/20">
    <div class="flex items-center justify-end gap-2 border-b border-border px-2 py-2 sm:px-3">
      {#if !ready && !failed && !controlsFailed}
        <Skeleton.Root
          class="h-9 w-[156px] rounded-md"
          role="status"
          aria-label="Loading diagram controls"
        />
      {:else}
        {#if controlsFailed}
          <span class="sr-only" role="alert">
            Diagram controls could not be initialized. The diagram remains available.
          </span>
        {/if}

        <div class="flex items-center gap-1" role="group" aria-label="Diagram controls">
          <Button.Root
            type="button"
            variant="ghost"
            size="icon"
            class="rounded-md"
            aria-label="Zoom out"
            title="Zoom out"
            disabled={!ready}
            onclick={zoomOut}
          >
            <ZoomOut class="size-4" aria-hidden="true" />
          </Button.Root>

          <Button.Root
            type="button"
            variant="ghost"
            size="icon"
            class="rounded-md"
            aria-label="Zoom in"
            title="Zoom in"
            disabled={!ready}
            onclick={zoomIn}
          >
            <ZoomIn class="size-4" aria-hidden="true" />
          </Button.Root>

          <Button.Root
            type="button"
            variant="ghost"
            size="icon"
            class="rounded-md"
            aria-label="Reset zoom and position"
            title="Reset"
            disabled={!ready}
            onclick={resetView}
          >
            <RotateCcw class="size-4" aria-hidden="true" />
          </Button.Root>

          <Button.Root
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="icon"
            class="rounded-md"
            aria-label="Open diagram in new tab"
            title="Open in new tab"
          >
            <ExternalLink class="size-4" aria-hidden="true" />
          </Button.Root>
        </div>
      {/if}
    </div>

    <div
      bind:this={stageElement}
      class="diagram-stage relative h-[min(68vh,42rem)] min-h-64 w-full overscroll-contain overflow-hidden bg-white"
      aria-busy={!ready && !failed && !controlsFailed}
    >
      <div bind:this={panzoomElement} class="size-full">
        <object
          bind:this={objectElement}
          data={src}
          type="image/svg+xml"
          aria-label={alt}
          class="pointer-events-none block size-full bg-white"
        >
          <a href={src} target="_blank" rel="noopener noreferrer">
            Open diagram: {alt}
          </a>
        </object>
      </div>

      {#if failed}
        <div
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background px-4 text-center text-sm text-muted-foreground"
          role="alert"
        >
          <p>The interactive diagram couldn't be loaded.</p>

          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-4"
          >
            Open the SVG directly
          </a>
        </div>
      {/if}
    </div>
  </div>

  {#if caption}
    <figcaption class="mt-2 text-center text-xs leading-5 text-muted-foreground">
      {caption}
    </figcaption>
  {/if}
</figure>);
