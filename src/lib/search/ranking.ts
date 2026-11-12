import type { SearchDocument } from './types.ts';

export function normalizeSearchText(value: string): string {
  return value.normalize('NFKD').replace(/[\p{M}]/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/gu, ' ');
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
    aliases: normalizeSearchText(document.searchTerms.join(' ')),
    titleTokens: tokenizeSearchField(document.title),
    summaryTokens: tokenizeSearchField(document.summary),
    tagTokens: tokenizeSearchField(document.tags.join(' ')),
    aliasTokens: tokenizeSearchField(document.searchTerms.join(' ')),
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
 * Rank the static Journal search index locally. Exact phrase, title, aliases,
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
