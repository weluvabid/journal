import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const contentRoot = new URL('../src/content/journal/', import.meta.url);

test('every canonical project has explicit card identity and summary', async () => {
  const files = (await readdir(contentRoot)).filter((name) => name.endsWith('.mdx'));
  const projects = [];

  for (const name of files) {
    const source = await readFile(new URL(name, contentRoot), 'utf8');
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? '';

    if (!/^kind: project$/mu.test(frontmatter)) {
      continue;
    }

    assert.match(frontmatter, /^ {2}name: .+$/mu, `${name} must define a project name`);
    assert.match(frontmatter, /^ {2}summary: >-?$/mu, `${name} must define a project card summary`);
    projects.push(name);
  }

  assert.equal(projects.length, 22);
});

test('project cards use project metadata rather than editorial article titles', async () => {
  const card = await readFile(
    new URL('../src/components/cards/ProjectCard.svelte', import.meta.url),
    'utf8',
  );
  const archive = await readFile(
    new URL('../src/pages/projects/index.astro', import.meta.url),
    'utf8',
  );

  assert.match(card, /project\.name/u);
  assert.doesNotMatch(card, /project\.title/u);
  assert.match(archive, /name: entry\.data\.projectDetails!\.name/u);
  assert.match(archive, /summary: entry\.data\.projectDetails!\.summary/u);
});
