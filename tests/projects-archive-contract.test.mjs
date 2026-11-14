import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = () => readFile(new URL('../src/pages/projects/index.astro', import.meta.url), 'utf8');

test('Projects archive is a generated view over canonical Journal project entries', async () => {
  const source = await read();

  assert.match(source, /getCollection\('journal'/);
  assert.match(source, /data\.kind === 'project'/);
  assert.match(source, /projectDetails\?\.order/);
  assert.match(source, /<ProjectCard/);
  assert.match(source, /entryHref\(entry\.data\.id\)/);
  assert.doesNotMatch(source, /getCollection\('projects'\)/);
});
