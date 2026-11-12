/**
 * Content collection defaults are applied during schema parsing, but dev-server
 * collection caches can briefly expose older frontmatter shapes after schema
 * changes. Keep optional metadata arrays safe at the search-index boundary.
 */
export function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}
