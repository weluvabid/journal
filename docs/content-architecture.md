# Content architecture

The content is the product. The site around it should make the material easy to find and read, not
turn writing a new article into a migration project.

## Where questions live

Articles are MDX files under:

```text
src/content/questions/<domain>/<question>.mdx
```

The eight domain directories are:

- `javascript-typescript`
- `browser-web-platform`
- `css-rendering`
- `frameworks-ui-architecture`
- `ui-engineering`
- `performance-reliability`
- `frontend-system-design`
- `accessibility-security-testing`

Astro's Content Collections load the files through the `glob` loader. `src/content.config.ts` owns
the schema.

## Frontmatter contract

Every question has:

| Field           | Rule                                                    |
| --------------- | ------------------------------------------------------- |
| `id`            | Required lowercase kebab-case immutable ID.             |
| `title`         | 12–120 characters.                                      |
| `domain`        | One of the eight domain IDs.                            |
| `summary`       | 40–240 characters.                                      |
| `difficulty`    | `foundation`, `intermediate`, or `advanced`.            |
| `minutes`       | Integer from 3 to 45.                                   |
| `tags`          | 1–8 strings, each at least 2 characters.                |
| `searchTerms`   | Optional; up to 12 curated terms, each 2–80 characters. |
| `prerequisites` | Optional question IDs.                                  |
| `related`       | Optional question IDs.                                  |
| `featured`      | Optional boolean, defaults to `false`.                  |

The schema is the source of truth. If this table and `src/content.config.ts` ever disagree, fix the
documentation or the schema; do not quietly invent a third version of the contract.

## IDs are not filenames

A question's `id` is its stable identity. `questionHref()` builds the public article URL from that ID.
The route parameter may look like a slug, but the app does not rely on the content loader's filename
slug as the durable identity.

IDs are used by:

- Prerequisite and related-question references.
- Progress records in LocalStorage.
- Search documents.
- Article links.
- The append-only QR transfer manifest.

Changing an ID is therefore a data migration, not a rename. Do not do it casually.

## The manifest is append-only

`src/data/question-manifest.ts` is the ordered list used by the QR transfer protocol. Every current
question must appear exactly once, and existing entries must keep their position.

When adding content, append the new ID to the end. Never reorder, reuse, or remove an existing slot.
If a question is retired, preserve its manifest slot so older QR exports do not map their saved
state to a different article.

The hard maximum is 150 questions. The cap is enforced in the content graph and progress/QR model.

## Relationships form a graph

`prerequisites` and `related` both reference question IDs, but they mean different things:

- A prerequisite is something useful to understand first. Prerequisite edges must form a directed
  acyclic graph; cycles are rejected.
- A related question is another useful place to go. It does not participate in prerequisite cycle
  detection.

The graph validator rejects duplicate question IDs, unknown references, self-references, duplicate
relationships, and prerequisite cycles. The build should fail loudly when the graph is broken.

## Article structure and editorial checks

The content tests inspect all articles for required metadata and the expected editorial structure.
They also validate relationships and the manifest. Read a few existing articles in the target domain
before adding one; consistency matters more than forcing every topic into identical prose.

The editorial bar is simple:

- Explain the mechanism, not just the vocabulary.
- Show why the behaviour matters in real interfaces.
- Include edge cases and trade-offs where they change the answer.
- Prefer concrete examples over slogans.
- Do not pad an article to hit a word count.

## Search indexing

The static route `src/pages/search-index.json.ts` builds search documents from the collection. It
includes metadata and the rendered source body used as searchable text. The browser validates the
index shape before ranking it.

Use `searchTerms` for useful aliases, alternate terminology, or phrases someone might actually type.
Do not stuff it with unrelated keywords. Search ranking gives curated metadata more weight than
body-only matches, so a small number of good aliases beats a bucket of SEO confetti.

## Useful files

- `src/content.config.ts` — frontmatter schema and collection loader.
- `src/lib/content.ts` — maps entries into question summaries and validates the graph.
- `src/lib/atlas.ts` — shared types, URL helpers, ordering, and graph/search logic.
- `src/data/domains.ts` — domain metadata and featured question IDs.
- `src/data/question-manifest.ts` — append-only transport order.
- `tests/content.test.mjs` — editorial, graph, and manifest checks.
