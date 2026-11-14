<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Skeleton } from '@weluvabid/iris/components';
  import { Maximize, Minimize, RotateCcw, ZoomIn, ZoomOut } from '@weluvabid/iris/lucide';
  import { createDiagramViewer, fitDiagramViewer } from '@lib/diagrams/viewer';
  import type { DiagramViewer as Viewer } from '@lib/diagrams/viewer';

  interface Props {
    src: string;
    alt: string;
    caption?: string;
  }

  let { src, alt, caption }: Props = $props();

  let objectElement: HTMLObjectElement;
  let viewerElement: HTMLDivElement;
  let stageElement: HTMLDivElement;
  let viewer: Viewer | null = null;
  let initialization: Promise<void> | null = null;
  let abortController: AbortController | null = null;
  let loadTimeout: ReturnType<typeof setTimeout> | null = null;
  let fitFrame: number | null = null;
  let ready = $state(false);
  let failed = $state(false);
  let controlsFailed = $state(false);
  let isFullscreen = $state(false);
  let fullscreenFailed = $state(false);

  function initializeViewer(): Promise<void> {
    if (viewer || initialization || failed) {
      return initialization ?? Promise.resolve();
    }

    abortController = new AbortController();
    initialization = createDiagramViewer(objectElement, abortController.signal)
      .then((instance) => {
        if (!instance) {
          return;
        }

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
    if (loadTimeout !== null) {
      clearTimeout(loadTimeout);

      loadTimeout = null;
    }
  }

  function handleObjectLoad(): void {
    clearLoadTimeout();

    // A load event does not guarantee that the embedded document is usable.
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

  function zoomIn() {
    viewer?.zoomIn();
  }

  function zoomOut() {
    viewer?.zoomOut();
  }

  function resetView() {
    viewer?.reset();
  }

  async function toggleFullscreen(): Promise<void> {
    fullscreenFailed = false;

    try {
      if (document.fullscreenElement === viewerElement) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await viewerElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
        await viewerElement.requestFullscreen();
      }
    } catch {
      fullscreenFailed = true;
    }
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

  function handleFullscreenChange(): void {
    isFullscreen = document.fullscreenElement === viewerElement;

    scheduleDiagramFit();
  }

  onMount(() => {
    objectElement.addEventListener('load', handleObjectLoad);
    objectElement.addEventListener('error', handleLoadError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // The SVG may finish loading before this component hydrates. If it has not
    // loaded yet, bound the wait so blocked resources cannot leave a spinner
    // visible forever when the browser omits an error event.
    if (objectElement.contentDocument?.querySelector('svg')) {
      void initializeViewer();
    } else {
      loadTimeout = setTimeout(handleLoadError, 10_000);
    }

    const resizeObserver = new ResizeObserver(scheduleDiagramFit);

    resizeObserver.observe(stageElement);

    return () => {
      clearLoadTimeout();

      if (fitFrame !== null) {
        cancelAnimationFrame(fitFrame);

        fitFrame = null;
      }

      abortController?.abort();
      resizeObserver.disconnect();
      objectElement.removeEventListener('load', handleObjectLoad);
      objectElement.removeEventListener('error', handleLoadError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      viewer?.destroy();

      viewer = null;
    };
  });
</script>

<figure class="my-8 min-w-0">
  <div
    bind:this={viewerElement}
    class="diagram-viewer overflow-hidden rounded-xl border border-border bg-muted/20"
  >
    <div class="flex items-center justify-end gap-2 border-b border-border px-2 py-2 sm:px-3">
      {#if !ready && !failed && !controlsFailed}
        <Skeleton.Root
          class="h-9 w-[156px] rounded-md"
          role="status"
          aria-label="Loading diagram controls"
        />
      {:else}
        {#if controlsFailed}
          <span class="sr-only" role="alert"
            >Diagram controls could not be initialized. The diagram remains available.</span
          >
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
            type="button"
            variant="ghost"
            size="icon"
            class="rounded-md"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View diagram fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            disabled={failed}
            onclick={toggleFullscreen}
          >
            {#if isFullscreen}
              <Minimize class="size-4" aria-hidden="true" />
            {:else}
              <Maximize class="size-4" aria-hidden="true" />
            {/if}
          </Button.Root>
        </div>
      {/if}
      {#if fullscreenFailed}
        <span class="sr-only" role="alert"
          >Fullscreen mode is unavailable in this browser context.</span
        >
      {/if}
    </div>

    <div
      bind:this={stageElement}
      class="diagram-stage relative h-[min(68vh,42rem)] min-h-64 w-full overflow-hidden bg-white [touch-action:none]"
      aria-busy={!ready && !failed && !controlsFailed}
    >
      <object
        bind:this={objectElement}
        data={src}
        type="image/svg+xml"
        aria-label={alt}
        class="block size-full bg-white"
      >
        <a href={src} target="_blank" rel="noopener noreferrer">Open diagram: {alt}</a>
      </object>

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
</figure>

<style>
  .diagram-viewer:fullscreen {
    display: flex;
    width: 100vw;
    height: 100vh;
    max-height: none;
    flex-direction: column;
    border: 0;
    border-radius: 0;
    background: var(--background);
  }

  .diagram-viewer:fullscreen .diagram-stage {
    min-height: 0;
    height: auto;
    flex: 1;
  }
</style>
