import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { normalizeSearchText, entryHref, withBase } from '@lib/journal';

export const GET: APIRoute = async () => {
  const entries = await getCollection('journal', ({ data }) => !data.draft);
  const documents = entries.map((entry) => ({
    id: entry.data.id,
    slug: entry.data.id,
    title: entry.data.title,
    category: entry.data.category,
    summary: entry.data.summary,
    difficulty: 'intermediate',
    minutes: 5,
    tags: entry.data.tags,
    searchTerms: entry.data.searchTerms,
    prerequisites: [],
    related: [],
    featured: entry.data.featured,
    searchableText: normalizeSearchText([entry.data.title, entry.data.summary, entry.body ?? '', entry.data.category, entry.data.type, ...entry.data.tags, ...entry.data.searchTerms].join(' ')),
    href: entryHref(entry.data.id),
    kind: 'entry',
  }));
  const projects = await getCollection('projects');
  for (const project of projects) {
    documents.push({
      id: `project-${project.data.id}`,
      slug: project.data.id,
      title: project.data.title,
      category: 'projects',
      summary: project.data.summary,
      difficulty: 'intermediate',
      minutes: 0,
      tags: project.data.stack,
      searchTerms: project.data.stack,
      prerequisites: [],
      related: [],
      featured: project.data.featured,
      searchableText: normalizeSearchText([project.data.title, project.data.summary, entryBody(project.body), ...project.data.stack].join(' ')),
      href: withBase(`/projects/${project.data.id}/`),
      kind: 'project',
    });
  }
  return new Response(JSON.stringify({ version: 1, documents }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  });
};

function entryBody(body: string | undefined): string {
  return body ?? '';
}
