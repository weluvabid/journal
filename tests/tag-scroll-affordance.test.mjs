import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('card tags use Iris horizontal ScrollArea and remain compact, single-row chips', async () => {
  const source = await read('src/components/cards/TagList.svelte');

  assert.match(source, /@weluvabid\/iris\/components\/ui\/scroll-area/);
  assert.match(source, /<Root[\s\S]*?orientation="horizontal"/);
  assert.match(source, /relative h-9 w-full min-w-0 max-w-full/);
  assert.match(source, /scrollbarXClasses=/);
  assert.match(source, /flex w-max min-w-full flex-nowrap gap-2/);
  assert.match(source, /px-2\.5 py-1 text-xs/);
  assert.match(source, /focus-visible:outline-2 focus-visible:outline-offset-\[-2px\]/);
  assert.doesNotMatch(source, /overflow-x-auto|observeHorizontalScroll|ResizeObserver/);
  assert.doesNotMatch(source, /sm:flex-wrap|flex-wrap/);
});
