import { withBase } from './journal.ts';

const TAG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/** Convert a display tag into its stable, URL-safe archive identifier. */
export function tagToSlug(tag: string): string {
  const slug = tag
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');

  if (!slug || !TAG_SLUG_PATTERN.test(slug)) {
    throw new TypeError(`Invalid tag: ${tag}`);
  }

  return slug;
}

export type TagCollection = 'journal' | 'projects';

export function tagHref(tag: string, collection: TagCollection = 'journal'): string {
  const basePath = collection === 'projects' ? '/projects' : '/journal';
  return withBase(`${basePath}/tag/${tagToSlug(tag)}/`);
}

export function projectTagHref(tag: string): string {
  return tagHref(tag, 'projects');
}

/** Build deterministic tag groups and fail on ambiguous slug collisions. */
export function groupContentByTag<T extends { readonly data: { readonly tags: readonly string[] } }>(
  entries: readonly T[],
  collection: TagCollection = 'journal',
): Map<string, { readonly label: string; readonly entries: T[] }> {
  const groups = new Map<string, { label: string; entries: T[] }>();

  for (const entry of entries) {
    const seenForEntry = new Set<string>();

    for (const label of entry.data.tags) {
      const slug = tagToSlug(label);
      if (seenForEntry.has(slug)) continue;
      seenForEntry.add(slug);

      const existing = groups.get(slug);

      if (existing && existing.label !== label) {
        throw new Error(`${collection === 'projects' ? 'Project' : 'Journal'} tags "${existing.label}" and "${label}" produce the same URL slug: ${slug}`);
      }

      if (existing) {
        existing.entries.push(entry);
      } else {
        groups.set(slug, { label, entries: [entry] });
      }
    }
  }

  return new Map([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

/** Backwards-compatible journal grouping helper. */
export function groupEntriesByTag<T extends { readonly data: { readonly tags: readonly string[] } }>(
  entries: readonly T[],
): Map<string, { readonly label: string; readonly entries: T[] }> {
  return groupContentByTag(entries, 'journal');
}

export function groupProjectsByTag<T extends { readonly data: { readonly tags: readonly string[] } }>(
  projects: readonly T[],
): Map<string, { readonly label: string; readonly entries: T[] }> {
  return groupContentByTag(projects, 'projects');
}
