import { MAX_QUESTION_COUNT } from '../data/question-manifest.ts';

export const DOMAIN_IDS = [
  'javascript-typescript',
  'browser-web-platform',
  'css-rendering',
  'frameworks-ui-architecture',
  'ui-engineering',
  'performance-reliability',
  'frontend-system-design',
  'accessibility-security-testing',
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];
export type Difficulty = 'foundation' | 'intermediate' | 'advanced';

export interface QuestionSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly domain: DomainId;
  readonly summary: string;
  readonly difficulty: Difficulty;
  readonly minutes: number;
  readonly tags: readonly string[];
  readonly searchTerms: readonly string[];
  readonly prerequisites: readonly string[];
  readonly related: readonly string[];
  readonly featured: boolean;
}

export interface SearchDocument extends QuestionSummary {
  readonly searchableText: string;
}

/** Prefix an internal site path with Astro's configured deployment base. */
export function withBase(path: string, baseUrl = import.meta.env?.BASE_URL ?? '/'): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(path)) {
    return path;
  }

  const base = baseUrl.replace(/\/+$/u, '');
  const pathname = `/${path.replace(/^\/+/, '')}`;

  return `${base}${pathname}` || '/';
}

/** Build the canonical question URL from its immutable content ID. */
export function questionHref(id: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
    throw new TypeError(`Invalid question id for URL: ${id}`);
  }

  return withBase(`/questions/${id}/`);
}

const difficultyOrder: Record<Difficulty, number> = {
  foundation: 0,
  intermediate: 1,
  advanced: 2,
};

/** Return a deterministic reading order for questions within one domain. */
export function orderDomainQuestions(questions: readonly QuestionSummary[]): QuestionSummary[] {
  return [...questions].sort(
    (left, right) =>
      difficultyOrder[left.difficulty] - difficultyOrder[right.difficulty] ||
      left.title.localeCompare(right.title) ||
      left.id.localeCompare(right.id),
  );
}

export function validateQuestionGraph(questions: readonly QuestionSummary[]): void {
  if (questions.length > MAX_QUESTION_COUNT) {
    throw new RangeError(`Frontend Atlas cannot contain more than ${MAX_QUESTION_COUNT} questions`);
  }

  const byId = new Map<string, QuestionSummary>();

  for (const question of questions) {
    if (byId.has(question.id)) {
      throw new Error(`Duplicate question id: ${question.id}`);
    }

    byId.set(question.id, question);
  }

  for (const question of questions) {
    for (const relation of [...question.prerequisites, ...question.related]) {
      if (!byId.has(relation)) {
        throw new Error(`Question "${question.id}" references unknown question "${relation}"`);
      }

      if (relation === question.id) {
        throw new Error(`Question "${question.id}" cannot reference itself`);
      }
    }

    if (new Set(question.prerequisites).size !== question.prerequisites.length) {
      throw new Error(`Question "${question.id}" contains duplicate prerequisites`);
    }

    if (new Set(question.related).size !== question.related.length) {
      throw new Error(`Question "${question.id}" contains duplicate related questions`);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string): void {
    if (visiting.has(id)) {
      throw new Error(`Prerequisite cycle detected at question "${id}"`);
    }

    if (visited.has(id)) {
      return;
    }

    visiting.add(id);
    const question = byId.get(id);

    if (!question) {
      throw new Error(`Prerequisite graph references unknown question "${id}"`);
    }

    for (const prerequisite of question.prerequisites) {
      visit(prerequisite);
    }

    visiting.delete(id);
    visited.add(id);
  }

  for (const question of questions) {
    visit(question.id);
  }
}

/**
 * Normalize search text consistently at query and index time. NFKD makes
 * accented forms comparable; punctuation becomes token boundaries.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\p{M}]/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function containsPhrase(text: string, phrase: string): boolean {
  return ` ${text} `.includes(` ${phrase} `);
}

function hasEditDistanceAtMostOne(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1) {
    return false;
  }

  if (left.length === right.length) {
    const mismatches: number[] = [];

    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) {
        mismatches.push(index);
      }
    }

    if (
      mismatches.length === 2 &&
      mismatches[1] === mismatches[0] + 1 &&
      left[mismatches[0]] === right[mismatches[1]] &&
      left[mismatches[1]] === right[mismatches[0]]
    ) {
      return true;
    }
  }

  let leftIndex = 0;
  let rightIndex = 0;
  let edits = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }

    edits += 1;

    if (edits > 1) {
      return false;
    }

    if (left.length > right.length) {
      leftIndex += 1;
    } else if (right.length > left.length) {
      rightIndex += 1;
    } else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }

  if (leftIndex < left.length || rightIndex < right.length) {
    edits += 1;
  }

  return edits <= 1;
}

interface PreparedSearchDocument {
  readonly title: string;
  readonly aliases: string;
  readonly titleTokens: ReadonlySet<string>;
  readonly summaryTokens: ReadonlySet<string>;
  readonly tagTokens: ReadonlySet<string>;
  readonly aliasTokens: ReadonlySet<string>;
  readonly bodyTokens: ReadonlySet<string>;
}

const preparedSearchDocuments = new WeakMap<SearchDocument, PreparedSearchDocument>();

function tokenizeSearchField(value: string): ReadonlySet<string> {
  return new Set(normalizeSearchText(value).split(' ').filter(Boolean));
}

function prepareSearchDocument(document: SearchDocument): PreparedSearchDocument {
  const cached = preparedSearchDocuments.get(document);

  if (cached) {
    return cached;
  }

  const prepared: PreparedSearchDocument = {
    title: normalizeSearchText(document.title),
    aliases: normalizeSearchText(document.searchTerms?.join(' ') ?? ''),
    titleTokens: tokenizeSearchField(document.title),
    summaryTokens: tokenizeSearchField(document.summary),
    tagTokens: tokenizeSearchField(document.tags.join(' ')),
    aliasTokens: tokenizeSearchField(document.searchTerms?.join(' ') ?? ''),
    bodyTokens: tokenizeSearchField(document.searchableText),
  };

  preparedSearchDocuments.set(document, prepared);

  return prepared;
}

function tokenMatchScore(term: string, tokens: ReadonlySet<string>, allowTypo: boolean): number {
  if (tokens.has(term)) {
    return 1;
  }

  if (
    term.length >= 3 &&
    [...tokens].some((token) => token.startsWith(term) && token.length - term.length <= 3)
  ) {
    return 0.65;
  }

  if (allowTypo && term.length >= 5) {
    for (const token of tokens) {
      if (Math.abs(token.length - term.length) <= 1 && hasEditDistanceAtMostOne(term, token)) {
        return 0.35;
      }
    }
  }

  return 0;
}

/**
 * Rank a small static handbook index locally. Exact phrase, title, aliases,
 * tags and summary matches dominate body mentions; typo tolerance is limited
 * to important metadata fields to avoid noisy results.
 */
export function rankSearchResults(
  documents: readonly SearchDocument[],
  rawQuery: string,
  limit = 12,
): SearchDocument[] {
  const query = normalizeSearchText(rawQuery);

  if (!query) {
    return [];
  }

  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError(`Search limit must be a positive safe integer; received ${limit}`);
  }

  const terms = [...new Set(query.split(' '))];

  return documents
    .map((document, index) => {
      const prepared = prepareSearchDocument(document);
      let score = 0;
      let matchedTerms = 0;

      for (const term of terms) {
        const titleMatch = tokenMatchScore(term, prepared.titleTokens, true);
        const aliasMatch = tokenMatchScore(term, prepared.aliasTokens, true);
        const tagMatch = tokenMatchScore(term, prepared.tagTokens, true);
        const summaryMatch = tokenMatchScore(term, prepared.summaryTokens, false);
        const bodyMatch = tokenMatchScore(term, prepared.bodyTokens, false);
        const best = Math.max(
          titleMatch * 32,
          aliasMatch * 25,
          tagMatch * 21,
          summaryMatch * 10,
          bodyMatch * 2,
        );

        if (best > 0) {
          matchedTerms += 1;
          score += best;
        }
      }

      if (matchedTerms === terms.length) {
        score += 18;
      }

      if (containsPhrase(prepared.title, query)) {
        score += prepared.title === query ? 100 : 55;
      } else if (prepared.title.startsWith(query)) {
        score += 28;
      }

      if (containsPhrase(prepared.aliases, query)) {
        score += 30;
      }

      return { document, score, index, title: prepared.title };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.title.localeCompare(right.title) ||
        left.document.id.localeCompare(right.document.id) ||
        left.index - right.index,
    )
    .slice(0, limit)
    .map(({ document }) => document);
}
