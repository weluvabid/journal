import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryHref } from '../src/lib/category-href.ts';

test('category URLs preserve the configured base path and encode category IDs', () => {
  assert.equal(categoryHref('all'), '/journal/');
  assert.equal(categoryHref('all', '/portfolio/'), '/portfolio/journal/');
  assert.equal(categoryHref('systems design', '/portfolio/'), '/portfolio/journal/category/systems%20design/');
  assert.equal(categoryHref('frontend', 'portfolio'), '/portfolio/journal/category/frontend/');
});
