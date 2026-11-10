import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSearchIndex } from '../src/lib/search/index.ts';
import { isSearchDocument, parseSearchIndex } from '../src/lib/search/validation.ts';
import { normalizeSearchText, rankSearchResults } from '../src/lib/atlas.ts';

function document(id, overrides = {}) {
  return {
    id,
    slug: id,
    title: `Question about ${id}`,
    domain: 'javascript-typescript',
    summary: 'A sufficiently descriptive summary for this search document.',
    difficulty: 'foundation',
    minutes: 8,
    tags: ['runtime'],
    prerequisites: [],
    related: [],
    featured: false,
    searchableText: 'runtime execution',
    ...overrides,
  };
}

test('search document guard validates the complete indexed shape', () => {
  assert.equal(isSearchDocument(document('event-loop')), true);
  assert.equal(isSearchDocument({ ...document('event-loop'), minutes: 1.5 }), false);
  assert.equal(isSearchDocument({ ...document('event-loop'), domain: 'unknown' }), false);
  assert.equal(isSearchDocument({ ...document('event-loop'), searchTerms: ['valid alias'] }), true);
  assert.equal(isSearchDocument({ ...document('event-loop'), searchTerms: [42] }), false);
  assert.equal(
    isSearchDocument({
      ...document('event-loop'),
      searchTerms: Array.from({ length: 13 }, () => 'alias'),
    }),
    false,
  );
});

test('search index parser validates payload shape and question relationships', () => {
  assert.deepEqual(parseSearchIndex({ version: 1, documents: [document('event-loop')] }), [
    document('event-loop'),
  ]);
  assert.throws(() => parseSearchIndex({ version: 2, documents: [] }), /unsupported or invalid/u);
  assert.throws(
    () =>
      parseSearchIndex({
        version: 1,
        documents: [document('event-loop', { related: ['missing'] })],
      }),
    /unknown question/u,
  );
});

test('search loader passes its abort signal and reports HTTP failures', async () => {
  const controller = new AbortController();
  let requestedUrl = '';
  let requestedSignal;
  const fetcher = async (url, options) => {
    requestedUrl = url;
    requestedSignal = options.signal;

    return new Response(JSON.stringify({ version: 1, documents: [document('event-loop')] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const documents = await loadSearchIndex(controller.signal, fetcher);

  assert.equal(requestedUrl, '/search-index.json');
  assert.equal(requestedSignal, controller.signal);
  assert.equal(documents[0].id, 'event-loop');
  await assert.rejects(
    loadSearchIndex(controller.signal, async () => new Response('', { status: 503 })),
    /HTTP 503/u,
  );
});

test('search normalization handles case, punctuation, accents, and whitespace', () => {
  assert.equal(normalizeSearchText('  RÉALTIME   UI — WebSockets! '), 'realtime ui websockets');
});

test('ranking prioritizes exact title phrases over incidental body mentions', () => {
  const exact = document('browser-rendering', {
    title: 'Browser Rendering Pipeline',
    searchableText: 'style layout paint compositing',
  });
  const incidental = document('miscellaneous', {
    title: 'A Practical Frontend Guide',
    searchableText: 'browser rendering pipeline appears in this paragraph',
  });

  assert.deepEqual(
    rankSearchResults([incidental, exact], 'browser rendering').map(({ id }) => id),
    ['browser-rendering', 'miscellaneous'],
  );
});

test('ranking rewards complete query coverage and curated search terms', () => {
  const aliasMatch = document('realtime-ui-patterns', {
    title: 'Reliable Realtime UI',
    searchTerms: ['websocket reconnect', 'live updates'],
    searchableText: 'A persistent connection can fail.',
  });
  const partialMatch = document('network-basics', {
    title: 'Network Basics',
    searchableText: 'Reconnect after the browser loses connectivity.',
  });

  assert.equal(
    rankSearchResults([partialMatch, aliasMatch], 'websocket reconnect')[0].id,
    'realtime-ui-patterns',
  );
});

test('ranking supports conservative one-character typo tolerance in metadata', () => {
  const target = document('websocket-guide', {
    title: 'WebSocket Connection Recovery',
    tags: ['realtime'],
  });

  assert.equal(rankSearchResults([target], 'websoket')[0].id, 'websocket-guide');
});

test('ranking uses token boundaries rather than arbitrary substring matches', () => {
  const unrelated = document('statement-guide', {
    title: 'Understanding Statements',
    summary: 'A guide to application statements.',
    tags: ['statement'],
    searchableText: 'statement statements',
  });

  assert.deepEqual(rankSearchResults([unrelated], 'tate'), []);
});

test('ranking returns no results for empty queries and validates limits', () => {
  const item = document('event-loop');

  assert.deepEqual(rankSearchResults([item], '   '), []);
  assert.throws(() => rankSearchResults([item], 'event', 0), /positive safe integer/u);
});
