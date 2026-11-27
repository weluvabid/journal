# Journal diagrams

Journal uses five self-contained SVG architecture diagrams. They open directly in a new browser tab from the article resource actions; they are not embedded in article layouts.

## Assets

| SVG asset                              | Article         | Purpose                                                         |
| -------------------------------------- | --------------- | --------------------------------------------------------------- |
| `tiny-lsm-storage-lifecycle.svg`       | TinyLSM         | MemTable writes, immutable runs, reads and compaction           |
| `cachewise-single-flight.svg`          | Cachewise       | Concurrent callers sharing one in-flight operation              |
| `structaura-fingerprinting.svg`        | StructAura      | Structural extraction, normalization and fingerprint generation |
| `copy-2-markdown-extraction.svg`       | Copy 2 Markdown | Source acquisition, content extraction and Markdown conversion  |
| `frontend-atlas-progress-transfer.svg` | Frontend Atlas  | Accountless progress transfer between devices using QR          |

## Updating a diagram

Edit the SVG in `public/diagrams/` and keep it self-contained. Preserve its `viewBox`, explicit dark background (`#121212`), readable foreground contrast, and consistent typography and stroke styling.

Each article declares its diagram through the optional `diagram` frontmatter property. The value must point to a local SVG under `/diagrams/`; tests verify that every declared asset exists.

Diagrams open directly in the browser rather than being embedded in the article. This keeps article layout independent of diagram dimensions and avoids theme-specific embedded backgrounds.

## Review checklist

- Verify every label and transition against the current implementation.
- Keep the composition compact and readable at full browser viewport size.
- Use an explicit background so the diagram looks intentional in both Journal themes.
- Keep SVGs self-contained: no external images, fonts, scripts or embedded raster assets.
- Avoid adding implementation claims not supported by the associated article.
