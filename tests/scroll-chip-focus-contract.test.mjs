import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('horizontal scrollports do not draw focus outlines that can be clipped by overflow', async () => {
  const categorySelect = await read('src/components/journal/CategorySelect.svelte');
  const tagList = await read('src/components/cards/TagList.svelte');

  for (const source of [categorySelect, tagList]) {
    const scrollport = source.match(/bind:this=\{viewport\}[\s\S]{0,200}?class="([^"]+)"/);

    assert.ok(scrollport, 'expected a horizontal scrollport');
    assert.match(scrollport[1], /overflow-x-auto/);
    assert.doesNotMatch(scrollport[1], /focus-visible:outline/);
  }
});

test('category and tag links keep their keyboard focus outlines inside their scrollports', async () => {
  const categorySelect = await read('src/components/journal/CategorySelect.svelte');
  const tagList = await read('src/components/cards/TagList.svelte');

  assert.match(
    categorySelect,
    /focus-visible:outline-2 focus-visible:outline-offset-\[-2px\] focus-visible:outline-ring/,
  );
  assert.match(
    tagList,
    /focus-visible:outline-2 focus-visible:outline-offset-\[-2px\] focus-visible:outline-ring/,
  );
});
