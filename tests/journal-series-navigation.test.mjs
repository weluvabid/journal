import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertUniqueSeriesParts,
  getJournalSeriesEntries,
  getJournalSeriesPartCount,
  sortJournalEntriesWithSeriesGroups,
} from '../src/lib/journal-series-navigation.ts';

const entry = (id, date, series, title = id) => ({
  data: { id, date: new Date(date), title, ...(series ? { series } : {}) },
});

const seriesPart = (id, part, date = `2026-01-${String(part).padStart(2, '0')}`) =>
  entry(id, date, { id: 'cost-aware-eviction', part });

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

test('series are sorted internally and treated as one group in the outer date order', () => {
  const entries = [
    entry('d', '2026-04-01'),
    seriesPart('part-3', 3, '2026-01-01'),
    entry('b', '2026-03-01'),
    seriesPart('part-1', 1, '2026-02-01'),
    entry('a', '2026-05-01'),
    seriesPart('part-2', 2, '2026-03-15'),
  ];

  assert.deepEqual(
    sortJournalEntriesWithSeriesGroups(entries).map((item) => item.data.id),
    ['a', 'd', 'b', 'part-1', 'part-2', 'part-3'],
  );
});

test('series group position is determined by its first published part, not later parts', () => {
  const entries = [
    entry('standalone-newer', '2026-04-01'),
    seriesPart('part-2', 2, '2026-06-01'),
    seriesPart('part-1', 1, '2026-02-01'),
    entry('standalone-older', '2026-01-01'),
  ];

  assert.deepEqual(
    sortJournalEntriesWithSeriesGroups(entries).map((item) => item.data.id),
    ['standalone-newer', 'part-1', 'part-2', 'standalone-older'],
  );
});
