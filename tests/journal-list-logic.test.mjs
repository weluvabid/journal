import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeJournalEntry } from '../src/lib/journal-list/serialize-entry.ts';
import {
  assertJournalPageIntegrity,
  isJournalPageResponse,
} from '../src/lib/journal-list/pagination-validation.ts';

const entry = {
  data: {
    id: 'entry-one',
    title: 'Entry one',
    summary: 'A summary',
    type: 'deep-dive',
    date: new Date('2026-11-14T00:00:00.000Z'),
    tags: ['Rust', 'Systems'],
    series: { id: 'series-one', part: 1 },
  },
};

const serialized = serializeJournalEntry(entry, '/journal/entry-one/', 2);
const page = { items: [serialized], nextPageUrl: null };

test('journal entry serialization produces the shared list contract', () => {
  assert.deepEqual(serialized, {
    id: 'entry-one',
    title: 'Entry one',
    summary: 'A summary',
    type: 'deep-dive',
    date: '2026-11-14T00:00:00.000Z',
    dateLabel: 'Nov 14, 2026',
    tags: ['Rust', 'Systems'],
    series: { part: 1, totalParts: 2 },
    href: '/journal/entry-one/',
  });
});

test('page response validation accepts the serialized contract and rejects malformed entries', () => {
  assert.equal(isJournalPageResponse(page), true);
  assert.equal(
    isJournalPageResponse({ items: [{ ...serialized, type: 'unknown' }], nextPageUrl: null }),
    false,
  );
  assert.equal(isJournalPageResponse({ items: [serialized], nextPageUrl: 42 }), false);
});

test('page integrity rejects duplicate ids, cycles, cross-origin URLs and empty non-terminal pages', () => {
  const base = {
    items: [serialized],
    nextPageUrl: null,
    pageSize: 8,
    seenIds: new Set(),
    requestedPageUrls: new Set(),
    requestUrl: new URL('https://example.test/journal/data/2.json'),
    followingPageUrl: null,
    currentOrigin: 'https://example.test',
  };

  assert.throws(
    () => assertJournalPageIntegrity({ ...base, seenIds: new Set(['entry-one']) }),
    /duplicate entry id/,
  );
  assert.throws(
    () =>
      assertJournalPageIntegrity({
        ...base,
        followingPageUrl: new URL('https://elsewhere.test/next.json'),
      }),
    /cross-origin/,
  );
  assert.throws(() => assertJournalPageIntegrity({ ...base, items: [], nextPageUrl: '/next.json' }), /empty page/);
  assert.throws(
    () => assertJournalPageIntegrity({ ...base, followingPageUrl: base.requestUrl }),
    /cycle/,
  );
});
