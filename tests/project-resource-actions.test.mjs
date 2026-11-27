import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const journalRoot = new URL('../src/content/journal/', import.meta.url);
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

async function journalEntries() {
  const files = (await readdir(journalRoot)).filter((file) => file.endsWith('.mdx'));

  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(new URL(file, journalRoot), 'utf8');
      const match = source.match(/^---\n([\s\S]*?)\n---/u);

      assert.ok(match, `${file} must have frontmatter`);
      const frontmatter = match[1];
      const project = frontmatter.match(/^project: ([a-z0-9-]+)$/mu)?.[1];
      const kind = frontmatter.match(/^kind: (article|project)$/mu)?.[1] ?? 'article';

      return { file, source, frontmatter, data: { project, kind } };
    }),
  );
}

test('journal schema models canonical projects and related articles in one collection', async () => {
  const schema = await read('src/content.config.ts');

  assert.match(schema, /kind: z\.enum\(\['article', 'project'\]\)/);
  assert.match(schema, /projectDetails:\s*z\s*\.object\(/);
  assert.match(schema, /data\.kind === 'project' && \(!data\.project \|\| !data\.projectDetails\)/);
  assert.doesNotMatch(schema, /const projects = defineCollection/);
});

test('each project has exactly one canonical journal entry and related articles share its id', async () => {
  const entries = await journalEntries();
  const associated = new Map();

  for (const entry of entries) {
    if (!entry.data.project) {
      continue;
    }

    const group = associated.get(entry.data.project) ?? [];

    group.push(entry);
    associated.set(entry.data.project, group);
  }

  assert.equal(associated.size, 22);

  for (const [id, group] of associated) {
    const canonical = group.filter(({ data }) => data.kind === 'project');

    assert.equal(canonical.length, 1, `${id} must have one canonical article`);
    assert.match(
      canonical[0].frontmatter,
      /^[ \t]*- project$/mu,
      `${id} canonical entry needs project tag`,
    );
    assert.match(canonical[0].frontmatter, /^projectDetails:/mu, `${id} needs project metadata`);
    assert.match(
      canonical[0].frontmatter,
      /^ {2}github: https:\/\//mu,
      `${id} needs repository URL`,
    );
    assert.match(canonical[0].frontmatter, /^ {2}stack:/mu, `${id} needs a stack`);

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
  assert.doesNotThrow(() =>
    assertProjectAssociations([
      canonical,
      { data: { id: 'pixelflow', kind: 'project', project: 'pixelflow', projectDetails: {} } },
      {
        data: {
          id: 'canvas-article',
          kind: 'article',
          relatedProjects: ['cachewise', 'pixelflow'],
        },
      },
    ]),
  );
  assert.throws(
    () => assertProjectAssociations([related]),
    /references missing project "cachewise"/,
  );
  const draftCanonical = {
    data: {
      id: 'cachewise-project',
      kind: 'project',
      project: 'cachewise',
      draft: true,
      projectDetails: {},
    },
  };

  assert.throws(
    () => assertProjectAssociations([draftCanonical, related], [related]),
    /references unpublished project "cachewise"/,
  );
  assert.throws(
    () =>
      assertProjectAssociations([
        canonical,
        { ...canonical, data: { ...canonical.data, id: 'duplicate' } },
      ]),
    /multiple canonical articles/,
  );
});

test('writing details link back to their canonical project and project pages return to Projects', async () => {
  const source = await readFile(
    new URL('../src/pages/journal/[...slug].astro', import.meta.url),
    'utf8',
  );

  assert.match(source, /entry\.data\.kind === 'article' && relatedProjectEntries\.length > 0/);
  assert.match(source, /Related \{relatedProjectEntries/);
  assert.match(source, /entryHref\(relatedProject\.data\.id\)/);
  assert.match(source, /entry\.data\.kind === 'project' \? 'Projects' : 'Writings'/);
  assert.match(source, /entry\.data\.kind === 'project' \? '\/projects\/'/);
});

test('web performance metrics article is associated with the Journal project', async () => {
  const article = await read('src/content/journal/reading-web-performance-metrics.mdx');
  const frontmatter = article.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? '';

  assert.match(frontmatter, /^kind: article$/mu);
  assert.match(frontmatter, /^project: journal$/mu);
});

test('canonical project pages list their published related writings', async () => {
  const page = await read('src/pages/journal/[...slug].astro');

  assert.match(page, /relatedWritingEntries/);
  assert.match(page, /entry\.data\.kind === 'project' && entry\.data\.project/);
  assert.match(page, /item\.data\.relatedProjects\?\.includes/);
  assert.match(page, /right\.data\.date\.getTime\(\) - left\.data\.date\.getTime\(\)/);
  assert.match(page, /Related writing/);
  assert.match(page, /entryHref\(relatedEntry\.data\.id\)/);
  assert.match(page, /relatedEntry\.data\.summary/);
});

test('Canvas article relates to both canonical projects and projects occupy positions three and four', async () => {
  const article = await read(
    'src/content/journal/beyond-the-comfort-zone-pushing-canvas-beyond-games-and-drawing.mdx',
  );
  const chronos = await read('src/content/journal/100k-timers-pushing-canvas-beyond-the-dom.mdx');
  const pixelflow = await read(
    'src/content/journal/beyond-timers-pixelflow-canvas-image-rendering.mdx',
  );
  const atlas = await read('src/content/journal/frontend-atlas-progress-without-accounts.mdx');

  assert.match(article, /^relatedProjects:\n {2}- chronos\n {2}- pixelflow$/mu);
  assert.match(chronos, /^title: 'Chronos'$/mu);
  assert.match(pixelflow, /^title: 'Pixelflow'$/mu);
  assert.match(chronos, /^ {2}order: 5$/mu);
  assert.match(pixelflow, /^ {2}order: 2$/mu);
  assert.match(atlas, /^ {2}order: 16$/mu);
  assert.match(atlas, /^ {2}demo: https:\/\/weluvabid\.github\.io\/frontend-atlas\/$/mu);
});
