export interface JournalSeriesMetadata {
  readonly id: string;
  readonly part: number;
}

export interface JournalSeriesEntry {
  readonly data: {
    readonly series?: JournalSeriesMetadata;
  };
}

/** Reject duplicate part numbers within a series while allowing gaps for drafts. */
export function assertUniqueSeriesParts<T extends JournalSeriesEntry & { readonly data: { readonly id: string } }>(
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

/** Return the number of published entries belonging to a series. */
export function getJournalSeriesPartCount<T extends JournalSeriesEntry>(
  entries: readonly T[],
  seriesId: string,
): number {
  return entries.reduce((count, entry) => count + Number(entry.data.series?.id === seriesId), 0);
}

/** Return published entries in explicit series-part order. */
export function getJournalSeriesEntries<T extends JournalSeriesEntry>(
  entries: readonly T[],
  seriesId: string,
): T[] {
  return entries
    .filter((entry) => entry.data.series?.id === seriesId)
    .slice()
    .sort((left, right) => left.data.series!.part - right.data.series!.part);
}

export interface JournalSeriesSortableEntry extends JournalSeriesEntry {
  readonly data: {
    readonly id: string;
    readonly date: Date;
    readonly series?: JournalSeriesMetadata;
  };
}

/**
 * Sort standalone articles and series as top-level groups, then flatten them.
 * A series group is positioned using its earliest published part (normally part 1)
 * and its members are always ordered by their explicit part number.
 */
export function sortJournalEntriesWithSeriesGroups<T extends JournalSeriesSortableEntry>(
  entries: readonly T[],
): T[] {
  interface Group {
    readonly entries: T[];
  }

  const groupsByKey = new Map<string, Group>();

  for (const entry of entries) {
    const seriesId = entry.data.series?.id;
    const key = seriesId === undefined ? `entry:${entry.data.id}` : `series:${seriesId}`;
    const existing = groupsByKey.get(key);

    if (existing) {
      existing.entries.push(entry);
    } else {
      groupsByKey.set(key, { entries: [entry] });
    }
  }

  const groups = [...groupsByKey.values()];

  for (const group of groups) {
    if (group.entries.length > 1) {
      group.entries.sort(
        (left, right) =>
          left.data.series!.part - right.data.series!.part ||
          left.data.id.localeCompare(right.data.id),
      );
    }
  }

  groups.sort(
    (left, right) =>
      right.entries[0].data.date.valueOf() - left.entries[0].data.date.valueOf() ||
      left.entries[0].data.id.localeCompare(right.entries[0].data.id),
  );

  return groups.flatMap((group) => group.entries);
}
