import type { PanzoomObject } from '@panzoom/panzoom';

export type DiagramViewer = PanzoomObject;

const diagramViewers = new WeakMap<HTMLElement, DiagramViewer>();

function handleDiagramDoubleClick(event: MouseEvent): void {
  const stage = event.currentTarget;

  if (!(stage instanceof HTMLElement)) {
    return;
  }

  const viewer = diagramViewers.get(stage);

  viewer?.zoomToPoint(viewer.getScale() * 1.2, event);
}

export async function createDiagramViewer(
  element: HTMLDivElement,
  stage: HTMLDivElement,
  signal: AbortSignal,
): Promise<DiagramViewer | null> {
  if (signal.aborted) {
    return null;
  }

  const object = element.querySelector('object');

  if (!object?.contentDocument?.querySelector('svg')) {
    throw new Error('The embedded document does not contain an SVG.');
  }

  const { default: createPanZoom } = await import('@panzoom/panzoom');

  if (signal.aborted) {
    return null;
  }

  const viewer = createPanZoom(element, {
    minScale: 0.5,
    maxScale: 12,
    step: 0.2,
    pinchAndPan: true,
  });

  stage.addEventListener('wheel', viewer.zoomWithWheel, { passive: false });
  stage.addEventListener('dblclick', handleDiagramDoubleClick);

  diagramViewers.set(stage, viewer);

  return viewer;
}

export function fitDiagramViewer(viewer: DiagramViewer | null): void {
  viewer?.reset({ animate: false });
}

export function destroyDiagramViewer(viewer: DiagramViewer | null, stage: HTMLDivElement): void {
  if (!viewer) {
    return;
  }

  stage.removeEventListener('wheel', viewer.zoomWithWheel);
  stage.removeEventListener('dblclick', handleDiagramDoubleClick);

  diagramViewers.delete(stage);
  viewer.destroy();
}
