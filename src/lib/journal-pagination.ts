export const JOURNAL_PAGE_SIZE = 8;

export interface PaginatedItems<T> {
  readonly items: T[];
  readonly nextPage: number | null;
}

/** Slice a stable, pre-sorted collection into one-based pages. */
export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize = JOURNAL_PAGE_SIZE,
): PaginatedItems<T> {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new RangeError(`Page must be a positive safe integer; received ${page}`);
  }

  if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`Page size must be a positive safe integer; received ${pageSize}`);
  }

  const start = (page - 1) * pageSize;
  if (!Number.isSafeInteger(start)) {
    throw new RangeError(`Page offset exceeds the safe integer range; received ${page}`);
  }

  const pageItems = items.slice(start, start + pageSize);
  const nextPage = start + pageSize < items.length ? page + 1 : null;

  return { items: pageItems, nextPage };
}
