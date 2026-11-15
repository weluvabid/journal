import type { CollectionEntry } from 'astro:content';

type ProjectEntry = CollectionEntry<'journal'> & {
  readonly data: CollectionEntry<'journal'>['data'] & {
    readonly kind: 'project';
    readonly projectDetails: NonNullable<CollectionEntry<'journal'>['data']['projectDetails']>;
  };
};

export function isProjectEntry(entry: CollectionEntry<'journal'>): entry is ProjectEntry {
  return entry.data.kind === 'project' && entry.data.projectDetails !== undefined;
}

export const FEATURED_PROJECT_COUNT = 6;

/** Validate the global published-project inventory used by featured sections. */
export function assertFeaturedProjectCount(projects: readonly ProjectEntry[]): void {
  if (projects.length < FEATURED_PROJECT_COUNT) {
    throw new Error(
      `Expected at least ${FEATURED_PROJECT_COUNT} published projects, found ${projects.length}`,
    );
  }
}

/** Sort any project collection or subset by its single editorial rank. */
export function rankProjects<T extends ProjectEntry>(projects: readonly T[]): T[] {
  const ranks = new Map<number, string>();

  for (const project of projects) {
    const rank = project.data.projectDetails.order;

    if (!Number.isSafeInteger(rank) || rank < 1) {
      throw new Error(`Project "${project.data.project}" has invalid rank ${rank}`);
    }

    const existing = ranks.get(rank);

    if (existing) {
      throw new Error(
        `Projects "${existing}" and "${project.data.project}" share ranking position ${rank}`,
      );
    }

    const projectId = project.data.project;

    if (!projectId) {
      throw new Error(`Project entry "${project.data.id}" is missing its project id`);
    }

    ranks.set(rank, projectId);
  }

  return [...projects].sort(
    (left, right) => left.data.projectDetails.order - right.data.projectDetails.order,
  );
}
