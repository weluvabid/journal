# Content architecture

## Journal entries and projects

All editorial and project content lives in `src/content/journal/`. There is one validated content collection and one source of truth.

Every entry has a `kind`:

- `article` is a journal entry.
- `project` is the canonical project article and carries the complete `projectDetails` record: status, stack, repository/demo links, curated repository resources, featured state and display order.

The optional `project` ID associates related engineering notes with that canonical project article. Related entries link back to the canonical project article; they do not repeat its metadata. A canonical project article carries the `project` tag, so it is discoverable through the ordinary Journal tag archive. Subject categories remain topical classifications, not project/non-project flags.

The Projects archive and homepage project cards are generated from published entries where `kind: project`. The project resource section is rendered at the end of that same article. There is no separately maintained project description or project content collection. Legacy `/projects/<id>/` URLs redirect to the canonical `/journal/<id>/` article.

Journal IDs are stable kebab-case values used for public routes. Draft entries are excluded from public routes, listing data and search.

## Categories and tags

`src/data/categories.ts` is the single category registry. It supplies human-readable labels, descriptions and stable IDs to the homepage, category selector and category archive routes. The content schema constrains journal category values to the supported IDs.

Tags belong to the Journal collection and share one canonical route model under `/journal/tag/<slug>/`. The `project` tag identifies canonical project articles.

## Search

The generated `/search-index.v2.json` contains only the fields consumed by the client search UI: ID, title, summary, tags, search terms, searchable text, destination URL and document kind. Project articles are indexed once, as project documents, rather than duplicated as a second collection. Its payload is versioned and strictly validated before ranking. Search ranking and validation live in `src/lib/search/`.
