import test from 'node:test';
import assert from 'node:assert/strict';
import { INTENTS, pluralize } from '../src/lib/content-text.ts';

test('pluralize formats zero, singular, and plural counts', () => {
  assert.equal(pluralize(0, INTENTS.project), '0 projects');
  assert.equal(pluralize(1, INTENTS.project), '1 project');
  assert.equal(pluralize(5, INTENTS.project), '5 projects');
});

test('pluralize uses explicit irregular plural forms', () => {
  assert.equal(pluralize(1, INTENTS.entry), '1 entry');
  assert.equal(pluralize(9, INTENTS.entry), '9 entries');
  assert.equal(pluralize(2, INTENTS.category), '2 categories');
  assert.equal(pluralize(3, INTENTS.matchingEntry), '3 matching entries');
});

test('pluralize supports all declared content intents', () => {
  assert.equal(pluralize(2, INTENTS.tag), '2 tags');
  assert.equal(pluralize(2, INTENTS.result), '2 results');
});

test('pluralize rejects invalid counts', () => {
  for (const count of [
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.throws(() => pluralize(count, INTENTS.entry), RangeError);
  }
});
