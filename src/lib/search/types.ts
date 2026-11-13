import { INTENTS } from '@lib/content-text';

export interface SearchDocument {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly searchTerms: readonly string[];
  readonly searchableText: string;
  readonly href: string;
  readonly kind: typeof INTENTS.entry | typeof INTENTS.project;
}
