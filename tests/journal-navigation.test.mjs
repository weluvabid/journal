import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseJournalNavigationContext,
  resolveJournalNavigation,
} from '../src/lib/journal-navigation.ts';

const entry = (id, series) => ({ data: { id, title: id, ...(series ? { series } : {}) } });
const sequence = [
  entry('a'),
  entry('b'),
  entry('c1', { id: 'series-c', part: 1 }),
  entry('c2', { id: 'series-c', part: 2 }),
  entry('c3', { id: 'series-c', part: 3 }),
  entry('d'),
];

test('navigation follows the supplied sequence even when entries belong to a series', () => {
  const expected = [
    ['a', undefined, 'b'],
    ['b', 'a', 'c1'],
    ['c1', 'b', 'c2'],
    ['c2', 'c1', 'c3'],
    ['c3', 'c2', 'd'],
    ['d', 'c3', undefined],
  ];

  for (const [current, previous, next] of expected) {
    const result = resolveJournalNavigation(current, sequence);
    assert.equal(result.previous?.data.id, previous);
    assert.equal(result.next?.data.id, next);
  }
});

test('navigation boundaries never wrap', () => {
  assert.equal(resolveJournalNavigation('a', sequence).previous, undefined);
  assert.equal(resolveJournalNavigation('d', sequence).next, undefined);
});

test('navigation can use the full journal or a category-specific sequence', () => {
  const all = [entry('other-category'), ...sequence];
  const category = sequence.filter((item) => item.data.id !== 'b');

  assert.equal(resolveJournalNavigation('c2', all).next?.data.id, 'c3');
  assert.equal(resolveJournalNavigation('c2', category).previous?.data.id, 'c1');
  assert.equal(resolveJournalNavigation('c2', category).next?.data.id, 'c3');
});

test('missing current article fails loudly', () => {
  assert.throws(
    () => resolveJournalNavigation('missing', sequence),
    /missing from its navigation sequence/,
  );
});

test('direct article visits and invalid contexts default to All', () => {
  assert.deepEqual(parseJournalNavigationContext('', 'rust-systems'), { type: 'all' });
  assert.deepEqual(parseJournalNavigationContext('?context=unknown', 'rust-systems'), {
    type: 'all',
  });
  assert.deepEqual(parseJournalNavigationContext('?context=category:frontend', 'rust-systems'), {
    type: 'all',
  });
});

test('category archive context is accepted only for the current article category', () => {
  assert.deepEqual(
    parseJournalNavigationContext('?context=category:rust-systems', 'rust-systems'),
    { type: 'category', categoryId: 'rust-systems' },
  );
});
