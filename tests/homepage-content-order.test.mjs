import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

const sectionIndex = (id) => source.indexOf(`aria-labelledby="${id}"`);

test('homepage removes the topic directory and places selected projects before writing', () => {
  assert.doesNotMatch(
    source,
    /Browse by topic|Journal categories|categories\.map|@data\/categories/,
  );
  assert.ok(sectionIndex('projects-heading') >= 0);
  assert.ok(sectionIndex('featured-heading') > sectionIndex('projects-heading'));
});

test('homepage derives its featured six from canonical project ranking metadata', () => {
  assert.match(source, /rankProjects\(/);
  assert.match(source, /projects\.slice\(0, FEATURED_PROJECT_COUNT\)/);
  assert.doesNotMatch(source, /featuredProjectIds|projectsById|selectedProjects = .*map/);
  assert.match(source, /selectedProjects\.map\(\(project, index\)/);
  assert.match(source, /number=\{index \+ 1\}/);
});

test('homepage shows the five newest journal entries using the archive list card variant', () => {
  assert.match(
    source,
    /const entries = \[\.\.\.allEntries\][\s\S]*?\.filter\(\(entry\) => entry\.data\.kind === 'article'\)[\s\S]*?\.sort\(/,
  );
  assert.match(source, /const latestEntries = entries\.slice\(0, 5\)/);
  assert.match(source, /<ol class="space-y-3" aria-label="Recent journal entries">/);
  assert.match(source, /<JournalEntryCard[\s\S]*?index=\{index \+ selectedProjects\.length\}/);
  assert.doesNotMatch(source, /variant="featured"/);
});

test('homepage retains project and writing archive navigation', () => {
  assert.match(source, /href=\{withBase\('\/projects\/'\)\}>All projects/);
  assert.match(source, /href=\{withBase\('\/journal\/'\)\}>All writings/);
});
