import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('project schema supports optional StackBlitz and Mermaid resources', async () => {
  const schema = await read('src/content.config.ts');

  assert.match(schema, /stackblitz:\s*z\.url\(\)\.optional\(\)/);
  assert.match(schema, /mermaid:\s*z\.url\(\)\.optional\(\)/);
});

test('project detail reuses the shared icon-only resource actions', async () => {
  const page = await read('src/pages/projects/[...slug].astro');

  assert.match(
    page,
    /import ResourceActions from '@components\/resources\/ResourceActions\.svelte'/,
  );
  assert.match(
    page,
    /<ResourceActions[\s\S]*?client:load[\s\S]*?git: entry\.data\.github,[\s\S]*?stackblitz: entry\.data\.stackblitz,[\s\S]*?mermaid: entry\.data\.mermaid,[\s\S]*?\/>/,
  );
  assert.doesNotMatch(page, /GitHub <ExternalLink/);
});

test('JSONPlus project exposes its real StackBlitz workspace', async () => {
  const project = await read('src/content/projects/jsonplus.md');

  assert.match(
    project,
    /stackblitz:\s*['"]https:\/\/stackblitz\.com\/edit\/jsonplus\?file=index\.js['"]/,
  );
});

test('Frontend Atlas project exposes the editable Mermaid diagram', async () => {
  const project = await read('src/content/projects/frontend-atlas.md');

  assert.match(project, /mermaid:\s*['"]https:\/\/mermaid\.live\/edit#pako:/);
});


test('project schema supports an explicit primary journal entry and additional related entries', async () => {
  const schema = await read('src/content.config.ts');
  const project = await read('src/content/projects/cachewise.md');
  const page = await read('src/pages/projects/[...slug].astro');

  assert.match(schema, /journal:\s*z\s*\.object\([\s\S]*?primary:\s*z\.string\(\)\.regex[\s\S]*?related:\s*z\.array\(z\.string\(\)\.regex/);
  assert.ok(project.includes('journal:\n  primary: benchmarking-without-lying-to-yourself'));
  assert.match(project, /related: \[building-a-cache-from-first-principles, cost-aware-eviction-policies\]/);
  assert.match(page, /journalHref=\{[\s\S]*?entryHref\(entry\.data\.journal\.primary\)[\s\S]*?undefined[\s\S]*?\}/);
  assert.match(page, /references\.primary, \.\.\.references\.related/);
});

test('project resource actions render the ghost link only when a primary journal URL exists', async () => {
  const component = await read('src/components/resources/ResourceActions.svelte');
  const page = await read('src/pages/projects/[...slug].astro');

  assert.match(component, /import GhostMark from '@components\/brand\/GhostMark\.svelte'/);
  assert.match(component, /\{#if journalHref\}/);
  assert.match(component, /href=\{journalHref\}/);
  assert.match(component, /aria-label="Read the related journal entry"/);
  assert.match(page, /entry\.data\.journal\?\.primary/);
});
