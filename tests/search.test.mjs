import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSearchIndex } from '../src/lib/search/index.ts';
import { isSearchDocument, parseSearchIndex } from '../src/lib/search/validation.ts';
import { normalizeSearchText, rankSearchResults } from '../src/lib/search/ranking.ts';

function document(id, overrides = {}) {
  return {
    id,
    title: `Question about ${id}`,
    summary: 'A sufficiently descriptive summary for this search document.',
    tags: ['runtime'],
    searchTerms: [],
    href: `/journal/${id}/`,
    kind: 'entry',
    searchableText: 'runtime execution',
    ...overrides,
  };
}

test('search documents contain only the fields consumed by Journal search', () => {
  const item = document('event-loop');

  assert.deepEqual(Object.keys(item).sort(), [
    'href',
    'id',
    'kind',
    'searchTerms',
    'searchableText',
    'summary',
    'tags',
    'title',
  ]);
  assert.equal(isSearchDocument({ ...item, href: '//external.example/path' }), false);
  assert.equal(isSearchDocument({ ...item, minutes: 5 }), false);
});

test('search document guard validates the complete indexed shape', () => {
  assert.equal(isSearchDocument(document('event-loop')), true);
  assert.equal(isSearchDocument({ ...document('event-loop'), href: 'javascript:alert(1)' }), false);
  assert.equal(isSearchDocument({ ...document('event-loop'), kind: 'entry' }), true);
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

test('search index parser validates payload shape and entry documents', () => {
  assert.deepEqual(parseSearchIndex({ version: 2, documents: [document('event-loop')] }), [
    document('event-loop'),
  ]);
  assert.throws(() => parseSearchIndex({ version: 1, documents: [] }), /unsupported or invalid/u);
  assert.throws(() => parseSearchIndex({ version: 3, documents: [] }), /unsupported or invalid/u);
  assert.throws(
    () => parseSearchIndex({ version: 2, documents: [{ invalid: true }] }),
    /invalid document/u,
  );
});

test('search loader deduplicates concurrent requests and reuses the parsed index', async () => {
  let requests = 0;
  const fetcher = async (url, options) => {
    requests += 1;

    assert.equal(url, '/search-index.v2.json');
    assert.equal(options, undefined);
    await Promise.resolve();

    return new Response(JSON.stringify({ version: 2, documents: [document('event-loop')] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const [first, concurrent] = await Promise.all([
    loadSearchIndex(fetcher),
    loadSearchIndex(fetcher),
  ]);
  const subsequent = await loadSearchIndex(fetcher);

  assert.equal(requests, 1);
  assert.strictEqual(first, concurrent);
  assert.strictEqual(first, subsequent);
  assert.equal(first[0].id, 'event-loop');
});

test('search loader reports HTTP failures and allows retry', async () => {
  let requests = 0;
  const fetcher = async () => {
    requests += 1;

    if (requests === 1) {
      return new Response('', { status: 503 });
    }

    return new Response(JSON.stringify({ version: 2, documents: [document('event-loop')] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  await assert.rejects(loadSearchIndex(fetcher), /HTTP 503/u);
  const documents = await loadSearchIndex(fetcher);

  assert.equal(requests, 2);
  assert.equal(documents[0].id, 'event-loop');
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

test('search index array normalization tolerates missing optional collection metadata', async () => {
  const { stringArray } = await import('../src/lib/search/arrays.ts');

  assert.deepEqual(stringArray(undefined), []);
  assert.deepEqual(stringArray(null), []);
  assert.deepEqual(stringArray('not-an-array'), []);
  assert.deepEqual(stringArray(['rust', 42, 'systems']), ['rust', 'systems']);
});
