import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { withBase, entryHref } from '@lib/journal';
import { normalizeSearchText } from '@lib/search/ranking';
import { stringArray } from '@lib/search/arrays';

export const GET: APIRoute = async () => {
  const entries = await getCollection('journal', ({ data }) => !data.draft);
  const documents = entries.map((entry) => {
    const tags = stringArray(entry.data.tags);
    const searchTerms = stringArray(entry.data.searchTerms);

    return {
      id: entry.data.id,
      title: entry.data.title,
      summary: entry.data.summary,
      tags,
      searchTerms,
      searchableText: normalizeSearchText([
        entry.data.title,
        entry.data.summary,
        entry.body ?? '',
        entry.data.category,
        entry.data.type,
        ...tags,
        ...searchTerms,
      ].join(' ')),
      href: entryHref(entry.data.id),
      kind: 'entry' as const,
    };
  });

  const projects = await getCollection('projects');
  for (const project of projects) {
    const tags = stringArray(project.data.tags);
    const stack = stringArray(project.data.stack);
    documents.push({
      id: `project-${project.data.id}`,
      title: project.data.title,
      summary: project.data.summary,
      tags,
      searchTerms: [...stack, ...tags].slice(0, 12),
      searchableText: normalizeSearchText([
        project.data.title,
        project.data.summary,
        project.body ?? '',
        ...stack,
        ...tags,
      ].join(' ')),
      href: withBase(`/projects/${project.data.id}/`),
      kind: 'project' as const,
    });
  }

  return new Response(JSON.stringify({ version: 2, documents }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
