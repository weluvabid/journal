import test from 'node:test';
import assert from 'node:assert/strict';
import { orderEntries, entryHref, rankSearchResults, withBase } from '../src/lib/journal.ts';

const entry = (id, overrides = {}) => ({
  id, slug: id, title: id.replaceAll('-', ' '), category: 'systems-engineering',
  summary: 'A sufficiently descriptive summary for this journal entry.',
  difficulty: 'intermediate', minutes: 5, tags: ['systems'], searchTerms: [],
  prerequisites: [], related: [], featured: false, ...overrides,
});

test('search ranks title matches above body-only matches deterministically', () => {
  const docs = [
    { ...entry('body-hit'), searchableText: 'The event loop schedules tasks.' },
    { ...entry('event-loop'), title: 'How does the event loop work?', searchableText: 'A runtime concept.' },
  ];
  assert.equal(rankSearchResults(docs, 'event loop')[0].id, 'event-loop');
});

test('search handles empty queries and rejects invalid limits', () => {
  assert.deepEqual(rankSearchResults([], '   '), []);
  assert.throws(() => rankSearchResults([], 'query', 0), RangeError);
  assert.throws(() => rankSearchResults([], 'query', 1.5), RangeError);
});

test('base paths are applied only to internal URLs', () => {
  assert.equal(withBase('/search-index.json', '/journal/'), '/journal/search-index.json');
  assert.equal(withBase('/', '/journal/'), '/journal/');
  assert.equal(withBase('https://example.com/docs', '/journal/'), 'https://example.com/docs');
});

test('journal entry URLs are derived from stable IDs', () => {
  assert.equal(entryHref('building-a-cache'), '/journal/building-a-cache/');
  assert.throws(() => entryHref('nested/path'), /Invalid journal entry id/);
});

test('entry ordering is deterministic and does not mutate input', () => {
  const items = [entry('zeta'), entry('alpha'), entry('beta')];
  assert.deepEqual(orderEntries(items).map(({ id }) => id), ['alpha', 'beta', 'zeta']);
  assert.deepEqual(items.map(({ id }) => id), ['zeta', 'alpha', 'beta']);
});
