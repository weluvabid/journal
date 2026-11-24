import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('category native scrollport remains independent of the tag popover', async () => {
  const categorySelect = await read('src/components/journal/CategorySelect.svelte');
  const tagList = await read('src/components/cards/TagList.svelte');

  const categoryScrollport = categorySelect.match(
    /bind:this=\{viewport\}[\s\S]{0,200}?class="([^"]+)"/,
  );

  assert.ok(categoryScrollport, 'expected the category horizontal scrollport');
  assert.match(categoryScrollport[1], /overflow-x-auto/);
  assert.doesNotMatch(categoryScrollport[1], /focus-visible:outline/);

  assert.match(tagList, /@weluvabid\/iris\/components\/ui\/popover/);
  assert.match(tagList, /<Trigger[\s\S]*?type="button"/);
});

test('category and tag links retain visible keyboard focus outlines', async () => {
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
