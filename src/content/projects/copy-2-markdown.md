---
id: copy-2-markdown
title: 'Copy 2 Markdown'
summary: 'A local-first Manifest V3 extension that extracts webpage content, converts it to GitHub-Flavored Markdown and writes it through an extension-owned clipboard context.'
status: experimental
tags: [chrome-extension, markdown, browser, privacy, javascript]
stack: [TypeScript, Chrome Manifest V3, Mozilla Readability, Turndown, Playwright]
github: 'https://github.com/weluvabid/copy-2-markdown'
journal:
  primary: copy-2-markdown-local-first-browser-extraction
featured: true
order: 9
---

## Overview

Copies a page, a selection, or a link as Markdown. Extraction and conversion run in the browser. Active-page access is requested when you invoke the action, not held as a standing host permission. No account, no application backend, no analytics, no remote endpoint that sees the page.

## Engineering notes

Mozilla Readability first, then a cleaned semantic root, then body. Structural filters, semantic filters, and the narrow framework-specific ones stay separate. HTML-to-Markdown doesn't depend on Chrome: GFM tables, code fences, relative URLs, protocol allowlists. Clipboard writes go through an extension-owned offscreen document, not the page DOM.

*Example I'd add:* one page where Readability is right, one where the semantic fallback has to take over, and the Markdown from each.

## What to explore

- [Architecture](https://github.com/weluvabid/copy-2-markdown/blob/main/docs/architecture.md)
- [Extraction and filtering](https://github.com/weluvabid/copy-2-markdown/blob/main/docs/extraction.md)
- [Markdown conversion](https://github.com/weluvabid/copy-2-markdown/blob/main/docs/conversion.md)
- [Privacy policy](https://github.com/weluvabid/copy-2-markdown/blob/main/PRIVACY.md)
