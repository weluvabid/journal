<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '@weluvabid/iris/components';
  import { Maximize, RotateCcw, ZoomIn, ZoomOut } from '@weluvabid/iris/lucide';
  import { createDiagramViewer, fitDiagramViewer } from '@lib/diagrams/viewer';
  import type { DiagramViewer as Viewer } from '@lib/diagrams/viewer';

  interface Props {
    src: string;
    alt: string;
    caption?: string;
  }

  let { src, alt, caption }: Props = $props();

  let objectElement: HTMLObjectElement;
  let stageElement: HTMLDivElement;
  let viewer: Viewer | null = null;
  let initialization: Promise<void> | null = null;
  let abortController: AbortController | null = null;
  let ready = $state(false);
  let failed = $state(false);
  let controlsFailed = $state(false);

  function initializeViewer(): Promise<void> {
    if (viewer || initialization || !objectElement?.contentDocument) {
      return initialization ?? Promise.resolve();
    }

    abortController = new AbortController();
    initialization = createDiagramViewer(objectElement, abortController.signal)
      .then((instance) => {
        if (!instance) return;
        viewer = instance;
        ready = true;
        failed = false;
        controlsFailed = false;
      })
      .catch(() => {
        if (!abortController?.signal.aborted) controlsFailed = true;
      })
      .finally(() => {
        initialization = null;
      });

    return initialization;
  }

  function handleLoadError(): void {
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

  function fitView() {
    if (!viewer) return;
    fitDiagramViewer(viewer);
  }

  onMount(() => {
    objectElement.addEventListener('load', initializeViewer);
    objectElement.addEventListener('error', handleLoadError);

    // The SVG may finish loading before this component hydrates.
    initializeViewer();

    const resizeObserver = new ResizeObserver(() => viewer?.resize());
    resizeObserver.observe(stageElement);

    return () => {
      abortController?.abort();
      resizeObserver.disconnect();
      objectElement.removeEventListener('load', initializeViewer);
      objectElement.removeEventListener('error', handleLoadError);
      viewer?.destroy();
      viewer = null;
    };
  });
</script>

<figure class="my-8 min-w-0">
  <div class="overflow-hidden rounded-xl border border-border bg-muted/20">
    <div class="flex items-center justify-between gap-2 border-b border-border px-2 py-2 sm:px-3">
      {#if !ready && !failed && !controlsFailed}
        <span class="inline-flex size-9 items-center justify-center" role="status" aria-label="Preparing diagram controls">
          <span class="size-4 motion-safe:animate-spin rounded-full border-2 border-muted-foreground/25 border-t-muted-foreground" aria-hidden="true"></span>
        </span>
      {:else if controlsFailed}
        <span class="sr-only" role="alert">Diagram controls could not be initialized. The diagram remains available.</span>
      {:else}
        <span aria-hidden="true" class="size-9"></span>
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
          aria-label="Fit diagram to viewer"
          title="Fit to view"
          disabled={!ready}
          onclick={fitView}
        >
          <Maximize class="size-4" aria-hidden="true" />
        </Button.Root>
      </div>
    </div>

    <div
      bind:this={stageElement}
      class="relative h-[min(68vh,42rem)] min-h-64 w-full overflow-hidden bg-white [touch-action:none]"
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
          <a href={src} target="_blank" rel="noopener noreferrer" class="underline underline-offset-4">
            Open the SVG directly
          </a>
        </div>
      {/if}
    </div>
  </div>
  {#if caption}
    <figcaption class="mt-2 text-center text-xs leading-5 text-muted-foreground">{caption}</figcaption>
  {/if}
</figure>
