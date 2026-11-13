export const INTENTS = {
  project: 'project',
  entry: 'entry',
  category: 'category',
  tag: 'tag',
  result: 'result',
  matchingEntry: 'matching entry',
} as const;

export type Intent = (typeof INTENTS)[keyof typeof INTENTS];

const CONTENT_LABELS: Record<Intent, readonly [singular: string, plural: string]> = {
  [INTENTS.project]: ['project', 'projects'],
  [INTENTS.entry]: ['entry', 'entries'],
  [INTENTS.category]: ['category', 'categories'],
  [INTENTS.tag]: ['tag', 'tags'],
  [INTENTS.result]: ['result', 'results'],
  [INTENTS.matchingEntry]: ['matching entry', 'matching entries'],
};

export function pluralize(count: number, intent: Intent): string {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Count must be a non-negative safe integer');
  }

  const [singular, plural] = CONTENT_LABELS[intent];

  return `${count} ${count === 1 ? singular : plural}`;
}
