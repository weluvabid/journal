# 0005 — Keep the interface monochrome

- **Status:** Accepted
- **Date:** 2026-11-07

## Context

I am very picky about colours. Picking one colour tends to become a side quest: compare shades,
change saturation, compare them again, wonder if the first one was better, repeat until the actual
work is waiting in the corner.

There are roughly 16.7 million RGB colours. I did not want to audition all of them.

## Decision

Use a monochrome visual direction and let hierarchy, spacing, typography, borders, and state carry
the interface. Keep semantic theme tokens so light and dark modes can share the same components.

## Consequences

Good:

- Fewer decorative decisions to revisit.
- A restrained visual system across content-heavy pages.
- Less risk of colour being the only signal for state.
- The design can focus attention on the writing and diagrams/examples.

Trade-offs:

- Contrast and hierarchy need care; monochrome is not an excuse for low-contrast grey text.
- Interactive and status states still need clear visual distinction.
- The interface can feel understated, which is a deliberate choice rather than an attempt to please
  every possible taste.

## Revisit when

If a real usability problem appears, fix it. The point is not to ban colour forever; it is to avoid
turning colour selection into the main activity of the project.
