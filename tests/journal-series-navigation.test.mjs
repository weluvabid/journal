import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertUniqueSeriesParts,
  getJournalSeriesEntries,
  getJournalSeriesPartCount,
  resolveJournalArticleNavigation,
} from '../src/lib/journal-series-navigation.ts';

const entry = (id, date, series, title = id) => ({
  data: { id, date: new Date(date), title, ...(series ? { series } : {}) },
});

const seriesPart = (id, part, date = `2026-01-${String(part).padStart(2, '0')}`) =>
  entry(id, date, { id: 'cost-aware-eviction', part });

const categoryOrder = [
  entry('newest-standalone', '2026-06-01'),
  seriesPart('series-part-1', 1, '2026-05-01'),
  entry('middle-standalone', '2026-04-01'),
  seriesPart('series-part-2', 2, '2026-03-01'),
  entry('oldest-standalone', '2026-02-01'),
  seriesPart('series-part-3', 3, '2026-01-01'),
  entry('after-series', '2025-12-01'),
];

test('series entries retain natural category chronology', () => {
  const result = resolveJournalArticleNavigation('series-part-2', categoryOrder);

  assert.equal(result.previous?.data.id, 'middle-standalone');
  assert.equal(result.next?.data.id, 'oldest-standalone');
});

test('series boundaries do not wrap or fall back to another series part', () => {
  const first = resolveJournalArticleNavigation('series-part-1', categoryOrder);
  const last = resolveJournalArticleNavigation('series-part-3', categoryOrder);

  assert.equal(first.previous?.data.id, 'newest-standalone');
  assert.equal(first.next?.data.id, 'middle-standalone');
  assert.equal(last.previous?.data.id, 'oldest-standalone');
  assert.equal(last.next?.data.id, 'after-series');
});

test('standalone entries retain chronological navigation', () => {
  const result = resolveJournalArticleNavigation('middle-standalone', categoryOrder);

  assert.equal(result.previous?.data.id, 'series-part-1');
  assert.equal(result.next?.data.id, 'series-part-2');
});

test('navigation stays within the supplied category order', () => {
  const current = seriesPart('series-part-2', 2);
  const otherCategoryPart = seriesPart('series-part-1', 1);
  const finalPart = seriesPart('series-part-3', 3);
  const result = resolveJournalArticleNavigation(current.data.id, [current]);

  assert.equal(result.previous, undefined);
  assert.equal(result.next, undefined);
  assert.notEqual(result.previous?.data.id, otherCategoryPart.data.id);
  assert.notEqual(result.next?.data.id, finalPart.data.id);
});

test('missing current entry fails loudly', () => {
  assert.throws(
    () => resolveJournalArticleNavigation('missing', categoryOrder),
    /missing from its category reading order/,
  );
});

test('duplicate part numbers within a series fail explicitly', () => {
  assert.throws(
    () => assertUniqueSeriesParts([seriesPart('first', 1), seriesPart('duplicate', 1)]),
    /Duplicate part 1 in journal series/,
  );
});

test('the same part number is valid in different series', () => {
  assert.doesNotThrow(() =>
    assertUniqueSeriesParts([
      entry('first', '2026-01-01', { id: 'series-a', part: 1 }),
      entry('second', '2026-01-02', { id: 'series-b', part: 1 }),
    ]),
  );
});

test('series part count includes only entries with the requested series id', () => {
  const entries = [
    seriesPart('part-1', 1),
    seriesPart('part-2', 2),
    entry('standalone', '2026-02-01'),
    entry('other-series', '2026-03-01', { id: 'another-series', part: 1 }),
  ];

  assert.equal(getJournalSeriesPartCount(entries, 'cost-aware-eviction'), 2);
  assert.equal(getJournalSeriesPartCount(entries, 'another-series'), 1);
  assert.equal(getJournalSeriesPartCount(entries, 'missing-series'), 0);
});

test('series index returns only matching entries in explicit part order', () => {
  const entries = [
    seriesPart('part-3', 3),
    entry('unrelated', '2026-02-01'),
    seriesPart('part-1', 1),
    entry('other-series', '2026-03-01', { id: 'another-series', part: 1 }),
    seriesPart('part-2', 2),
  ];

  assert.deepEqual(
    getJournalSeriesEntries(entries, 'cost-aware-eviction').map((item) => item.data.id),
    ['part-1', 'part-2', 'part-3'],
  );
});
