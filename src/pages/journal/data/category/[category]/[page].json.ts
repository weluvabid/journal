import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { categoryById } from '@data/categories';
import { entryHref, withBase } from '@lib/journal';
import { JOURNAL_PAGE_SIZE, paginateItems } from '@lib/journal-pagination';

export async function getStaticPaths() {
  const allEntries = await getCollection('journal', ({ data }) => !data.draft);
  const paths = [];

  for (const category of categoryById.values()) {
    const entries = allEntries
      .filter((entry) => entry.data.category === category.id)
      .sort(
        (left, right) =>
          right.data.date.valueOf() - left.data.date.valueOf() ||
          left.data.id.localeCompare(right.data.id),
      );
    const pageCount = Math.ceil(entries.length / JOURNAL_PAGE_SIZE);

    for (let page = 2; page <= pageCount; page += 1) {
      const { items: pageEntries, nextPage } = paginateItems(entries, page);
      const items = pageEntries.map((entry) => ({
        id: entry.data.id,
        title: entry.data.title,
        summary: entry.data.summary,
        type: entry.data.type,
        date: entry.data.date.toISOString(),
        dateLabel: entry.data.date.toLocaleDateString('en', { dateStyle: 'medium', timeZone: 'UTC' }),
        tags: entry.data.tags,
        href: entryHref(entry.data.id),
      }));

      paths.push({
        params: { category: category.id, page: String(page) },
        props: {
          items,
          nextPageUrl:
            nextPage === null
              ? null
              : withBase(`/journal/data/category/${category.id}/${nextPage}.json`),
        },
      });
    }
  }

  return paths;
}

export const GET: APIRoute = ({ props }) => {
  return new Response(JSON.stringify(props), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
