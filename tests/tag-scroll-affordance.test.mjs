import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('card tags remain compact, single-row scrollable chips', async () => {
  const source = await read('src/components/cards/TagList.svelte');

  assert.match(source, /flex w-max flex-nowrap gap-2/);
  assert.doesNotMatch(source, /touch-pan-x/);
  assert.match(source, /overflow-x-auto/);
  assert.match(source, /px-2\.5 py-1 text-xs/);
  assert.doesNotMatch(source, /sm:flex-wrap|flex-wrap/);
});

test('card tag shadows independently indicate content before and after the viewport', async () => {
  const source = await read('src/components/cards/TagList.svelte');

  assert.match(source, /observeHorizontalScroll/);
  assert.match(source, /getHorizontalScrollState/);
  assert.match(source, /shadow-\[inset_12px_0/);
  assert.match(source, /shadow-\[inset_-12px_0/);
  assert.match(source, /observeHorizontalScroll/);
  assert.match(source, /motion-safe:transition-opacity/);
  assert.match(source, /0\.18/);
  assert.doesNotMatch(source, /0\.32/);
});
