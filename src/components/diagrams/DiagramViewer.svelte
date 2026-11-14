<script lang="ts">
  import { onMount } from 'svelte';
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
      })
      .catch(() => {
        if (!abortController?.signal.aborted) failed = true;
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
    <div class="flex items-center justify-end gap-1 border-b border-border px-2 py-2 sm:px-3" role="group" aria-label="Diagram controls">
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
        aria-label="Zoom out"
        title="Zoom out"
        disabled={!ready}
        onclick={zoomOut}
      >
        <ZoomOut class="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
        aria-label="Zoom in"
        title="Zoom in"
        disabled={!ready}
        onclick={zoomIn}
      >
        <ZoomIn class="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
        aria-label="Reset zoom and position"
        title="Reset"
        disabled={!ready}
        onclick={resetView}
      >
        <RotateCcw class="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
        aria-label="Fit diagram to viewer"
        title="Fit to view"
        disabled={!ready}
        onclick={fitView}
      >
        <Maximize class="size-4" aria-hidden="true" />
      </button>
    </div>

    <div
      bind:this={stageElement}
      class="relative h-[min(68vh,42rem)] min-h-64 w-full overflow-hidden bg-white [touch-action:none]"
      aria-busy={!ready && !failed}
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

      {#if !ready && !failed}
        <p
          class="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground"
          role="status"
        >
          Loading diagram…
        </p>
      {:else if failed}
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
