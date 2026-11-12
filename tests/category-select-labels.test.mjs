import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('category select displays human-readable labels instead of internal IDs', async () => {
  const component = await read('src/components/journal/CategorySelect.svelte');
  assert.match(component, /const currentLabel = \$derived\(/);
  assert.match(component, /current === 'all'\s*\? 'All entries'/);
  assert.match(component, /categories\.find\(\(category\) => category\.id === current\)\?\.name/);
  assert.match(component, /<Select\.Value>\{currentLabel\}<\/Select\.Value>/);
  assert.doesNotMatch(component, /<Select\.Value\s*\/>/);
  assert.match(component, /<Select\.Item value="all">All entries<\/Select\.Item>/);
});
