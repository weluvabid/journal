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
  assert.match(card, /pointer-events-none relative w-full/);
  assert.match(card, /pointer-events-auto absolute inset-0/);
  assert.match(card, /\[pointer-events:inherit\]/);
});

test('journal tags remain independent links above the stretched card link', async () => {
  const card = await read('../src/components/cards/JournalEntryCard.svelte');
  const tags = await read('../src/components/cards/TagList.svelte');

  assert.match(card, /<ContentCard href=\{entry\.href\}/);
  assert.match(tags, /VISIBLE_TAG_LIMIT = 3/);
  assert.match(tags, /pointer-events-auto inline-flex shrink-0/);
  assert.match(tags, /<Root>[\s\S]*?<Trigger[\s\S]*?<Content/);
});

test('homepage and Projects archive render canonical project articles through shared cards', async () => {
  const home = await read('../src/pages/index.astro');
  const projects = await read('../src/pages/projects/index.astro');
  const card = await read('../src/components/cards/ProjectCard.svelte');

  assert.match(home, /data\.kind === 'project'/);
  assert.match(home, /href=\{entryHref\(project\.data\.id\)\}/);
  assert.match(projects, /data\.kind === 'project'/);
  assert.match(projects, /href=\{entryHref\(entry\.data\.id\)\}/);
  assert.match(card, /TagList tags=\{project\.tags} label=\{project\.name} scope="projects" \/>/);
  assert.match(card, /<ContentCard \{href\}/);
});

test('tag overflow uses the shared Iris Popover instead of a nested scrollport', async () => {
  const tags = await read('../src/components/cards/TagList.svelte');

  assert.match(tags, /@weluvabid\/iris\/components\/ui\/popover/);
  assert.match(tags, /max-w-\[calc\(100vw_-_2rem\)\]/);
  assert.doesNotMatch(tags, /scroll-area|orientation="horizontal"|scrollbarXClasses/);
  const projectCard = await read('../src/components/cards/ProjectCard.svelte');

  assert.match(projectCard, /flex h-full min-w-0 flex-col gap-3/);
});

test('canonical detail-page tags follow the entry content kind', async () => {
  const detail = await read('../src/pages/journal/[...slug].astro');

  assert.match(detail, /scope=\{entry\.data\.kind === 'project' \? 'projects' : 'journal'\}/);
});

test('project detail pages reuse ranked previous and next navigation', async () => {
  const detail = await read('../src/pages/journal/[...slug].astro');
  const navigation = await read('../src/components/article/ArticleNavigation.svelte');

  assert.match(detail, /rankProjects\(publishedEntries\.filter\(isProjectEntry\)\)/);
  assert.match(detail, /entry\.data\.kind === 'project' \? projectEntries : writingEntries/);
  assert.match(detail, /const initialNavigation = resolveJournalNavigation/);
  assert.match(detail, /<ArticleNavigation[\s\S]*?allEntries=\{allNavigationEntries/);
  assert.match(navigation, /attachArticleSwipeNavigation/);
  assert.match(navigation, /Navigate between entries/);
});
