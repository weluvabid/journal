import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('category landing pages keep the category description out of visible content', async () => {
  const page = await read('src/pages/journal/category/[...slug].astro');

  assert.match(page, /<BaseLayout[^>]*description=\{category\.description\}/s);
  assert.doesNotMatch(page, /<p[^>]*>\s*\{category\.description\}\s*<\/p>/);
});

test('homepage category cards show the category name and count without redundant explanations', async () => {
  const page = await read('src/pages/index.astro');

  assert.match(page, /<Card\.Title>\{category\.name\}<\/Card\.Title>/);
  assert.match(page, /\{count\} \{count === 1 \? ' entry' : ' entries'\}/);
  assert.doesNotMatch(page, /<Card\.Description>\{category\.description\}<\/Card\.Description>/);
});
