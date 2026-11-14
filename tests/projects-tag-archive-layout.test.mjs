import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = () =>
  readFile(new URL('../src/pages/projects/tag/[...slug].astro', import.meta.url), 'utf8');

test('legacy project tag URLs redirect to the generated Projects archive', async () => {
  const source = await read();

  assert.match(source, /getCollection\([\s\S]*?'journal'/);
  assert.match(source, /data\.kind === 'project'/);
  assert.match(source, /Astro\.redirect\(withBase\('\/projects\/'\), 301\)/);
});
