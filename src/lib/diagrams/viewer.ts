import type svgPanZoom from 'svg-pan-zoom';

export type DiagramViewer = ReturnType<typeof svgPanZoom>;

export async function createDiagramViewer(
  element: HTMLObjectElement,
  signal: AbortSignal,
): Promise<DiagramViewer | null> {
  if (signal.aborted) {
    return null;
  }

  const document = element.contentDocument;

  if (!document?.querySelector('svg')) {
    throw new Error('The embedded document does not contain an SVG.');
  }

  const { default: createPanZoom } = await import('svg-pan-zoom');

  if (signal.aborted) {
    return null;
  }

  return createPanZoom(element, {
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
}

export function fitDiagramViewer(viewer: DiagramViewer | null): void {
  if (!viewer) {
    return;
  }

  viewer.resize();
  viewer.fit();
  viewer.center();
}
