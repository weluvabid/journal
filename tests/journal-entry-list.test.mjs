import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('journal pagination intentionally snapshots initial props without Svelte capture warnings', async () => {
  const component = await read('src/components/journal/JournalEntryList.svelte');

  assert.match(component, /import \{ onDestroy, untrack \} from 'svelte'/);
  assert.match(component, /const initialState = untrack\(\(\) => \(/);
  assert.match(component, /entries: \[\.\.\.initialEntries\]/);
  assert.match(component, /nextPageUrl: initialNextPageUrl/);
  assert.match(component, /seenIds: new Set\(initialEntries\.map/);
  assert.match(component, /let entries = \$state<JournalEntry\[]>\(initialState\.entries\)/);
  assert.match(component, /let nextPageUrl = \$state<string \| null>\(initialState\.nextPageUrl\)/);
  assert.match(component, /const seenIds = initialState\.seenIds/);
});
