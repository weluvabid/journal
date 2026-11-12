import type { SearchDocument } from './types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isSearchDocument(value: unknown): value is SearchDocument {
  return (
    isRecord(value) &&
    Object.keys(value).length === 8 &&
    Object.keys(value).every((key) =>
      ['id', 'title', 'summary', 'tags', 'searchTerms', 'searchableText', 'href', 'kind'].includes(
        key,
      ),
    ) &&
    typeof value.id === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value.id) &&
    typeof value.title === 'string' &&
    value.title.length > 0 &&
    typeof value.summary === 'string' &&
    isStringArray(value.tags) &&
    isStringArray(value.searchTerms) &&
    value.searchTerms.length <= 12 &&
    value.searchTerms.every((term) => term.length >= 2 && term.length <= 80) &&
    typeof value.searchableText === 'string' &&
    typeof value.href === 'string' &&
    value.href.startsWith('/') &&
    !value.href.startsWith('//') &&
    (value.kind === 'entry' || value.kind === 'project')
  );
}

export function parseSearchIndex(input: unknown): SearchDocument[] {
  if (!isRecord(input) || input.version !== 2 || !Array.isArray(input.documents)) {
    throw new TypeError('Search index has an unsupported or invalid format');
  }

  return input.documents.map((document) => {
    if (!isSearchDocument(document)) {
      throw new TypeError('Search index contains an invalid document');
    }

    return document;
  });
}
