# Security and privacy

Journal is a static editorial site. It has no accounts, application database, user profiles or server-side content mutation.

The search index is generated at build time and downloaded by the browser. Search queries remain in the visitor's browser; Journal does not send them to an application API.

External project links use explicit destinations. Keep dependency updates, GitHub Actions permissions and Cloudflare deployment credentials scoped to the minimum required access.

Cloudflare Pages serves the generated static output. Security headers are defined in `public/_headers`.
