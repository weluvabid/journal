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
