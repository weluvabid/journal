import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access, readFile } from 'node:fs/promises';
const journalRoot = new URL('../src/content/journal/', import.meta.url);

test('Journal contains fourteen MDX entries with stable kebab-case filenames', async () => {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));

  assert.equal(files.length, 14);

  for (const file of files) {
    assert.match(file.slice(0, -4), /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
  }
});
test('all twelve projects live in Journal frontmatter; no duplicate project collection remains', async () => {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));
  const canonical = [];

  for (const file of files) {
    const source = await readFile(new URL(file, journalRoot), 'utf8');
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? '';

    if (/^kind: project$/mu.test(frontmatter)) {
      canonical.push(frontmatter);
    }
  }

  assert.equal(canonical.length, 12);

  for (const frontmatter of canonical) {
    assert.match(frontmatter, /^project: [a-z0-9-]+$/mu);
    assert.match(frontmatter, /^projectDetails:/mu);
    assert.match(frontmatter, /^ {2}order: [1-9][0-9]*$/mu);
    assert.doesNotMatch(frontmatter, /^featured:|^ {2}featured:/mu);
    assert.match(frontmatter, /^\s+- project$/mu);
  }

  await assert.rejects(access(new URL('../src/content/projects/', import.meta.url)));
});

test('Atlas runtime and question content have been removed', async () => {
  for (const path of [
    '../src/pages/domains/',
    '../src/pages/questions/',
    '../src/content/questions/',
    '../src/lib/atlas.ts',
    '../src/lib/content.ts',
    '../src/lib/progress/',
    '../src/data/domains.ts',
    '../src/data/question-manifest.ts',
    '../src/components/site/AtlasHeader.svelte',
    '../src/components/site/AtlasFooter.svelte',
    '../src/components/site/AtlasToaster.svelte',
  ]) {
    await assert.rejects(access(new URL(path, import.meta.url)));
  }
});

test('Journal has two writing entries and one canonical project entry for Journal itself', async () => {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));
  let articles = 0;
  let journalProject = false;

  for (const file of files) {
    const source = await readFile(new URL(file, journalRoot), 'utf8');
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? '';

    if (/^kind: article$/mu.test(frontmatter)) {
      articles += 1;
    }

    if (/^project: journal$/mu.test(frontmatter) && /^kind: project$/mu.test(frontmatter)) {
      journalProject = true;
    }
  }

  assert.equal(articles, 2);
  assert.equal(journalProject, true);
});
