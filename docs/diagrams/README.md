# Journal diagram source bundle

These are editable Mermaid sources for five proposed Journal article diagrams.
Render each `.mmd` file to SVG with Kroki, then optimize the SVG with SVGO.

## Files

| Source                                   | Target article  | Purpose                                                                         |
| ---------------------------------------- | --------------- | ------------------------------------------------------------------------------- |
| `copy-2-markdown-extraction.mmd`         | Copy 2 Markdown | Shows the extraction-to-clipboard path and Readability fallback.                |
| `tiny-lsm-storage-lifecycle.mmd`         | TinyLSM         | Shows flush publication ordering, retained memtable on failure, and compaction. |
| `cachewise-single-flight.mmd`            | Cachewise       | Shows two callers sharing one factory and independent waiter cancellation.      |
| `frontend-atlas-progress-transfer.mmd`   | Frontend Atlas  | Shows local progress export and validated import through a QR transfer.         |
| `structaura-fingerprinting-pipeline.mmd` | StructAura      | Shows parsing, supported normalization, canonical encoding and hashing.         |

## Rendering

For each file, POST its plain-text contents to the Kroki Mermaid endpoint and save the SVG response.
For example:

```sh
curl --fail --silent --show-error \
  -H 'Content-Type: text/plain' \
  --data-binary @diagrams/copy-2-markdown-extraction.mmd \
  https://kroki.io/mermaid/svg \
  -o copy-2-markdown-extraction.svg
```

Repeat for the other files, changing the input and output names.

## Important review notes

- These diagrams are intentionally compact and schematic.
- Check every node and transition against the current implementation before publishing.
- In particular, confirm the exact ordering and atomicity guarantees of TinyLSM run publication.
- The Cachewise sequence illustrates per-waiter cancellation; it does not imply that an abort forcibly terminates a non-cooperative factory.
- The Frontend Atlas diagram describes the intended local export/import flow; verify the exact QR payload validation and import behaviour.
- StructAura's normalization must be described as only the transformations actually implemented. A matching fingerprint is not proof of semantic equivalence.
- Do not add external images, fonts, links, or embedded raster assets to the generated SVGs.

## Suggested asset budgets

- Preferred: 2–8 KB per optimized SVG.
- Review if an SVG exceeds 15 KB.
- Hard limit: 30 KB per SVG.
- Keep SVGs self-contained; no external resource references.

The SVGs should be committed alongside their Mermaid sources. Production builds should consume the generated assets and must not call Kroki.
