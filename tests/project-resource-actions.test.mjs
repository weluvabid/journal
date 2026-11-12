import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('project schema supports optional StackBlitz and Mermaid resources', async () => {
  const schema = await read('src/content.config.ts');
  assert.match(schema, /stackblitz:\s*z\.string\(\)\.url\(\)\.optional\(\)/);
  assert.match(schema, /mermaid:\s*z\.string\(\)\.url\(\)\.optional\(\)/);
});

test('project detail reuses the shared icon-only resource actions', async () => {
  const page = await read('src/pages/projects/[...slug].astro');
  assert.match(page, /import ResourceActions from '@components\/resources\/ResourceActions\.svelte'/);
  assert.match(page, /ResourceActions client:load links=\{\{ git: entry\.data\.github, stackblitz: entry\.data\.stackblitz, mermaid: entry\.data\.mermaid \}\}/);
  assert.doesNotMatch(page, /GitHub <ExternalLink/);
});

test('JSONPlus project exposes its real StackBlitz workspace', async () => {
  const project = await read('src/content/projects/jsonplus.md');
  assert.match(project, /stackblitz: "https:\/\/stackblitz\.com\/edit\/jsonplus\?file=index\.js"/);
});

test('Frontend Atlas project exposes the editable Mermaid diagram', async () => {
  const project = await read('src/content/projects/frontend-atlas.md');
  assert.match(project, /mermaid: "https:\/\/mermaid\.live\/edit#pako:/);
});
