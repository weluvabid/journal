import { isJournalPageResponse, assertJournalPageIntegrity } from './pagination-validation.ts';
import type { JournalPageResponse } from './types.ts';

export interface FetchJournalPageOptions {
  readonly pageUrl: string;
  readonly currentUrl: string;
  readonly currentOrigin: string;
  readonly pageSize: number;
  readonly seenIds: ReadonlySet<string>;
  readonly requestedPageUrls: ReadonlySet<string>;
  readonly signal: AbortSignal;
  readonly fetcher?: typeof fetch;
}

export interface FetchedJournalPage {
  readonly response: JournalPageResponse;
  readonly requestUrl: URL;
}

/** Fetch and validate one page. State mutation remains the caller's responsibility. */
export async function fetchJournalPage(options: FetchJournalPageOptions): Promise<FetchedJournalPage> {
  const { pageUrl, currentUrl, currentOrigin, pageSize, seenIds, requestedPageUrls, signal } = options;
  const requestUrl = new URL(pageUrl, currentUrl);
  const fetcher = options.fetcher ?? fetch;

  if (requestUrl.origin !== currentOrigin) {
    throw new TypeError('Journal pagination returned a cross-origin request URL.');
  }
  if (requestedPageUrls.has(requestUrl.href)) {
    throw new Error(`Journal pagination attempted to revisit ${requestUrl.pathname}.`);
  }

  const response = await fetcher(requestUrl, {
    headers: { Accept: 'application/json' },
    cache: 'default',
    signal,
  });
  if (!response.ok) throw new Error(`Journal pagination request failed (${response.status}).`);

  const payload: unknown = await response.json();
  if (!isJournalPageResponse(payload)) {
    throw new TypeError('Journal pagination returned an invalid response.');
  }

  const followingPageUrl =
    payload.nextPageUrl === null ? null : new URL(payload.nextPageUrl, currentUrl);
  assertJournalPageIntegrity({
    items: payload.items,
    nextPageUrl: payload.nextPageUrl,
    pageSize,
    seenIds,
    requestedPageUrls,
    requestUrl,
    followingPageUrl,
    currentOrigin,
  });

  return { response: payload, requestUrl };
}
