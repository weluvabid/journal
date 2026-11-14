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
  assert.match(viewerModule, /svg-pan-zoom/);
  assert.match(viewer, /role="status" aria-label="Preparing diagram controls"/);
  assert.match(viewer, /disabled={!ready}/);
  assert.doesNotMatch(viewer, /Loading diagram…/);
  assert.doesNotMatch(viewer, /absolute inset-x-4 top-1\/2/);
});
test('journal content contains no unfinished example notes', async () => {
  for (const name of await readdir(join(root, 'src/content/journal'))) {
    if (!name.endsWith('.mdx')) continue;
    const content = await readFile(join(root, 'src/content/journal', name), 'utf8');
    assert.doesNotMatch(content, /\*Example I'd add:\*/i, name);
  }
});
