import { parseSearchIndex } from './validation.ts';
import { withBase } from '../journal.ts';
import type { SearchDocument } from './types.ts';

// Cache the parsed corpus and the in-flight load. WeakMap keeps injected fetchers
// used by tests isolated without retaining them after the caller releases them.
const searchIndexCache = new WeakMap<typeof fetch, Promise<SearchDocument[]>>();

export function loadSearchIndex(fetcher: typeof fetch = fetch): Promise<SearchDocument[]> {
  const cached = searchIndexCache.get(fetcher);

  if (cached) {
    return cached;
  }

  const request = (async (): Promise<SearchDocument[]> => {
    const response = await fetcher(withBase('/search-index.v2.json'));

    if (!response.ok) {
      throw new Error(`Search index request failed with HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();

    return parseSearchIndex(payload);
  })();

  searchIndexCache.set(fetcher, request);

  void request.catch(() => {
    // A transient network or validation failure must not poison the cache.
    if (searchIndexCache.get(fetcher) === request) {
      searchIndexCache.delete(fetcher);
    }
  });

  return request;
}
