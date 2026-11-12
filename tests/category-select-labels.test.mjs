import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('journal categories are compact horizontal navigation chips, not a select control', async () => {
  const component = await read('src/components/journal/CategorySelect.svelte');

  assert.match(component, /<nav[^>]+aria-label="Journal categories"/);
  assert.match(component, /href=\{categoryHref\('all'\)\}/);
  assert.match(component, /All entries/);
  assert.match(component, /href=\{categoryHref\(category\.id\)\}/);
  assert.match(component, /aria-current=\{current === category\.id \? 'page' : undefined\}/);
  assert.match(component, /flex w-max min-w-full flex-nowrap gap-2/);
  assert.match(component, /px-2\.5 py-1 text-xs/);
  assert.match(component, /overflow-x-auto/);
  assert.doesNotMatch(component, /Select\./);
});

test('category navigation exposes independent left and right scroll shadows', async () => {
  const component = await read('src/components/journal/CategorySelect.svelte');

  assert.match(component, /canScrollLeft = maxScrollLeft > 1 && viewport\.scrollLeft > 1/);
  assert.match(
    component,
    /canScrollRight = maxScrollLeft > 1 && viewport\.scrollLeft < maxScrollLeft - 1/,
  );
  assert.match(component, /ResizeObserver/);
  assert.match(component, /revealCurrentCategory/);
  assert.match(component, /querySelector<HTMLElement>\('\[aria-current="page"\]'\)/);
  assert.match(component, /viewport\.scrollLeft = Math\.max/);
  assert.match(component, /shadow-\[inset_12px_0/);
  assert.match(component, /shadow-\[inset_-12px_0/);
  assert.match(component, /motion-safe:transition-opacity/);
});

test('journal archive category controls can use the full available content width', async () => {
  for (const path of [
    'src/pages/journal/index.astro',
    'src/pages/journal/category/[...slug].astro',
  ]) {
    const page = await read(path);

    assert.match(page, /class="mb-6 min-w-0 max-w-full"/);
  }
});

test('journal landing and category archives use the compact shared archive layout', async () => {
  const index = await read('src/pages/journal/index.astro');
  const category = await read('src/pages/journal/category/[...slug].astro');

  assert.match(index, /<Breadcrumb\.Page>Journal<\/Breadcrumb\.Page>/);
  assert.match(index, /<h1 class="sr-only">Journal<\/h1>/);
  assert.match(index, /\{entries\.length\}\{\s*' '\s*\}\{entries\.length === 1/);
  assert.doesNotMatch(index, /Writing & notes|An evolving record of experiments/);
  assert.ok(index.indexOf('{entries.length}') < index.indexOf('<CategorySelect'));

  assert.match(category, /<Breadcrumb\.Page>\{category\.name\}<\/Breadcrumb\.Page>/);
  assert.match(category, /<h1 class="sr-only">\{category\.name\}<\/h1>/);
  assert.doesNotMatch(category, /<h1 class="mt-3 text-4xl|<p class="mt-4 text-base leading-8/);
  assert.ok(category.indexOf('{entries.length}') < category.indexOf('<CategorySelect'));
});
