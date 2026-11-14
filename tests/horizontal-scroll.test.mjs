import test from 'node:test';
import assert from 'node:assert/strict';
import { getHorizontalScrollState } from '../src/lib/horizontal-scroll.ts';

test('horizontal scroll state reports both edges independently', () => {
  assert.deepEqual(
    getHorizontalScrollState({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 }),
    {
      canScrollLeft: false,
      canScrollRight: true,
    },
  );
  assert.deepEqual(
    getHorizontalScrollState({ scrollWidth: 500, clientWidth: 200, scrollLeft: 150 }),
    {
      canScrollLeft: true,
      canScrollRight: true,
    },
  );
  assert.deepEqual(
    getHorizontalScrollState({ scrollWidth: 500, clientWidth: 200, scrollLeft: 300 }),
    {
      canScrollLeft: true,
      canScrollRight: false,
    },
  );
  assert.deepEqual(
    getHorizontalScrollState({ scrollWidth: 200, clientWidth: 200, scrollLeft: 0 }),
    {
      canScrollLeft: false,
      canScrollRight: false,
    },
  );
});
