import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const layout = await readFile(
  new URL('../../src/layouts/BaseLayout.astro', import.meta.url),
  'utf8',
);
const home = await readFile(new URL('../../src/pages/index.astro', import.meta.url), 'utf8');

test('shared layout retains skip-to-content and sticky-header scroll offset', () => {
  assert.match(layout, /href="#main-content"/u);
  assert.match(layout, /id="main-content"[^>]*scroll-mt-28/u);
});

test('shared layout retains delayed navigation loader', () => {
  assert.match(layout, /journal-navigation-loader/u);
  assert.match(layout, /\}, 200\)/u);
});

test('home page exposes Journal and Projects as primary destinations', () => {
  assert.match(home, /\/journal\//u);
  assert.match(home, /\/projects\//u);
});
