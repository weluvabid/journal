/** Build a category archive URL using the configured Astro base path. */
export function categoryHref(value: string, base = '/'): string {
  const normalizedBase = base.replace(/^\/+|\/+$/gu, '');
  const prefix = normalizedBase ? `/${normalizedBase}` : '';

  return value === 'all'
    ? `${prefix}/journal/`
    : `${prefix}/journal/category/${encodeURIComponent(value)}/`;
}
