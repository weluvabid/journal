import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { entryHref, withBase } from '@lib/journal';
import { serializeJournalEntries } from '@lib/journal-list/serialize-entry';
import { JOURNAL_PAGE_SIZE, paginateItems } from '@lib/journal-pagination';
import {
  getJournalSeriesPartCount,
  sortJournalEntriesWithSeriesGroups,
} from '@lib/journal-series-navigation';

export async function getStaticPaths() {
  const entries = sortJournalEntriesWithSeriesGroups(
    await getCollection('journal', ({ data }) => !data.draft),
  );
  const pageCount = Math.ceil(entries.length / JOURNAL_PAGE_SIZE);

  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => {
    const page = index + 2;
    const { items: pageEntries, nextPage } = paginateItems(entries, page);
    const items = serializeJournalEntries(
      pageEntries,
      (entry) => entryHref(entry.data.id, 'all'),
      (seriesId) => getJournalSeriesPartCount(entries, seriesId),
    );

    return {
      params: { page: String(page) },
      props: {
        items,
        nextPageUrl: nextPage === null ? null : withBase(`/journal/data/all/${nextPage}.json`),
      },
    };
  });
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
