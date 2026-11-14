import type { JournalListEntry, JournalPageResponse, JournalEntryType } from './types.ts';

const ENTRY_TYPES: ReadonlySet<string> = new Set<JournalEntryType>([
  'engineering-note',
  'build-log',
  'deep-dive',
  'retrospective',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJournalEntry(value: unknown): value is JournalListEntry {
  if (!isRecord(value)) {
    return false;
  }

  const series = value.series;
  const validSeries =
    series === undefined ||
    (isRecord(series) &&
      Number.isSafeInteger(series.part) &&
      Number.isSafeInteger(series.totalParts) &&
      Number(series.part) > 0 &&
      Number(series.totalParts) >= Number(series.part));

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.type === 'string' &&
    ENTRY_TYPES.has(value.type) &&
    typeof value.date === 'string' &&
    typeof value.dateLabel === 'string' &&
    typeof value.href === 'string' &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string') &&
    validSeries
  );
}

export function isJournalPageResponse(value: unknown): value is JournalPageResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    (value.nextPageUrl === null || typeof value.nextPageUrl === 'string') &&
    value.items.every(isJournalEntry)
  );
}

export interface PageIntegrityInput {
  readonly items: readonly JournalListEntry[];
  readonly nextPageUrl: string | null;
  readonly pageSize: number;
  readonly seenIds: ReadonlySet<string>;
  readonly requestedPageUrls: ReadonlySet<string>;
  readonly requestUrl: URL;
  readonly followingPageUrl: URL | null;
  readonly currentOrigin: string;
}

/** Validate page invariants without mutating pagination state. */
export function assertJournalPageIntegrity(input: PageIntegrityInput): void {
  const {
    items,
    nextPageUrl,
    pageSize,
    seenIds,
    requestedPageUrls,
    requestUrl,
    followingPageUrl,
    currentOrigin,
  } = input;

  if (requestUrl.origin !== currentOrigin) {
    throw new TypeError('Journal pagination returned a cross-origin request URL.');
  }

  if (requestedPageUrls.has(requestUrl.href)) {
    throw new Error(`Journal pagination attempted to revisit ${requestUrl.pathname}.`);
  }

  if (items.length > pageSize) {
    throw new RangeError(`Journal pagination returned more than ${pageSize} entries in one page.`);
  }

  if (followingPageUrl && followingPageUrl.origin !== currentOrigin) {
    throw new TypeError('Journal pagination returned a cross-origin next-page URL.');
  }

  if (
    followingPageUrl &&
    (followingPageUrl.href === requestUrl.href || requestedPageUrls.has(followingPageUrl.href))
  ) {
    throw new Error(`Journal pagination contains a cycle at ${followingPageUrl.pathname}.`);
  }

  const pageIds = new Set<string>();

  for (const entry of items) {
    if (pageIds.has(entry.id) || seenIds.has(entry.id)) {
      throw new Error(`Journal pagination returned duplicate entry id: ${entry.id}`);
    }

    pageIds.add(entry.id);
  }

  if (items.length === 0 && nextPageUrl !== null) {
    throw new Error('Journal pagination returned an empty page with more pages remaining.');
  }
}
