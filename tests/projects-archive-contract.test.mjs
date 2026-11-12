import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(
  new URL('../src/pages/projects/index.astro', import.meta.url),
  'utf8',
);

test('Projects archive uses the same compact, non-linked breadcrumb presentation as Journal', () => {
  assert.match(
    source,
    /import\s+\{\s*Breadcrumb\s*\}\s+from\s+['"]@weluvabid\/iris\/components['"]/,
  );
  assert.match(source, /<Breadcrumb\.Root class="mb-8"/);
  assert.match(source, /<Breadcrumb\.Page>Projects<\/Breadcrumb\.Page>/);
  assert.doesNotMatch(source, /<Breadcrumb\.Link[^>]*>Projects<\/Breadcrumb\.Link>/);
  assert.match(source, /<h1 class="sr-only">Projects<\/h1>/);
});

test('Projects archive shows a pluralized count using the Journal count typography', () => {
  assert.match(source, /\{projects\.length\}/);
  assert.match(source, /projects\.length === 1 \? 'project' : 'projects'/);
  assert.match(
    source,
    /class="mb-8 text-xs font-semibold uppercase tracking-\[0\.18em\] text-muted-foreground"/,
  );
});

test('Projects archive keeps the curated order and responsive two-column card grid without filters', () => {
  assert.match(source, /\.sort\(\(a, b\) => a\.data\.order - b\.data\.order\)/);
  assert.match(source, /class="grid items-stretch gap-3 sm:grid-cols-2"/);
  assert.match(source, /<ProjectCard/);
  assert.doesNotMatch(source, /CategorySelect|filter|pagination|load more/iu);
  assert.doesNotMatch(source, /Selected work|A collection of things I've built/);
});
