import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access, readFile } from 'node:fs/promises';
const journalRoot = new URL('../src/content/journal/', import.meta.url);
test('Journal contains twenty-eight MDX entries with stable kebab-case filenames', async () => {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));
  assert.equal(files.length, 28);
  for (const file of files) assert.match(file.slice(0, -4), /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
});
test('all eleven projects live in Journal frontmatter; no duplicate project collection remains', async () => {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));
  const canonical = [];
  for (const file of files) {
    const source = await readFile(new URL(file, journalRoot), 'utf8');
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? '';
    if (/^kind: project$/mu.test(frontmatter)) canonical.push(frontmatter);
  }
  assert.equal(canonical.length, 11);
  for (const frontmatter of canonical) {
    assert.match(frontmatter, /^project: [a-z0-9-]+$/mu);
    assert.match(frontmatter, /^projectDetails:/mu);
    assert.match(frontmatter, /^- project$/mu);
  }
  await assert.rejects(access(new URL('../src/content/projects/', import.meta.url)));
});
test('Atlas runtime and question content have been removed', async () => {
  for (const path of [
    '../src/pages/domains/', '../src/pages/questions/', '../src/content/questions/',
    '../src/lib/atlas.ts', '../src/lib/content.ts', '../src/lib/progress/',
    '../src/data/domains.ts', '../src/data/question-manifest.ts',
    '../src/components/site/AtlasHeader.svelte', '../src/components/site/AtlasFooter.svelte',
    '../src/components/site/AtlasToaster.svelte',
  ]) await assert.rejects(access(new URL(path, import.meta.url)));
});
