import test from 'node:test';
import assert from 'node:assert/strict';
import {
  orderDomainQuestions,
  questionHref,
  rankSearchResults,
  validateQuestionGraph,
  withBase,
} from '../src/lib/atlas.ts';

const question = (id, overrides = {}) => ({
  id,
  slug: id,
  title: id.replaceAll('-', ' '),
  domain: 'javascript-typescript',
  summary: 'A sufficiently descriptive summary for this test question.',
  difficulty: 'foundation',
  minutes: 5,
  tags: ['runtime'],
  prerequisites: [],
  related: [],
  featured: false,
  ...overrides,
});

test('question graph accepts valid relationships', () => {
  assert.doesNotThrow(() =>
    validateQuestionGraph([
      question('execution-context'),
      question('closures', { prerequisites: ['execution-context'] }),
    ]),
  );
});

test('question graph rejects duplicate immutable ids', () => {
  assert.throws(
    () => validateQuestionGraph([question('same-id'), question('same-id')]),
    /Duplicate question id/,
  );
});

test('question graph rejects missing and self references', () => {
  assert.throws(
    () => validateQuestionGraph([question('a', { related: ['missing'] })]),
    /unknown question/,
  );
  assert.throws(
    () => validateQuestionGraph([question('a', { prerequisites: ['a'] })]),
    /cannot reference itself/,
  );
});

test('question graph rejects prerequisite cycles', () => {
  assert.throws(
    () =>
      validateQuestionGraph([
        question('a', { prerequisites: ['b'] }),
        question('b', { prerequisites: ['a'] }),
      ]),
    /Prerequisite cycle/,
  );
});

test('question graph rejects duplicate relationship ids', () => {
  assert.throws(
    () => validateQuestionGraph([question('a', { related: ['b', 'b'] }), question('b')]),
    /duplicate related/,
  );
});

test('search ranks title matches above body-only matches and is deterministic', () => {
  const documents = [
    { ...question('body-hit'), searchableText: 'The event loop schedules tasks.' },
    {
      ...question('event-loop'),
      title: 'How does the event loop work?',
      searchableText: 'A browser runtime concept.',
    },
  ];
  const results = rankSearchResults(documents, 'event loop');

  assert.equal(results[0].id, 'event-loop');
});

test('search handles whitespace and empty queries', () => {
  assert.deepEqual(rankSearchResults([], '   '), []);
  assert.deepEqual(rankSearchResults([], 'event loop'), []);
});

test('search rejects invalid limits instead of silently changing behavior', () => {
  assert.throws(() => rankSearchResults([], 'query', 0), RangeError);
  assert.throws(() => rankSearchResults([], 'query', 1.5), RangeError);
});

test('base paths are applied only to internal URLs', () => {
  assert.equal(
    withBase('/search-index.json', '/frontend-atlas/'),
    '/frontend-atlas/search-index.json',
  );
  assert.equal(withBase('/', '/frontend-atlas/'), '/frontend-atlas/');
  assert.equal(
    withBase('https://example.com/docs', '/frontend-atlas/'),
    'https://example.com/docs',
  );
});

test('question URLs are derived from immutable IDs, never loader slugs', () => {
  assert.equal(
    questionHref('execution-context-and-call-stack'),
    '/questions/execution-context-and-call-stack/',
  );
  assert.throws(() => questionHref('nested/path'), /Invalid question id/);
});

test('domain reading order is stable and shared by listings and article navigation', () => {
  const questions = [
    question('z-intermediate', { difficulty: 'intermediate', title: 'Zeta' }),
    question('b-foundation', { difficulty: 'foundation', title: 'Beta' }),
    question('a-foundation', { difficulty: 'foundation', title: 'Alpha' }),
    question('a-advanced', { difficulty: 'advanced', title: 'Advanced' }),
  ];

  assert.deepEqual(
    orderDomainQuestions(questions).map(({ id }) => id),
    ['a-foundation', 'b-foundation', 'z-intermediate', 'a-advanced'],
  );
  assert.deepEqual(
    questions.map(({ id }) => id),
    ['z-intermediate', 'b-foundation', 'a-foundation', 'a-advanced'],
  );
});
