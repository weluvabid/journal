import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNAL_PAGE_SIZE, paginateItems } from '../src/lib/journal-pagination.ts';

test('pagination returns stable, non-overlapping pages and a terminal cursor', () => {
  const source = Array.from({ length: JOURNAL_PAGE_SIZE * 2 + 3 }, (_, index) => index);
  const first = paginateItems(source, 1);
  const second = paginateItems(source, first.nextPage);
  const third = paginateItems(source, second.nextPage);

  assert.deepEqual(first.items, source.slice(0, JOURNAL_PAGE_SIZE));
  assert.equal(first.nextPage, 2);
  assert.deepEqual(second.items, source.slice(JOURNAL_PAGE_SIZE, JOURNAL_PAGE_SIZE * 2));
  assert.equal(second.nextPage, 3);
  assert.deepEqual(third.items, source.slice(JOURNAL_PAGE_SIZE * 2));
  assert.equal(third.nextPage, null);
  assert.deepEqual([...first.items, ...second.items, ...third.items], source);
});

test('pagination handles empty collections and out-of-range pages', () => {
  assert.deepEqual(paginateItems([], 1), { items: [], nextPage: null });
  assert.deepEqual(paginateItems([1, 2], 2), { items: [], nextPage: null });
});

test('pagination rejects invalid page numbers and page sizes', () => {
  for (const page of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => paginateItems([1, 2], page), RangeError);
  }

  for (const pageSize of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => paginateItems([1, 2], 1, pageSize), RangeError);
  }
});
