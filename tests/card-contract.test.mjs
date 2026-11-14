import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('journal lists use the shared entry card and content card owns the stretched link', async () => {
  const list = await read('../src/components/journal/JournalEntryList.svelte');
  const card = await read('../src/components/cards/ContentCard.svelte');
  assert.match(list, /JournalEntryCard/);
  assert.match(card, /absolute inset-0/);
  assert.match(card, /focus-visible:outline/);
});

test('journal tags remain independent links above the stretched card link', async () => {
  const card = await read('../src/components/cards/JournalEntryCard.svelte');
  const tags = await read('../src/components/cards/TagList.svelte');
  assert.match(card, /<ContentCard href=\{entry\.href\}/);
  assert.match(tags, /tagHref\(tag\)/);
  assert.match(tags, /pointer-events-auto block w-fit min-w-0 max-w-full/);
});

test('homepage and Projects archive render canonical project articles through shared cards', async () => {
  const home = await read('../src/pages/index.astro');
  const projects = await read('../src/pages/projects/index.astro');
  const card = await read('../src/components/cards/ProjectCard.svelte');
  assert.match(home, /data\.kind === 'project'/);
  assert.match(home, /href=\{entryHref\(project\.data\.id\)\}/);
  assert.match(projects, /data\.kind === 'project'/);
  assert.match(projects, /href=\{entryHref\(entry\.data\.id\)\}/);
  assert.match(card, /TagList tags=\{project\.tags} label=\{project\.title} \/>/);
  assert.match(card, /<ContentCard \{href\}/);
});

test('tag scrollports stay width constrained and horizontally scrollable', async () => {
  const tags = await read('../src/components/cards/TagList.svelte');
  assert.match(tags, /min-w-0 max-w-full/);
  assert.match(tags, /overflow-x-auto/);
  assert.match(tags, /flex w-max flex-nowrap gap-2/);
});
