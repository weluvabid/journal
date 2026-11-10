import test from 'node:test';
import assert from 'node:assert/strict';
import { appendNavigationDigit, resolveNavigationIndex } from '../src/lib/keyboard.ts';

test('card navigation builds multi-digit sequences', () => {
  assert.equal(appendNavigationDigit('', '4'), '4');
  assert.equal(appendNavigationDigit('4', '0'), '40');
  assert.equal(appendNavigationDigit('04', '2'), '042');
});

test('card navigation rejects non-digits and bounds sequence length', () => {
  assert.throws(() => appendNavigationDigit('1', 'x'), TypeError);
  assert.throws(() => appendNavigationDigit('', '1', 0), RangeError);
  assert.equal(appendNavigationDigit('123456', '7'), '123456');
});

test('card navigation resolves 1-based card numbers to collection indexes', () => {
  assert.equal(resolveNavigationIndex('1', 40), 0);
  assert.equal(resolveNavigationIndex('09', 40), 8);
  assert.equal(resolveNavigationIndex('40', 40), 39);
  assert.equal(resolveNavigationIndex('0', 40), null);
  assert.equal(resolveNavigationIndex('41', 40), null);
  assert.equal(resolveNavigationIndex('', 40), null);
  assert.equal(resolveNavigationIndex('1.5', 40), null);
});

test('card navigation rejects invalid collection sizes', () => {
  assert.throws(() => resolveNavigationIndex('1', -1), RangeError);
  assert.throws(() => resolveNavigationIndex('1', 1.5), RangeError);
});
