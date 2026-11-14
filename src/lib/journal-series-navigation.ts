export interface JournalSeriesMetadata {
  readonly id: string;
  readonly part: number;
}

export interface JournalNavigationEntry {
  readonly data: {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly series?: JournalSeriesMetadata;
  };
}

export interface JournalNavigationTarget<T extends JournalNavigationEntry> {
  readonly previous: T | undefined;
  readonly next: T | undefined;
}

/**
 * Reject ambiguous series ordering before generating article navigation.
 * Part numbers may have gaps (for example, unpublished drafts), but must be unique.
 */
export function assertUniqueSeriesParts<T extends JournalNavigationEntry>(
  entries: readonly T[],
): void {
  const partsBySeries = new Map<string, Map<number, string>>();

  for (const entry of entries) {
    const series = entry.data.series;

    if (!series) {
      continue;
    }

    let parts = partsBySeries.get(series.id);

    if (!parts) {
      parts = new Map<number, string>();

      partsBySeries.set(series.id, parts);
    }

    const existingId = parts.get(series.part);

    if (existingId) {
      throw new Error(
        `Duplicate part ${series.part} in journal series "${series.id}": "${existingId}" and "${entry.data.id}"`,
      );
    }

    parts.set(series.part, entry.data.id);
  }
}

/**
 * Resolve previous and next entries using the category's chronological order.
 * Series ordering is handled separately by the article-level series index.
 */
export function resolveJournalArticleNavigation<T extends JournalNavigationEntry>(
  currentId: string,
  categoryEntries: readonly T[],
): JournalNavigationTarget<T> {
  const currentIndex = categoryEntries.findIndex((entry) => entry.data.id === currentId);

  if (currentIndex < 0) {
    throw new Error(`Journal entry "${currentId}" is missing from its category reading order`);
  }

  return {
    previous: categoryEntries[currentIndex - 1],
    next: categoryEntries[currentIndex + 1],
  };
}

/** Return the number of published entries belonging to a series. */
export function getJournalSeriesPartCount<T extends JournalNavigationEntry>(
  entries: readonly T[],
  seriesId: string,
): number {
  return entries.reduce((count, entry) => count + Number(entry.data.series?.id === seriesId), 0);
}

/** Return published entries in explicit series-part order. */
export function getJournalSeriesEntries<T extends JournalNavigationEntry>(
  entries: readonly T[],
  seriesId: string,
): T[] {
  return entries
    .filter((entry) => entry.data.series?.id === seriesId)
    .slice()
    .sort((left, right) => left.data.series!.part - right.data.series!.part);
}
