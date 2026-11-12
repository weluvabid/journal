import type { SearchDocument } from '../journal.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
function isSearchTermArray(value: unknown): value is string[] {
  return isStringArray(value) && value.length <= 12 && value.every((term) => term.length >= 2 && term.length <= 80);
}
export function isSearchDocument(value: unknown): value is SearchDocument {
  return isRecord(value) &&
    typeof value.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value.id) &&
    typeof value.slug === 'string' && typeof value.title === 'string' &&
    typeof value.summary === 'string' && typeof value.category === 'string' &&
    typeof value.difficulty === 'string' && typeof value.minutes === 'number' &&
    Number.isSafeInteger(value.minutes) && isStringArray(value.tags) &&
    isSearchTermArray(value.searchTerms) && isStringArray(value.prerequisites) &&
    isStringArray(value.related) && typeof value.featured === 'boolean' &&
    typeof value.searchableText === 'string' &&
    (value.href === undefined || typeof value.href === 'string') &&
    (value.kind === undefined || value.kind === 'entry' || value.kind === 'project');
}
export function parseSearchIndex(input: unknown): SearchDocument[] {
  if (!isRecord(input) || input.version !== 1 || !Array.isArray(input.documents)) {
    throw new TypeError('Search index has an unsupported or invalid format');
  }
  return input.documents.map((document) => {
    if (!isSearchDocument(document)) throw new TypeError('Search index contains an invalid document');
    return document;
  });
}
