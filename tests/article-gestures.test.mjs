import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveArticleSwipeDestination } from '../src/lib/navigation/article-gestures.ts';

const targets = { previousUrl: '/journal/previous/', nextUrl: '/journal/next/' };

test('horizontal swipe resolves previous and next destinations', () => {
  assert.equal(resolveArticleSwipeDestination(-100, 10, targets), '/journal/next/');
  assert.equal(resolveArticleSwipeDestination(100, 10, targets), '/journal/previous/');
});

test('vertical, short and diagonal gestures do not navigate', () => {
  assert.equal(resolveArticleSwipeDestination(-40, 0, targets), null);
  assert.equal(resolveArticleSwipeDestination(-100, 100, targets), null);
  assert.equal(resolveArticleSwipeDestination(0, 140, targets), null);
});

test('swipe at a boundary has no destination', () => {
  assert.equal(resolveArticleSwipeDestination(-100, 0, { previousUrl: null, nextUrl: null }), null);
});

test('invalid swipe thresholds fail explicitly', () => {
  assert.throws(
    () => resolveArticleSwipeDestination(-100, 0, { ...targets, threshold: 0 }),
    RangeError,
  );
});

test('horizontal swipe direction is available even when the destination is missing', async () => {
  const { resolveArticleSwipeDirection } = await import(
    '../src/lib/navigation/article-gestures.ts'
  );

  assert.equal(resolveArticleSwipeDirection(-100, 0), 'next');
  assert.equal(resolveArticleSwipeDirection(100, 0), 'previous');
  assert.equal(resolveArticleSwipeDirection(-30, 0), null);
});
