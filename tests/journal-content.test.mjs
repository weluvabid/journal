import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access } from 'node:fs/promises';

const journalRoot = new URL('../src/content/journal/', import.meta.url);
const projectsRoot = new URL('../src/content/projects/', import.meta.url);

test('Journal ships exactly twenty MDX seed entries', async () => {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));
  assert.equal(files.length, 20);
  for (const file of files) {
    const id = file.slice(0, -4);
    assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
  }
});

test('initial portfolio contains the selected eight projects and excludes FulfillmentGuard', async () => {
  const files = (await readdir(projectsRoot)).filter((file) => file.endsWith('.md'));
  assert.equal(files.length, 8);
  assert.equal(files.some((file) => file.toLowerCase().includes('fulfillment')), false);
});

test('progress tracking runtime has been removed', async () => {
  await assert.rejects(access(new URL('../src/lib/progress/', import.meta.url)));
  await assert.rejects(access(new URL('../src/components/progress/', import.meta.url)));
  await assert.rejects(access(new URL('../src/data/question-manifest.ts', import.meta.url)));
});
