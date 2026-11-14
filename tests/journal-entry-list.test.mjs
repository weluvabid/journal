import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('journal pagination snapshots initial props without resetting appended entries', async () => {
  const component = await read('src/components/journal/JournalEntryList.svelte');

  assert.match(component, /import \{ onDestroy, untrack \} from 'svelte'/);
  assert.match(component, /const initialState = untrack\(\(\) => \(/);
  assert.match(component, /entries: \[\.\.\.initialEntries\]/);
  assert.match(component, /seenIds: new SvelteSet\(initialEntries\.map/);
  assert.match(component, /let entries = \$state<JournalListEntry\[]>\(initialState\.entries\)/);
  assert.match(component, /const seenIds = initialState\.seenIds/);
});

test('journal pagination delegates request and payload invariants to plain TypeScript', async () => {
  const component = await read('src/components/journal/JournalEntryList.svelte');
  const fetcher = await read('src/lib/journal-list/fetch-page.ts');
  const validation = await read('src/lib/journal-list/pagination-validation.ts');

  assert.match(component, /fetchJournalPage\(/);
  assert.doesNotMatch(component, /function isPageResponse|new URL\(nextPageUrl/);
  assert.match(fetcher, /signal/);
  assert.match(fetcher, /isJournalPageResponse/);
  assert.match(validation, /duplicate entry id/);
  assert.match(validation, /cross-origin/);
  assert.match(validation, /empty page with more pages remaining/);
});

test('journal pagination aborts an active request when its component is destroyed', async () => {
  const component = await read('src/components/journal/JournalEntryList.svelte');

  assert.match(component, /let activeRequest: AbortController \| undefined/);
  assert.match(component, /activeRequest\?\.abort\(\)/);
  assert.match(component, /signal: controller\.signal/);
  assert.match(component, /window\.clearTimeout\(timeoutId\)/);
});
