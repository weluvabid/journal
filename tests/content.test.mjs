import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { QUESTION_MANIFEST, MAX_QUESTION_COUNT } from '../src/data/question-manifest.ts';
import { rankSearchResults } from '../src/lib/atlas.ts';

const contentRoot = join(process.cwd(), 'src/content/questions');
const requiredSections = [
  '## Short answer',
  '## Why this matters in production',
  '## Interviewer follow-ups',
  '## Further reading',
];
const requiredSectionPatterns = [
  {
    label: 'first-principles reasoning',
    pattern:
      /^## (?:Reason from first principles|Why this is its own topic|Core rules that actually work|The pieces that actually matter|Why this shows up everywhere)$/mu,
  },
  {
    label: 'concrete example or implementation',
    pattern:
      /^## (?:A concrete example|Concrete implementation sketch|Concrete pattern|Concrete sketch of a focus trap|Implementation prompt)$/mu,
  },
  { label: 'boundary cases', pattern: /^## Boundary cases(?:\s|$)/mu },
  { label: 'common misconceptions', pattern: /^## Common misconceptions?$/mu },
];

async function findMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return findMdxFiles(path);
      }

      return entry.isFile() && entry.name.endsWith('.mdx') ? [path] : [];
    }),
  );

  return nested.flat();
}

async function readQuestion(path) {
  const source = await readFile(path, 'utf8');
  const frontmatter = source.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/u);

  assert.ok(frontmatter, `${path} must have YAML frontmatter`);

  const metadata = parse(frontmatter[1]);

  assert.ok(
    metadata !== null && typeof metadata === 'object' && !Array.isArray(metadata),
    `${path}: frontmatter must be a YAML mapping`,
  );

  return {
    metadata,
    body: source.slice(frontmatter[0].length),
    path,
  };
}

const questionFiles = await findMdxFiles(contentRoot);
const questions = await Promise.all(questionFiles.map(readQuestion));
const byId = new Map(questions.map(({ metadata }) => [metadata.id, metadata]));
const searchDocuments = questions.map(({ metadata, body }) => ({
  ...metadata,
  slug: metadata.id,
  searchableText: body,
}));

test('the collection retains its current content baseline across eight domains and stays within the cap', () => {
  assert.ok(questions.length <= MAX_QUESTION_COUNT);
  const counts = new Map();

  for (const { metadata } of questions) {
    counts.set(metadata.domain, (counts.get(metadata.domain) ?? 0) + 1);
  }

  assert.equal(counts.size, 8);
  assert.ok([...counts.values()].every((count) => count >= 5));
  assert.ok((counts.get('ui-engineering') ?? 0) >= 7);
});

test('the append-only QR manifest covers every question within the hard cap', () => {
  const ids = questions.map(({ metadata }) => metadata.id);

  assert.equal(QUESTION_MANIFEST.length, ids.length);
  assert.equal(new Set(QUESTION_MANIFEST).size, QUESTION_MANIFEST.length);
  assert.deepEqual([...QUESTION_MANIFEST].sort(), [...ids].sort());
  assert.ok(QUESTION_MANIFEST.length <= MAX_QUESTION_COUNT);
});

test('representative developer searches rank the intended article first', () => {
  const cases = [
    ['layout thrashing', 'css-performance-and-thrashing'],
    ['image lcp', 'responsive-images-and-loading'],
    ['stale cache', 'stale-while-revalidate-and-offline'],
    ['websocket reconnect', 'realtime-ui-patterns'],
    ['form validation', 'accessible-form-validation'],
    ['focus trap', 'focus-management-systems'],
    ['client side routing', 'client-side-routing-mental-model'],
    ['code splitting', 'javascript-bundle-budgeting'],
  ];

  for (const [query, expectedId] of cases) {
    assert.equal(
      rankSearchResults(searchDocuments, query, 1)[0]?.id,
      expectedId,
      `unexpected top result for "${query}"`,
    );
  }
});

test('every question has valid metadata and the complete editorial structure', () => {
  const ids = questions.map(({ metadata }) => metadata.id);

  assert.equal(new Set(ids).size, questions.length);

  for (const { metadata, body, path } of questions) {
    assert.match(metadata.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u, `${path}: invalid id`);
    assert.ok(
      metadata.title.length >= 12 && metadata.title.length <= 120,
      `${path}: invalid title`,
    );
    assert.ok(
      metadata.summary.length >= 40 && metadata.summary.length <= 240,
      `${path}: invalid summary`,
    );
    assert.ok(
      ['foundation', 'intermediate', 'advanced'].includes(metadata.difficulty),
      `${path}: invalid difficulty`,
    );
    assert.ok(
      Number.isSafeInteger(metadata.minutes) && metadata.minutes >= 3 && metadata.minutes <= 45,
      `${path}: invalid reading time`,
    );
    assert.ok(
      Array.isArray(metadata.tags) && metadata.tags.length >= 1 && metadata.tags.length <= 8,
      `${path}: invalid tags`,
    );

    if (metadata.searchTerms !== undefined) {
      assert.ok(
        Array.isArray(metadata.searchTerms) &&
          metadata.searchTerms.length <= 12 &&
          metadata.searchTerms.every(
            (term) => typeof term === 'string' && term.trim().length >= 2 && term.length <= 80,
          ),
        `${path}: invalid search terms`,
      );
    }

    assert.equal(
      relative(contentRoot, path).split(/[\\/]/u)[0],
      metadata.domain,
      `${path}: domain/path mismatch`,
    );

    for (const section of requiredSections) {
      assert.ok(body.includes(section), `${path}: missing ${section}`);
    }

    for (const { label, pattern } of requiredSectionPatterns) {
      assert.match(body, pattern, `${path}: missing ${label} section`);
    }

    assert.match(
      body,
      /\[[^\]]+\]\(https:\/\//u,
      `${path}: missing authoritative further reading link`,
    );
  }
});

test('all question relationships resolve and prerequisites form a DAG', () => {
  for (const { metadata } of questions) {
    for (const relation of [...metadata.prerequisites, ...metadata.related]) {
      assert.ok(byId.has(relation), `${metadata.id} references missing question ${relation}`);
      assert.notEqual(relation, metadata.id, `${metadata.id} references itself`);
    }
  }

  const visiting = new Set();
  const visited = new Set();

  function visit(id) {
    assert.ok(!visiting.has(id), `Prerequisite cycle detected at ${id}`);

    if (visited.has(id)) {
      return;
    }

    visiting.add(id);

    for (const prerequisite of byId.get(id).prerequisites) {
      visit(prerequisite);
    }

    visiting.delete(id);
    visited.add(id);
  }

  for (const id of byId.keys()) {
    visit(id);
  }
});
