import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('journal list delegates every interactive card to the shared entry card', async () => {
  const source = await read('../src/components/journal/JournalEntryList.svelte');

  assert.match(
    source,
    /import JournalEntryCard from '@components\/cards\/JournalEntryCard\.svelte'/,
  );
  assert.match(source, /<li><JournalEntryCard \{entry\} \{index\} \/><\/li>/);
  assert.doesNotMatch(source, /<Card\.Root/);
});

test('shared content card owns the stretched native link', async () => {
  const source = await read('../src/components/cards/ContentCard.svelte');

  assert.match(source, /<article/);
  assert.match(source, /<a\s+(?:href=\{href\}|\{href\})/);
  assert.match(source, /absolute inset-0/);
  assert.match(source, /focus-visible:outline/);
});

test('tags remain independent links above the stretched card link', async () => {
  const card = await read('../src/components/cards/JournalEntryCard.svelte');
  const tags = await read('../src/components/cards/TagList.svelte');

  assert.match(card, /<ContentCard href=\{entry\.href\}/);
  assert.match(card, /pointer-events-auto block w-full min-w-0 max-w-full/);
  assert.match(tags, /<a\s+href=\{tagHref\(tag, collection\)\}/);
  assert.doesNotMatch(tags, /data-card-navigation/);
  const contentCard = await read('../src/components/cards/ContentCard.svelte');

  assert.match(contentCard, /<a\s+(?:href=\{href\}|\{href\})[\s\S]*?data-card-navigation/);
});

test('homepage and project archive use the shared card foundation', async () => {
  const home = await read('../src/pages/index.astro');
  const projects = await read('../src/pages/projects/index.astro');

  assert.match(home, /import ProjectCard from '@components\/cards\/ProjectCard\.svelte'/);
  assert.match(home, /import JournalEntryCard from '@components\/cards\/JournalEntryCard\.svelte'/);
  assert.match(projects, /import ProjectCard from '@components\/cards\/ProjectCard\.svelte'/);
  assert.match(projects, /<ProjectCard\s+project=\{project\.data\}/);
  assert.doesNotMatch(projects, /<a href=\{withBase\(`\/projects\//);
});

test('no-JavaScript journal fallbacks reuse the same journal entry card', async () => {
  for (const path of [
    '../src/pages/journal/index.astro',
    '../src/pages/journal/category/[...slug].astro',
    '../src/pages/journal/tag/[...slug].astro',
  ]) {
    const source = await read(path);

    assert.match(
      source,
      /import JournalEntryCard from '@components\/cards\/JournalEntryCard\.svelte'/,
    );
    assert.match(source, /<JournalEntryCard/);
    assert.doesNotMatch(source, /<article class="rounded-2xl border border-border p-4">/);
  }
});

test('homepage card numbering runs from the four projects into the five journal entries', async () => {
  const home = await read('../src/pages/index.astro');

  assert.match(home, /number=\{index \+ 1\}/);
  assert.match(home, /index=\{index \+ selectedProjects\.length\}/);
});

test('homepage keyboard navigation treats projects and writing as one collection in display order', async () => {
  const home = await read('../src/pages/index.astro');

  assert.equal((home.match(/data-keyboard-navigation="primary"/g) ?? []).length, 1);
  assert.match(
    home,
    /<div data-keyboard-navigation="primary">[\s\S]*aria-labelledby="projects-heading"[\s\S]*aria-labelledby="featured-heading"[\s\S]*<\/div>\s*<\/BaseLayout>/,
  );
  assert.match(home, /<JournalEntryCard[\s\S]*entry=\{\{/);
  assert.match(home, /href=\{withBase\(`\/projects\/\$\{project\.data\.id\}\/`\)\}/);
});

test('homepage journal and project cards expose independent tag links', async () => {
  const home = await read('../src/pages/index.astro');
  const projects = await read('../src/pages/projects/index.astro');
  const projectDetail = await read('../src/pages/projects/[...slug].astro');
  const projectTagArchive = await read('../src/pages/projects/tag/[...slug].astro');
  const projectCard = await read('../src/components/cards/ProjectCard.svelte');

  assert.match(home, /<JournalEntryCard[\s\S]*index=\{index \+ selectedProjects\.length\}/);
  assert.match(home, /<ProjectCard\s+project=\{project\.data}/);
  assert.match(
    projectCard,
    /<TagList tags=\{project\.tags} label=\{project\.title} collection="projects" \/>/,
  );
  assert.match(projectCard, /pointer-events-auto mt-auto block w-full min-w-0 max-w-full/);
  assert.match(projects, /<ProjectCard\s+project=\{project\.data\}/);
  assert.match(projectDetail, /collection="projects"/);
  assert.match(projectTagArchive, /groupProjectsByTag\(projects\)/);
  assert.match(projectTagArchive, /<ProjectCard\s+project=\{project\.data\}/);
  assert.match(projectTagArchive, /Projects filed under/);
});

test('every project declares a non-empty semantic tag set', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const directory = new URL('../src/content/projects/', import.meta.url);
  const files = (await readdir(directory)).filter((file) => file.endsWith('.md'));

  assert.ok(files.length > 0);

  for (const file of files) {
    const source = await readFile(new URL(file, directory), 'utf8');

    assert.match(source, /^tags:\s*\[[^\]]+\]/mu, `${file} must declare project tags`);
  }
});

test('project tags have one schema default and consumers use the normalized collection value', async () => {
  const schema = await read('../src/content.config.ts');
  const tagList = await read('../src/components/cards/TagList.svelte');
  const searchIndex = await read('../src/pages/search-index.v2.json.ts');
  const tagUtilities = await read('../src/lib/journal-tags.ts');

  assert.match(
    schema,
    /const projects = defineCollection\([\s\S]*?tags: z\.array\(z\.string\(\)\.min\(2\)\)\.max\(12\)\.default\(\[\]\)/,
  );
  assert.match(tagList, /tags = \[\]/);
  assert.match(searchIndex, /const tags = stringArray\(project\.data\.tags\);/);
  assert.match(searchIndex, /searchTerms: \[\.\.\.stack, \.\.\.tags\]/);
  assert.match(tagUtilities, /for \(const label of entry\.data\.tags\)/);
});

test('homepage featured project cards display the same status badge as the projects archive', async () => {
  const home = await read('../src/pages/index.astro');
  const projects = await read('../src/pages/projects/index.astro');

  const projectCard = await read('../src/components/cards/ProjectCard.svelte');

  assert.match(
    projectCard,
    /<Badge\.Badge variant="outline" class="capitalize">\{project\.status\}<\/Badge\.Badge>/,
  );
  assert.match(home, /<ProjectCard\s+project=\{project\.data\}/);
  assert.match(projects, /<ProjectCard\s+project=\{project\.data\}/);
});

test('project cards share the journal card interaction and layout contract', async () => {
  const projectCard = await read('../src/components/cards/ProjectCard.svelte');
  const journalCard = await read('../src/components/cards/JournalEntryCard.svelte');
  const contentCard = await read('../src/components/cards/ContentCard.svelte');

  assert.match(projectCard, /<ContentCard \{href\} label=\{`View project \$\{project\.title\}`\}/);
  assert.match(projectCard, /pointer-events-none flex h-full min-w-0 flex-col/);
  assert.match(projectCard, /pointer-events-auto mt-auto block w-full min-w-0 max-w-full/);
  assert.match(projectCard, /<Badge\.Badge variant="outline"/);
  assert.match(projectCard, /collection="projects"/);
  assert.match(journalCard, /pointer-events-none flex min-w-0 flex-col/);
  assert.match(contentCard, /absolute inset-0/);
});

test('tag lists remain width-constrained scrollports at every breakpoint', async () => {
  const tags = await read('../src/components/cards/TagList.svelte');

  assert.match(tags, /min-w-0 max-w-full/);
  assert.match(tags, /touch-pan-x[^"]*overflow-x-auto/);
  assert.match(tags, /flex-nowrap/);
  assert.match(tags, /shrink-0/);
});

test('every card and detail-page tag wrapper is constrained to its available width', async () => {
  const journalCard = await read('../src/components/cards/JournalEntryCard.svelte');
  const projectCard = await read('../src/components/cards/ProjectCard.svelte');
  const home = await read('../src/pages/index.astro');
  const projectDetail = await read('../src/pages/projects/[...slug].astro');
  const journalDetail = await read('../src/pages/journal/[...slug].astro');

  for (const source of [journalCard, projectCard, projectDetail, journalDetail]) {
    assert.match(source, /block w-full min-w-0 max-w-full/);
  }

  assert.match(home, /<JournalEntryCard[\s\S]*index=\{index \+ selectedProjects\.length\}/);
  assert.match(projectCard, /mt-auto block w-full min-w-0 max-w-full/);
  assert.match(journalDetail, /<TagList tags=\{entry\.data\.tags}/);
  assert.doesNotMatch(journalDetail, /entry\.data\.tags\.map/);
});

test('homepage recent writing uses the shared journal card without duplicating tag markup', async () => {
  const home = await read('../src/pages/index.astro');

  assert.match(home, /import JournalEntryCard from '@components\/cards\/JournalEntryCard\.svelte'/);
  assert.match(home, /const latestEntries = entries\.slice\(0, 5\)/);
  assert.match(home, /<ol class="space-y-3"/);
  assert.doesNotMatch(home, /import TagList from/);
});
