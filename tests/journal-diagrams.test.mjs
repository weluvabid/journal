import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
const root = new URL('../', import.meta.url).pathname;
const diagrams = [
  ['copy-2-markdown-local-first-browser-extraction.mdx', 'copy-2-markdown-extraction.svg'],
  ['building-a-cache-from-first-principles.mdx', 'cachewise-single-flight.svg'],
  ['a-small-lsm-tree.mdx', 'tiny-lsm-storage-lifecycle.svg'],
  ['building-structaura.mdx', 'structaura-fingerprinting.svg'],
  ['frontend-atlas-progress-without-accounts.mdx', 'frontend-atlas-progress-transfer.svg'],
];

test('the five architecture diagrams use the shared pan-and-zoom viewer', async () => {
  for (const [article, diagram] of diagrams) {
    const content = await readFile(join(root, 'src/content/journal', article), 'utf8');

    assert.match(content, new RegExp(`<DiagramViewer[^>]*src="/diagrams/${diagram}"`));
    await access(join(root, 'public/diagrams', diagram));
  }

  const viewer = await readFile(join(root, 'src/components/diagrams/DiagramViewer.svelte'), 'utf8');
  const viewerModule = await readFile(join(root, 'src/lib/diagrams/viewer.ts'), 'utf8');
  const headers = await readFile(join(root, 'public/_headers'), 'utf8');

  assert.match(viewerModule, /@panzoom\/panzoom/);
  assert.match(viewerModule, /panOnlyWhenZoomed: true/);
  assert.match(viewerModule, /stage\.addEventListener\('wheel', viewer\.zoomWithWheel/);
  assert.match(viewerModule, /stage\.addEventListener\('dblclick', handleDiagramDoubleClick/);
  assert.match(viewerModule, /viewer\?\.zoomToPoint\(viewer\.getScale\(\) \* 1\.2, event\)/);
  assert.match(viewerModule, /stage\.removeEventListener\('wheel', viewer\.zoomWithWheel/);
  assert.match(viewerModule, /stage\.removeEventListener\('dblclick', handleDiagramDoubleClick/);
  assert.doesNotMatch(viewerModule, /svg-pan-zoom/);
  assert.doesNotMatch(viewer, /touch-action:none/);
  assert.match(
    viewer,
    /<Skeleton[\s\S]*?class="h-9 w-\[156px\] rounded-md"[\s\S]*?role="status"[\s\S]*?aria-label="Loading diagram controls"/,
  );
  assert.doesNotMatch(viewer, /Preparing diagram controls|animate-spin/);
  assert.match(viewer, /disabled={!ready}/);
  assert.doesNotMatch(viewer, /Loading diagram…/);
  assert.doesNotMatch(viewer, /absolute inset-x-4 top-1\/2/);
  assert.match(viewer, /setTimeout\(handleLoadError, 10_000\)/);
  assert.match(
    viewer,
    /<Button\.Root[\s\S]*?href=\{src\}[\s\S]*?target="_blank"[\s\S]*?rel="noopener noreferrer"[\s\S]*?aria-label="Open diagram in new tab"[\s\S]*?<ExternalLink/,
  );
  assert.doesNotMatch(
    viewer,
    /requestFullscreen|exitFullscreen|fullscreenchange|fullscreen-fallback|:fullscreen/,
  );
  assert.match(viewer, /new ResizeObserver\(scheduleDiagramFit\)/);
  assert.match(viewer, /bind:this=\{panzoomElement\}/);
  assert.match(viewer, /pointer-events-none block size-full/);
  assert.match(viewer, /destroyDiagramViewer\(viewer, stageElement\)/);
  assert.match(viewer, /function scheduleDiagramFit\(\)/);
  assert.match(viewer, /requestAnimationFrame\(/);
  assert.match(viewer, /fitDiagramViewer\(viewer\)/);
  assert.match(viewerModule, /viewer\.reset\(\{ animate: false \}\)/);
  assert.match(viewer, /function handleObjectLoad\(\)/);
  assert.match(headers, /Content-Security-Policy: frame-ancestors 'self'/);
  assert.doesNotMatch(headers, /X-Frame-Options: DENY/);
});
test('journal content contains no unfinished example notes', async () => {
  for (const name of await readdir(join(root, 'src/content/journal'))) {
    if (!name.endsWith('.mdx')) {
      continue;
    }

    const content = await readFile(join(root, 'src/content/journal', name), 'utf8');

    assert.doesNotMatch(content, /\*Example I'd add:\*/i, name);
  }
});
