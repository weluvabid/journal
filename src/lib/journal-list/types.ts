export type JournalEntryType =
  | 'engineering-note'
  | 'build-log'
  | 'deep-dive'
  | 'retrospective';

export interface JournalListEntry {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly type: JournalEntryType;
  readonly date: string;
  readonly dateLabel: string;
  readonly tags: readonly string[];
  readonly series?: { readonly part: number; readonly totalParts: number };
  readonly href: string;
}

export interface JournalPageResponse {
  readonly items: readonly JournalListEntry[];
  readonly nextPageUrl: string | null;
}

export interface JournalEntrySource {
  readonly data: {
    readonly id: string;
    readonly title: string;
    readonly summary: string;
    readonly type: JournalEntryType;
    readonly date: Date;
    readonly tags: readonly string[];
    readonly series?: { readonly id: string; readonly part: number };
  };
}
