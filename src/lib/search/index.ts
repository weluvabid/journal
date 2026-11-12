import { parseSearchIndex } from './validation.ts';
import { withBase } from '../journal.ts';
import type { SearchDocument } from './types.ts';

export async function loadSearchIndex(
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<SearchDocument[]> {
  const response = await fetcher(withBase('/search-index.v2.json'), { signal });

  if (!response.ok) {
    throw new Error(`Search index request failed with HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();

  return parseSearchIndex(payload);
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
