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

test('homepage shows the first four projects in curated project order', () => {
  assert.match(source, /projectDetails\?\.order/);
  assert.match(source, /const selectedProjects = projects\.slice\(0, 4\)/);
  assert.match(source, /selectedProjects\.map\(\(project, index\)/);
  assert.match(source, /number=\{index \+ 1\}/);
});

test('homepage shows the five newest journal entries using the archive list card variant', () => {
  assert.match(
    source,
    /const entries = \[\.\.\.allEntries\]\.sort\(\(a, b\) => b\.data\.date\.valueOf\(\) - a\.data\.date\.valueOf\(\)\)/,
  );
  assert.match(source, /const latestEntries = entries\.slice\(0, 5\)/);
  assert.match(source, /<ol class="space-y-3" aria-label="Recent journal entries">/);
  assert.match(source, /<JournalEntryCard[\s\S]*?index=\{index \+ selectedProjects\.length\}/);
  assert.doesNotMatch(source, /variant="featured"/);
});

test('homepage retains the existing all-projects and all-entries navigation', () => {
  assert.match(source, /href=\{withBase\('\/projects\/'\)\}>All projects/);
  assert.match(source, /href=\{withBase\('\/journal\/'\)\}>All entries/);
});
