import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('tag list shows three archive links and exposes remaining tags through Iris Popover', async () => {
  const source = await read('src/components/cards/TagList.svelte');

  assert.match(source, /@weluvabid\/iris\/components\/ui\/popover/);
  assert.match(source, /VISIBLE_TAG_LIMIT = 3/);
  assert.match(source, /tags\.slice\(0, VISIBLE_TAG_LIMIT\)/);
  assert.match(source, /tags\.slice\(VISIBLE_TAG_LIMIT\)/);
  assert.match(source, /<Root>/);
  assert.match(source, /<Trigger[\s\S]*?type="button"/);
  assert.match(source, /\+\{overflowTags\.length\}/);
  assert.match(source, /<Content[\s\S]*?align="start"/);
  assert.match(source, /w-\[min\(24rem,calc\(100vw_-_2rem\)\)\]/);
  assert.match(source, /flex w-full min-w-0 flex-wrap gap-2/);
  assert.match(source, /tagHref\(tag, scope\)/);
  assert.match(source, /More topics/);
  assert.match(source, /focus-visible:outline-2 focus-visible:outline-offset-\[-2px\]/);
  assert.doesNotMatch(source, /scroll-area|orientation="horizontal"|scrollbarXClasses|overflow-x-auto/);
});

test('card and detail pages share the same tag presentation', async () => {
  const projectCard = await read('src/components/cards/ProjectCard.svelte');
  const journalCard = await read('src/components/cards/JournalEntryCard.svelte');
  const journalDetail = await read('src/pages/journal/[...slug].astro');

  assert.match(projectCard, /import TagList from '\.\/TagList\.svelte'/);
  assert.match(journalCard, /import TagList from '\.\/TagList\.svelte'/);
  assert.match(journalDetail, /import TagList from '@components\/cards\/TagList\.svelte'/);
  assert.match(journalDetail, /<TagList[\s\S]*?scope=\{entry\.data\.kind === 'project' \? 'projects' : 'journal'\}/);
});
