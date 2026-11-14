export interface JournalNavigationEntry {
  readonly data: {
    readonly id: string;
    readonly title: string;
  };
}

export type JournalNavigationContext =
  | { readonly type: 'all' }
  | { readonly type: 'category'; readonly categoryId: string };

export interface JournalNavigationTarget<T extends JournalNavigationEntry> {
  readonly previous: T | undefined;
  readonly next: T | undefined;
}

/** Resolve the reading context encoded by an archive link. Invalid contexts fail closed to All. */
export function parseJournalNavigationContext(
  search: string,
  currentCategoryId: string,
): JournalNavigationContext {
  const params = new URLSearchParams(search);
  const value = params.get('context');

  if (value === `category:${currentCategoryId}`) {
    return { type: 'category', categoryId: currentCategoryId };
  }

  return { type: 'all' };
}

/** Previous/Next always follows the supplied sequence; series metadata is deliberately ignored. */
export function resolveJournalNavigation<T extends JournalNavigationEntry>(
  currentId: string,
  entries: readonly T[],
): JournalNavigationTarget<T> {
  const currentIndex = entries.findIndex((entry) => entry.data.id === currentId);

  if (currentIndex < 0) {
    throw new Error(`Journal entry "${currentId}" is missing from its navigation sequence`);
  }

  return {
    previous: entries[currentIndex - 1],
    next: entries[currentIndex + 1],
  };
}
