import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const journalRoot = new URL('../src/content/journal/', import.meta.url);
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

async function journalEntries() {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));
  return Promise.all(files.map(async (file) => {
    const source = await readFile(new URL(file, journalRoot), 'utf8');
    const match = source.match(/^---\n([\s\S]*?)\n---/u);
    assert.ok(match, `${file} must have frontmatter`);
    const frontmatter = match[1];
    const project = frontmatter.match(/^project: ([a-z0-9-]+)$/mu)?.[1];
    const kind = frontmatter.match(/^kind: (article|project)$/mu)?.[1] ?? 'article';
    return { file, source, frontmatter, data: { project, kind } };
  }));
}

test('journal schema models canonical projects and related articles in one collection', async () => {
  const schema = await read('src/content.config.ts');
  assert.match(schema, /kind: z\.enum\(\['article', 'project'\]\)/);
  assert.match(schema, /projectDetails: z\.object\(/);
  assert.match(schema, /data\.kind === 'project' && \(!data\.project \|\| !data\.projectDetails\)/);
  assert.doesNotMatch(schema, /const projects = defineCollection/);
});

test('each project has exactly one canonical journal entry and related articles share its id', async () => {
  const entries = await journalEntries();
  const associated = new Map();
  for (const entry of entries) {
    if (!entry.data.project) continue;
    const group = associated.get(entry.data.project) ?? [];
    group.push(entry);
    associated.set(entry.data.project, group);
  }
  assert.equal(associated.size, 11);
  for (const [id, group] of associated) {
    const canonical = group.filter(({ data }) => data.kind === 'project');
    assert.equal(canonical.length, 1, `${id} must have one canonical article`);
    assert.match(canonical[0].frontmatter, /^- project$/mu, `${id} canonical entry needs project tag`);
    assert.match(canonical[0].frontmatter, /^projectDetails:/mu, `${id} needs project metadata`);
    assert.match(canonical[0].frontmatter, /^  github: https:\/\//mu, `${id} needs repository URL`);
    assert.match(canonical[0].frontmatter, /^  stack:/mu, `${id} needs a stack`);
    for (const entry of group.filter(({ data }) => data.kind !== 'project')) {
      assert.equal(entry.data.project, id);
      assert.doesNotMatch(entry.frontmatter, /^projectDetails:/mu);
    }
  }
});

test('project metadata remains the source of truth without rendering a duplicate project block in articles', async () => {
  const page = await read('src/pages/journal/[...slug].astro');
  assert.match(page, /projectEntry\?\.data\.projectDetails\?\.github/);
  assert.doesNotMatch(page, /ProjectResources|Repository notes and resources/);
});

test('Projects archive is generated from canonical journal entries', async () => {
  const page = await read('src/pages/projects/index.astro');
  assert.match(page, /getCollection\('journal'\)/);
  assert.match(page, /assertProjectAssociations\(allEntries, entries\)/);
  assert.match(page, /data\.kind === 'project'/);
  assert.match(page, /href=\{entryHref\(entry\.data\.id\)\}/);
  assert.doesNotMatch(page, /getCollection\('projects'\)/);
});

test('legacy project detail URLs redirect to their canonical journal article', async () => {
  const page = await read('src/pages/projects/[...slug].astro');
  assert.match(page, /data\.kind === 'project'/);
  assert.match(page, /Astro\.redirect\(withBase\(`\/journal\/\$\{id\}\/`\), 301\)/);
});

test('project association validation rejects orphaned and duplicate canonical project IDs', async () => {
  const { assertProjectAssociations } = await import('../src/lib/journal-projects.ts');
  const canonical = {
    data: { id: 'project-article', kind: 'project', project: 'cachewise', projectDetails: {} },
  };
  const related = { data: { id: 'cachewise-part-two', kind: 'article', project: 'cachewise' } };
  assert.doesNotThrow(() => assertProjectAssociations([canonical, related]));
  assert.throws(
    () => assertProjectAssociations([related]),
    /references missing project "cachewise"/,
  );
  const draftCanonical = {
    data: { id: 'cachewise-project', kind: 'project', project: 'cachewise', draft: true, projectDetails: {} },
  };
  assert.throws(
    () => assertProjectAssociations([draftCanonical, related], [related]),
    /references unpublished project "cachewise"/,
  );
  assert.throws(
    () => assertProjectAssociations([canonical, { ...canonical, data: { ...canonical.data, id: 'duplicate' } }]),
    /multiple canonical articles/,
  );
});
