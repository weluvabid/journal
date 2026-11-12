export function withBase(path: string, baseUrl = import.meta.env?.BASE_URL ?? '/'): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(path)) {
    return path;
  }

  const base = baseUrl.replace(/\/+$/u, '');
  const pathname = `/${path.replace(/^\/+/, '')}`;

  return `${base}${pathname}` || '/';
}

export function entryHref(id: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
    throw new TypeError(`Invalid journal entry id: ${id}`);
  }

  return withBase(`/journal/${id}/`);
}
