import type { APIRoute } from 'astro';
import type { SearchDocument } from '@lib/search/types';
import { getCollection } from 'astro:content';
import { entryHref } from '@lib/journal';
import { normalizeSearchText } from '@lib/search/ranking';
import { stringArray } from '@lib/search/arrays';
import { INTENTS } from '@lib/content-text';

export const GET: APIRoute = async () => {
  const entries = await getCollection('journal', ({ data }) => !data.draft);
  const documents: SearchDocument[] = entries.map((entry) => {
    const tags = stringArray(entry.data.tags);
    const searchTerms = stringArray(entry.data.searchTerms);

    return {
      id: entry.data.id,
      title: entry.data.title,
      summary: entry.data.summary,
      tags,
      searchTerms,
      searchableText: normalizeSearchText(
        [
          entry.data.title,
          entry.data.summary,
          entry.body ?? '',
          entry.data.category,
          entry.data.type,
          ...tags,
          ...searchTerms,
          ...(entry.data.projectDetails?.stack ?? []),
        ].join(' '),
      ),
      href: entryHref(entry.data.id),
      kind: entry.data.kind === 'project' ? INTENTS.project : INTENTS.entry,
    };
  });

  return new Response(JSON.stringify({ version: 2, documents }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
