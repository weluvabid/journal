# Journal diagrams

The Mermaid files in this directory are the editable sources for the diagrams used in Journal articles. Their generated, optimized SVGs live in `public/diagrams/` and are served as static assets.

## Files

| Source                                   | Generated asset                        | Article         | Purpose                                                                         |
| ---------------------------------------- | -------------------------------------- | --------------- | ------------------------------------------------------------------------------- |
| `copy-2-markdown-extraction.mmd`         | `copy-2-markdown-extraction.svg`       | Copy 2 Markdown | Shows the extraction-to-clipboard path and Readability fallback.                |
| `tiny-lsm-storage-lifecycle.mmd`         | `tiny-lsm-storage-lifecycle.svg`       | TinyLSM         | Shows flush publication ordering, retained memtable on failure, and compaction. |
| `cachewise-single-flight.mmd`            | `cachewise-single-flight.svg`          | Cachewise       | Shows two callers sharing one factory and independent waiter cancellation.      |
| `frontend-atlas-progress-transfer.mmd`   | `frontend-atlas-progress-transfer.svg` | Frontend Atlas  | Shows local progress export and validated import through a QR transfer.         |
| `structaura-fingerprinting-pipeline.mmd` | `structaura-fingerprinting.svg`        | StructAura      | Shows parsing, supported normalization, canonical encoding and hashing.         |

## Updating a diagram

Edit the `.mmd` source, render it to SVG with Kroki, optimize the result with SVGO, and commit both files. For example:

```sh
curl --fail --silent --show-error \
  -H 'Content-Type: text/plain' \
  --data-binary @docs/diagrams/copy-2-markdown-extraction.mmd \
  https://kroki.io/mermaid/svg \
  -o public/diagrams/copy-2-markdown-extraction.svg

```

Repeat for the other diagrams, keeping the generated filename in the table above. Production builds use the committed SVGs; they do not call Kroki.

## Review notes

- The diagrams are compact, schematic views of the implementation.
- Check every node and transition against the current code before publishing an update.
- TinyLSM's diagram must match the actual ordering and failure behaviour of run publication.
- Cachewise's sequence illustrates per-waiter cancellation; it does not imply that an abort forcibly terminates a non-cooperative factory.
- Frontend Atlas's diagram describes the local export/import flow. Keep the QR payload validation and import steps aligned with the implementation.
- StructAura's normalization must include only transformations that are implemented. A matching fingerprint is not proof of semantic equivalence.
- Keep generated SVGs self-contained. Do not add external images, fonts, links or embedded raster assets.

## Asset sizes

Keep the generated SVGs self-contained and check their size before committing changes. The current assets are close to the 30 KB limit, so avoid adding unnecessary markup.
