import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('journal list delegates every interactive card to the shared entry card', async () => {
  const source = await read('../src/components/journal/JournalEntryList.svelte');
  assert.match(source, /import JournalEntryCard from '@components\/cards\/JournalEntryCard\.svelte'/);
  assert.match(source, /<li><JournalEntryCard \{entry\} \{index\} \/><\/li>/);
  assert.doesNotMatch(source, /<Card\.Root/);
});

test('shared content card owns the stretched native link', async () => {
  const source = await read('../src/components/cards/ContentCard.svelte');
  assert.match(source, /<article/);
  assert.match(source, /<a href=\{href\}/);
  assert.match(source, /absolute inset-0/);
  assert.match(source, /focus-visible:outline/);
});

test('tags remain independent links above the stretched card link', async () => {
  const card = await read('../src/components/cards/JournalEntryCard.svelte');
  const tags = await read('../src/components/cards/TagList.svelte');
  assert.match(card, /<ContentCard href=\{entry\.href\}/);
  assert.match(card, /pointer-events-auto/);
  assert.match(tags, /<a href=\{tagHref\(tag\)\}/);
  assert.doesNotMatch(tags, /data-card-navigation/);
  const contentCard = await read('../src/components/cards/ContentCard.svelte');
  assert.match(contentCard, /<a href=\{href\}[^>]*data-card-navigation/);
});

test('homepage and project archive use the shared card foundation', async () => {
  const home = await read('../src/pages/index.astro');
  const projects = await read('../src/pages/projects/index.astro');
  assert.match(home, /import ContentCard from '@components\/cards\/ContentCard\.svelte'/);
  assert.match(projects, /import ContentCard from '@components\/cards\/ContentCard\.svelte'/);
  assert.doesNotMatch(projects, /<a href=\{withBase\(`\/projects\//);
});

test('no-JavaScript journal fallbacks reuse the same journal entry card', async () => {
  for (const path of [
    '../src/pages/journal/index.astro',
    '../src/pages/journal/category/[...slug].astro',
    '../src/pages/journal/tag/[...slug].astro',
  ]) {
    const source = await read(path);
    assert.match(source, /import JournalEntryCard from '@components\/cards\/JournalEntryCard\.svelte'/);
    assert.match(source, /<JournalEntryCard/);
    assert.doesNotMatch(source, /<article class="rounded-2xl border border-border p-4">/);
  }
});

test('homepage card numbering continues across topics, writing, and projects', async () => {
  const home = await read('../src/pages/index.astro');
  assert.match(home, /String\(index \+ categories\.length \+ 1\)\.padStart\(2, '0'\)/);
  assert.match(home, /String\(categories\.length \+ featured\.length \+ index \+ 1\)\.padStart\(2, '0'\)/);
});
