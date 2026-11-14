<script lang="ts">
  import { onMount } from 'svelte';
  import { Maximize, RotateCcw, ZoomIn, ZoomOut } from '@weluvabid/iris/lucide';
  import type svgPanZoom from 'svg-pan-zoom';

  interface Props {
    src: string;
    alt: string;
    caption?: string;
  }

  let { src, alt, caption }: Props = $props();

  let objectElement: HTMLObjectElement;
  let stageElement: HTMLDivElement;
  let viewer: ReturnType<typeof svgPanZoom> | null = null;
  let initializing = false;
  let disposed = false;
  let ready = $state(false);
  let failed = $state(false);

  function handleLoadError() {
    failed = true;
  }

  async function initializeViewer() {
    if (viewer || initializing || !objectElement?.contentDocument) return;
    if (!objectElement.contentDocument.querySelector('svg')) {
      failed = true;
      return;
    }

    initializing = true;
    try {
      const { default: createPanZoom } = await import('svg-pan-zoom');
      if (disposed) return;

      viewer = createPanZoom(objectElement, {
        panEnabled: true,
        zoomEnabled: true,
        controlIconsEnabled: false,
        dblClickZoomEnabled: true,
        mouseWheelZoomEnabled: true,
        preventMouseEventsDefault: true,
        zoomScaleSensitivity: 0.2,
        minZoom: 0.5,
        maxZoom: 12,
        fit: true,
        contain: true,
        center: true,
      });
      ready = true;
      failed = false;
    } catch {
      if (!disposed) failed = true;
    } finally {
      initializing = false;
    }
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
    viewer.resize();
    viewer.fit();
    viewer.center();
  }

  onMount(() => {
    disposed = false;
    objectElement.addEventListener('load', initializeViewer);
    objectElement.addEventListener('error', handleLoadError);

    // The SVG may finish loading before this component hydrates.
    initializeViewer();

    const resizeObserver = new ResizeObserver(() => viewer?.resize());
    resizeObserver.observe(stageElement);

    return () => {
      disposed = true;
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
