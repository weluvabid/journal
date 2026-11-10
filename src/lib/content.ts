import type { CollectionEntry } from 'astro:content';
import type { QuestionSummary } from '@lib/atlas';
import { validateQuestionGraph } from '@lib/atlas';

export type QuestionEntry = CollectionEntry<'questions'>;

export function toQuestionSummary(entry: QuestionEntry): QuestionSummary {
  return {
    id: entry.data.id,
    slug: entry.data.id,
    title: entry.data.title,
    domain: entry.data.domain,
    summary: entry.data.summary,
    difficulty: entry.data.difficulty,
    minutes: entry.data.minutes,
    tags: entry.data.tags,
    searchTerms: entry.data.searchTerms,
    prerequisites: entry.data.prerequisites,
    related: entry.data.related,
    featured: entry.data.featured,
  };
}

export function assertValidQuestionGraph(entries: readonly QuestionEntry[]): QuestionSummary[] {
  const summaries = entries.map(toQuestionSummary);

  validateQuestionGraph(summaries);

  return summaries;
}
