import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { assertValidQuestionGraph } from '@lib/content';

export const GET: APIRoute = async () => {
  const entries = await getCollection('questions');
  const summaries = assertValidQuestionGraph(entries);
  const byId = new Map(summaries.map((question) => [question.id, question]));
  const documents = entries.map((entry) => {
    const question = byId.get(entry.data.id);

    if (!question) {
      throw new Error(`Validated question ${entry.data.id} disappeared from the index`);
    }

    return {
      ...question,
      searchableText: entry.body,
    };
  });

  return new Response(JSON.stringify({ version: 1, documents }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
