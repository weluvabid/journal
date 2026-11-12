export interface SearchDocument {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly searchTerms: readonly string[];
  readonly searchableText: string;
  readonly href: string;
  readonly kind: 'entry' | 'project';
}
