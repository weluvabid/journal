import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url).pathname;
const diagrams = [
  ['a-small-lsm-tree.mdx', 'tiny-lsm-storage-lifecycle.svg'],
  ['building-a-cache-from-first-principles.mdx', 'cachewise-single-flight.svg'],
  ['building-structaura.mdx', 'structaura-fingerprinting.svg'],
  ['copy-2-markdown-local-first-browser-extraction.mdx', 'copy-2-markdown-extraction.svg'],
  ['frontend-atlas-progress-without-accounts.mdx', 'frontend-atlas-progress-transfer.svg'],
];

test('the five architecture diagrams are declared as article metadata and exist', async () => {
  for (const [article, diagram] of diagrams) {
    const content = await readFile(join(root, 'src/content/journal', article), 'utf8');

    assert.ok(content.includes(`diagram: /diagrams/${diagram}`), `${article} declares ${diagram}`);
    await access(join(root, 'public/diagrams', diagram));

    const svg = await readFile(join(root, 'public/diagrams', diagram), 'utf8');

    assert.ok(svg.startsWith('<svg '), `${diagram} starts with an SVG root`);
    assert.match(svg, /<title[\s>]/);
    assert.match(svg, /fill="#121212"/);
    assert.match(svg, /viewBox="0 0 [\d.]+ [\d.]+"/);
    assert.ok(svg.trimEnd().endsWith('</svg>'), `${diagram} closes its SVG root`);
  }
});

test('diagram resource action is conditional and uses the shared tooltip pattern', async () => {
  const actions = await readFile(
    join(root, 'src/components/resources/ResourceActions.svelte'),
    'utf8',
  );
  const page = await readFile(join(root, 'src/pages/journal/[...slug].astro'), 'utf8');

  assert.match(actions, /Workflow.*@weluvabid\/iris\/lucide/);
  assert.match(actions, /diagram\?: string/);
  assert.match(actions, /href=\{diagram\}/);
  assert.match(actions, /<Tooltip\.Content>View architecture diagram<\/Tooltip\.Content>/);
  assert.match(actions, /aria-label="View architecture diagram \(opens in a new tab\)"/);
  assert.match(page, /entry\.data\.diagram/);
  assert.match(page, /diagram=\{entry\.data\.diagram\}/);
});

test('interactive diagram viewer and Panzoom are fully removed', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const lock = await readFile(join(root, 'pnpm-lock.yaml'), 'utf8');

  assert.equal(pkg.dependencies['@panzoom/panzoom'], undefined);
  assert.doesNotMatch(lock, /@panzoom\/panzoom/);
  await assert.rejects(access(join(root, 'src/components/diagrams/DiagramViewer.svelte')));
  await assert.rejects(access(join(root, 'src/lib/diagrams/viewer.ts')));
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
