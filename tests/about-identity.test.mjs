import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('About page describes the engineering approach and links to real work and contact destination', async () => {
  const about = await read('src/pages/about.astro');
  const normalized = about.replace(/\s+/g, ' ');

  assert.match(normalized, /I'm Abid, a software engineer/);
  assert.match(normalized, /storage engines/);
  assert.match(normalized, /predictable, testable and easy to follow/);
  assert.match(normalized, /measure a\s+performance improvement/);
  assert.match(normalized, /href=\{withBase\('\/projects\/'\)\}/);
  assert.match(normalized, /href=\{withBase\('\/journal\/'\)\}/);
  assert.match(normalized, /https:\/\/github\.com\/weluvabid/);
});

test('homepage identifies the engineer without changing its selected-project source of truth', async () => {
  const home = await read('src/pages/index.astro');

  assert.match(home, /Abid <span class="text-muted-foreground">— Software Engineer<\/span>/);
  assert.match(home, /projects\.slice\(0, FEATURED_PROJECT_COUNT\)/);
});
