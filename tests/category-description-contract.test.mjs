import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('category landing pages keep the category description out of visible content', async () => {
  const page = await read('src/pages/journal/category/[...slug].astro');

  assert.match(page, /<BaseLayout[^>]*description=\{category\.description\}/s);
  assert.doesNotMatch(page, /<p[^>]*>\s*\{category\.description\}\s*<\/p>/);
});

test('homepage omits the topic directory in favour of selected projects and recent writing', async () => {
  const page = await read('src/pages/index.astro');

  assert.doesNotMatch(page, /Browse by topic|Journal categories|categories\.map|@data\/categories/);
  assert.match(page, /aria-labelledby="projects-heading"/);
  assert.match(page, /<h2 id="projects-heading"[^>]*>\s*Projects\s*<\/h2>/);
  assert.match(page, /aria-labelledby="featured-heading"/);
  assert.match(page, /<h2 id="featured-heading"[^>]*>\s*Writing\s*<\/h2>/);
  assert.ok(page.indexOf('id="projects-heading"') < page.indexOf('id="featured-heading"'));
  assert.match(page, /const selectedProjects = projects\.slice\(0, 4\)/);
  assert.match(page, /const latestEntries = entries\.slice\(0, 5\)/);
});
