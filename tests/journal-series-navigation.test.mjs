import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertUniqueSeriesParts,
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

test('series parts navigate to adjacent parts instead of chronological neighbours', () => {
  const result = resolveJournalArticleNavigation(
    'series-part-2',
    categoryOrder,
    categoryOrder,
  );

  assert.equal(result.previous?.data.id, 'series-part-1');
  assert.equal(result.next?.data.id, 'series-part-3');
});

test('first series part falls back to chronological previous entry', () => {
  const result = resolveJournalArticleNavigation(
    'series-part-1',
    categoryOrder,
    categoryOrder,
  );

  assert.equal(result.previous?.data.id, 'newest-standalone');
  assert.equal(result.next?.data.id, 'series-part-2');
});

test('last series part falls back to chronological next entry', () => {
  const result = resolveJournalArticleNavigation(
    'series-part-3',
    categoryOrder,
    categoryOrder,
  );

  assert.equal(result.previous?.data.id, 'series-part-2');
  assert.equal(result.next?.data.id, 'after-series');
});

test('standalone entries retain chronological navigation', () => {
  const result = resolveJournalArticleNavigation(
    'middle-standalone',
    categoryOrder,
    categoryOrder,
  );

  assert.equal(result.previous?.data.id, 'series-part-1');
  assert.equal(result.next?.data.id, 'series-part-2');
});

test('series navigation can cross category boundaries', () => {
  const current = seriesPart('series-part-2', 2);
  const otherCategoryPart = seriesPart('series-part-1', 1);
  const finalPart = seriesPart('series-part-3', 3);
  const result = resolveJournalArticleNavigation(
    current.data.id,
    [current],
    [otherCategoryPart, current, finalPart],
  );

  assert.equal(result.previous?.data.id, 'series-part-1');
  assert.equal(result.next?.data.id, 'series-part-3');
});

test('series part gaps navigate to the nearest existing lower and higher parts', () => {
  const entries = [seriesPart('part-1', 1), seriesPart('part-3', 3), seriesPart('part-7', 7)];
  const result = resolveJournalArticleNavigation('part-3', entries, entries);

  assert.equal(result.previous?.data.id, 'part-1');
  assert.equal(result.next?.data.id, 'part-7');
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

test('missing current entry fails loudly', () => {
  assert.throws(
    () => resolveJournalArticleNavigation('missing', categoryOrder, categoryOrder),
    /missing from its category reading order/,
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
