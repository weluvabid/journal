# Performance

Journal is statically generated and served from Cloudflare's edge network.

- No runtime database or server rendering.
- Search index is generated at build time and fetched on demand by the existing search dialog.
- Interactive Svelte components are hydrated only where needed.
- Content pages are generated as static HTML.
- Images and fonts should remain local where licensing permits.
- Respect reduced-motion preferences and avoid adding client-side dependencies for static content.

Measure before adding optimisations. Keep the generated search index proportionate to the actual published content.
