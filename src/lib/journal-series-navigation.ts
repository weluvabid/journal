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

    if (!series) continue;

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
 * Prefer adjacent parts within a series. At either series boundary, fall back
 * to the existing category chronology. Standalone entries retain that order.
 */
export function resolveJournalArticleNavigation<T extends JournalNavigationEntry>(
  currentId: string,
  categoryEntries: readonly T[],
  allEntries: readonly T[],
): JournalNavigationTarget<T> {
  const currentIndex = categoryEntries.findIndex((entry) => entry.data.id === currentId);

  if (currentIndex < 0) {
    throw new Error(`Journal entry "${currentId}" is missing from its category reading order`);
  }

  const current = categoryEntries[currentIndex];
  const chronologicalPrevious = categoryEntries[currentIndex - 1];
  const chronologicalNext = categoryEntries[currentIndex + 1];

  if (!current.data.series) {
    return { previous: chronologicalPrevious, next: chronologicalNext };
  }

  const seriesEntries = allEntries
    .filter((entry) => entry.data.series?.id === current.data.series?.id)
    .sort((left, right) => left.data.series!.part - right.data.series!.part);

  const seriesIndex = seriesEntries.findIndex((entry) => entry.data.id === currentId);

  if (seriesIndex < 0) {
    throw new Error(`Journal series "${current.data.series.id}" does not contain "${currentId}"`);
  }

  return {
    previous: seriesEntries[seriesIndex - 1] ?? chronologicalPrevious,
    next: seriesEntries[seriesIndex + 1] ?? chronologicalNext,
  };
}


/** Return the number of published entries belonging to a series. */
export function getJournalSeriesPartCount<T extends JournalNavigationEntry>(
  entries: readonly T[],
  seriesId: string,
): number {
  return entries.reduce((count, entry) => count + Number(entry.data.series?.id === seriesId), 0);
}
