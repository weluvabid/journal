import type { JournalEntrySource, JournalListEntry } from './types.ts';

/** Convert a content-collection entry into the stable, client-facing list shape. */
export function serializeJournalEntry(
  entry: JournalEntrySource,
  href: string,
  totalSeriesParts?: number,
): JournalListEntry {
  const { data } = entry;

  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    type: data.type,
    date: data.date.toISOString(),
    dateLabel: data.date.toLocaleDateString('en', { dateStyle: 'medium', timeZone: 'UTC' }),
    tags: data.tags,
    ...(data.series && totalSeriesParts !== undefined
      ? { series: { part: data.series.part, totalParts: totalSeriesParts } }
      : {}),
    href,
  };
}

export function serializeJournalEntries<T extends JournalEntrySource>(
  entries: readonly T[],
  hrefFor: (entry: T) => string,
  seriesPartCountFor: (seriesId: string) => number,
): JournalListEntry[] {
  return entries.map((entry) =>
    serializeJournalEntry(
      entry,
      hrefFor(entry),
      entry.data.series ? seriesPartCountFor(entry.data.series.id) : undefined,
    ),
  );
}
