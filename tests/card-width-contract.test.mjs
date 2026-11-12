import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('shared card root can shrink inside a CSS Grid track', async () => {
  const source = await read('../src/components/cards/ContentCard.svelte');

  assert.match(source, /<article[\s\S]*?w-full min-w-0 max-w-full/);
  assert.match(source, /relative z-10 min-w-0 max-w-full/);
});

test('all card and detail-page tag wrappers use the available content width', async () => {
  const projectCard = await read('../src/components/cards/ProjectCard.svelte');
  const journalCard = await read('../src/components/cards/JournalEntryCard.svelte');
  const journalDetail = await read('../src/pages/journal/[...slug].astro');
  const projectDetail = await read('../src/pages/projects/[...slug].astro');
  const tagList = await read('../src/components/cards/TagList.svelte');

  assert.match(projectCard, /pointer-events-auto mt-auto block w-full min-w-0 max-w-full/);
  assert.match(journalCard, /pointer-events-auto block w-full min-w-0 max-w-full/);
  assert.match(journalDetail, /block w-full min-w-0 max-w-full/);
  assert.match(projectDetail, /block w-full min-w-0 max-w-full/);
  assert.match(tagList, /relative mt-3 min-w-0 max-w-full/);
  assert.match(tagList, /block w-full min-w-0 max-w-full[\s\S]*?overflow-x-auto/);
  assert.doesNotMatch(tagList, /sm:flex-wrap|sm:overflow-visible/);
});
