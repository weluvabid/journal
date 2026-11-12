import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { entryHref, withBase } from '@lib/journal';
import { groupEntriesByTag } from '@lib/journal-tags';
import { JOURNAL_PAGE_SIZE, paginateItems } from '@lib/journal-pagination';

export async function getStaticPaths() {
  const entries = (await getCollection('journal', ({ data }) => !data.draft)).sort(
    (left, right) =>
      right.data.date.valueOf() - left.data.date.valueOf() ||
      left.data.id.localeCompare(right.data.id),
  );
  const paths = [];

  for (const [tag, group] of groupEntriesByTag(entries)) {
    const pageCount = Math.ceil(group.entries.length / JOURNAL_PAGE_SIZE);

    for (let page = 2; page <= pageCount; page += 1) {
      const { items: pageEntries, nextPage } = paginateItems(group.entries, page);
      const items = pageEntries.map((entry) => ({
        id: entry.data.id,
        title: entry.data.title,
        summary: entry.data.summary,
        type: entry.data.type,
        date: entry.data.date.toISOString(),
        dateLabel: entry.data.date.toLocaleDateString('en', {
          dateStyle: 'medium',
          timeZone: 'UTC',
        }),
        tags: entry.data.tags,
        href: entryHref(entry.data.id),
      }));

      paths.push({
        params: { tag, page: String(page) },
        props: {
          items,
          nextPageUrl:
            nextPage === null ? null : withBase(`/journal/data/tag/${tag}/${nextPage}.json`),
        },
      });
    }
  }

  return paths;
}

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(props), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
