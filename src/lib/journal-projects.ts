import type { CollectionEntry } from 'astro:content';

type JournalEntry = CollectionEntry<'journal'>;

/**
 * Validate project relationships against the complete collection, not a
 * pre-filtered published subset. This distinguishes a genuinely missing
 * project from a canonical project article that exists but is still a draft.
 */
export function assertProjectAssociations(
  allEntries: readonly JournalEntry[],
  publishedEntries: readonly JournalEntry[] = allEntries.filter((entry) => !entry.data.draft),
): void {
  const canonical = new Map<string, JournalEntry>();

  for (const entry of allEntries) {
    if (entry.data.kind !== 'project') {
      continue;
    }

    const projectId = entry.data.project;

    if (!projectId || !entry.data.projectDetails) {
      throw new Error(
        `Canonical project article "${entry.data.id}" is missing its project id or projectDetails`,
      );
    }

    const existing = canonical.get(projectId);

    if (existing) {
      throw new Error(
        `Project "${projectId}" has multiple canonical articles: "${existing.data.id}" and "${entry.data.id}"`,
      );
    }

    canonical.set(projectId, entry);
  }

  for (const entry of publishedEntries) {
    const projectId = entry.data.project;

    if (!projectId) {
      continue;
    }

    const projectEntry = canonical.get(projectId);

    if (!projectEntry) {
      const candidates = allEntries
        .filter((candidate) => candidate.data.project === projectId)
        .map((candidate) => candidate.data.id);

      throw new Error(
        `Journal entry "${entry.data.id}" references missing project "${projectId}". ${
          candidates.length
            ? `Matching entries exist but none is canonical (kind: "project"): ${candidates.join(', ')}.`
            : 'No journal entry declares this project id.'
        }`,
      );
    }

    if (projectEntry.data.draft) {
      throw new Error(
        `Published journal entry "${entry.data.id}" references unpublished project "${projectId}" ` +
          `("${projectEntry.data.id}" is marked draft).`,
      );
    }
  }
}
