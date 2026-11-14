import test from 'node:test';
import assert from 'node:assert/strict';
import { entryHref, withBase } from '../src/lib/journal.ts';
import { rankSearchResults } from '../src/lib/search/ranking.ts';

const entry = (id, overrides = {}) => ({
  id,
  title: id.replaceAll('-', ' '),
  summary: 'A sufficiently descriptive summary for this search document.',
  tags: ['systems'],
  searchTerms: [],
  searchableText: '',
  href: `/journal/${id}/`,
  kind: 'entry',
  ...overrides,
});

test('search ranks title matches above body-only matches deterministically', () => {
  const docs = [
    { ...entry('body-hit'), searchableText: 'The event loop schedules tasks.' },
    {
      ...entry('event-loop'),
      title: 'How does the event loop work?',
      searchableText: 'A runtime concept.',
    },
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
  assert.equal(
    entryHref('building-a-cache', { categoryId: 'rust-systems' }),
    '/journal/building-a-cache/?context=category%3Arust-systems',
  );
  assert.throws(() => entryHref('nested/path'), /Invalid journal entry id/);
});
