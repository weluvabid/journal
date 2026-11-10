import {
  DOMAIN_IDS,
  validateQuestionGraph,
  type DomainId,
  type Difficulty,
  type SearchDocument,
} from '../atlas.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isSearchTermArray(value: unknown): value is string[] {
  return (
    isStringArray(value) &&
    value.length <= 12 &&
    value.every((term) => term.length >= 2 && term.length <= 80)
  );
}

function isDomainId(value: unknown): value is DomainId {
  return typeof value === 'string' && (DOMAIN_IDS as readonly string[]).includes(value);
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'foundation' || value === 'intermediate' || value === 'advanced';
}

export function isSearchDocument(value: unknown): value is SearchDocument {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value.id) &&
    typeof value.slug === 'string' &&
    value.slug.length > 0 &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    isDomainId(value.domain) &&
    isDifficulty(value.difficulty) &&
    typeof value.minutes === 'number' &&
    Number.isSafeInteger(value.minutes) &&
    isStringArray(value.tags) &&
    (value.searchTerms === undefined || isSearchTermArray(value.searchTerms)) &&
    isStringArray(value.prerequisites) &&
    isStringArray(value.related) &&
    typeof value.featured === 'boolean' &&
    typeof value.searchableText === 'string'
  );
}

export function parseSearchIndex(input: unknown): SearchDocument[] {
  if (!isRecord(input) || input.version !== 1 || !Array.isArray(input.documents)) {
    throw new TypeError('Search index has an unsupported or invalid format');
  }

  const documents = input.documents.map((document) => {
    if (!isSearchDocument(document)) {
      throw new TypeError('Search index contains an invalid question document');
    }

    return document;
  });

  validateQuestionGraph(documents);

  return documents;
}
