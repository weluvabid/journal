import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(
  new URL('../src/pages/journal/index.astro', import.meta.url),
  'utf8',
);

test('main Journal label uses the same non-linked breadcrumb presentation as archive pages', () => {
  assert.match(source, /import\s+\{\s*Breadcrumb\s*\}\s+from\s+['"]@weluvabid\/iris\/components['"]/);
  assert.match(source, /<Breadcrumb\.Root class="mb-8"/);
  assert.match(source, /<Breadcrumb\.Page>Journal<\/Breadcrumb\.Page>/);
  assert.doesNotMatch(source, /<Breadcrumb\.Link[^>]*>Journal<\/Breadcrumb\.Link>/);
  assert.match(source, /<h1 class="sr-only">Journal<\/h1>/);
  assert.doesNotMatch(source, /<h1 class="mb-8 text-2xl/);
});

test('entry count, category filters and list remain after the breadcrumb', () => {
  const breadcrumbIndex = source.indexOf('<Breadcrumb.Root');
  const countIndex = source.indexOf('{entries.length}');
  const filtersIndex = source.indexOf('<CategorySelect');
  const listIndex = source.indexOf('<JournalEntryList');

  assert.ok(breadcrumbIndex >= 0 && breadcrumbIndex < countIndex);
  assert.ok(countIndex < filtersIndex);
  assert.ok(filtersIndex < listIndex);
  assert.match(source, /class="mb-4 text-xs font-semibold uppercase tracking-\[0\.18em\] text-muted-foreground"/);
});
