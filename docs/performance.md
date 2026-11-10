# Performance notes

The main performance decision is also the least exciting one: do not make the browser do work that
the build can do once.

Astro is configured for static output. The handbook's pages are generated at build time and served
as files. Content-heavy pages do not need a client-side rendering framework to display headings,
paragraphs, and links.

## What the project does

- Generates pages from Astro Content Collections at build time.
- Uses Svelte for the interactions that need client-side state, rather than hydrating the whole page.
- Builds a static search JSON file and ranks results in the browser after it loads.
- Uses a small set of shared UI components from Iris.
- Uses Tailwind utilities and the Iris theme rather than shipping a separate styling framework.
- Uses `requestAnimationFrame` plus a debounce for reading-position measurement and persistence.
- Loads QR encoding/decoding modules dynamically when the export/import flow needs them.
- Respects `prefers-reduced-motion` in the global styles and article swipe boundary animation.

## Search cost

The search index is downloaded as one static JSON resource. The component validates the payload,
then ranks results in memory. Typing does not issue a network request for each keystroke. The current
search UI displays up to ten results.

This is appropriate for the current bounded handbook. If the content grows substantially beyond the
150-question editorial cap, revisit the index size and ranking cost before reaching for a search
service. The cap is currently a deliberate product and protocol constraint, not an invitation to
add infrastructure early.

## Reading progress cost

Scroll events are passive. Measurements are coalesced with `requestAnimationFrame`, and writes are
debounced by 1.2 seconds. Small position changes are ignored. A final flush is attempted when the
document becomes hidden and on `pagehide`.

This avoids serializing and writing the entire progress snapshot on every scroll event. It also
means the last small movement is not guaranteed to survive a process kill before the next flush;
that is the trade-off of not writing continuously.

## Hosting and cache headers

The current production host is GitHub Pages. The application can control generated assets and URLs,
but it cannot set arbitrary per-file HTTP response headers on GitHub Pages. In particular, a short
cache lifetime reported by Lighthouse for hosted CSS, fonts, or JavaScript is a hosting/CDN response
header issue, not something an Astro component or a `_headers` file can override on GitHub Pages.

If custom cache policy becomes important, a host/CDN that supports response-header configuration
could apply different policies to HTML and content-hashed assets. For example, immutable hashed
assets can be cached for a long time while HTML is revalidated. That is a hosting change, not a
frontend-code trick.

## Lighthouse and real-world performance

Lighthouse is useful for checking the built site under repeatable lab conditions. Scores vary with
the device profile, browser, network simulation, and test environment. They are a snapshot, not a
property permanently attached to a deployment. Real-user Core Web Vitals become useful once the
site has enough field traffic to produce meaningful data.
