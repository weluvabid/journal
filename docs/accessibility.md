# Accessibility and keyboard navigation

The interface is designed to work with a keyboard as well as a pointer. Colour is not the only
way state is communicated: controls also use labels, text, and semantic state.

## Keyboard shortcuts

The global controller lives in `src/lib/keyboard/controller.ts`. The shortcuts currently exposed
by the help dialog are:

| Shortcut         | Action                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------- |
| `⌘ K` / `Ctrl K` | Open search.                                                                            |
| `[`              | Open the previous question when available.                                              |
| `]`              | Open the next question when available.                                                  |
| `G`, then digits | Start numbered-card navigation.                                                         |
| `Enter`          | Open the selected numbered card.                                                        |
| `Backspace`      | Remove the last digit from the card number.                                             |
| `M`              | Toggle completion on an article.                                                        |
| `P`              | Open the progress menu.                                                                 |
| `?`              | Open help.                                                                              |
| `Esc`            | Cancel numbered-card navigation; dialogs and menus also use their own Escape behaviour. |

Numbered-card navigation remembers the card collection associated with the active element when `G`
is pressed. It accepts a sequence of digits, gives the user two seconds of inactivity before the
sequence expires, and reports an invalid or missing card instead of silently navigating somewhere
else.

The global controller avoids handling ordinary shortcuts while focus is in editable controls. It
also yields to visible dialogs, menus, and listboxes so shortcuts do not fight the active widget.
`Ctrl/Cmd K` is handled before that overlay check so the search shortcut can be invoked consistently
from the page; the search dialog itself owns its internal keyboard interaction.

## Focus and dialogs

Interactive controls use semantic buttons and links, accessible names, and visible focus styling.
The global stylesheet supplies a `:focus-visible` outline for links and form controls, while
component-level controls use the theme ring utilities.

Dialogs and menus use Iris primitives for focus handling and dismissal. The Help dialog also
has a viewport-constrained maximum height and scrolls internally when its content is taller than
the available space.

## Semantics and status announcements

The interface uses landmarks, headings, labelled navigation, button names, progress semantics, and
live status regions where the state changes need to be announced. Progress controls expose their
completion state with `aria-pressed`; the reading indicator exposes a progressbar role and numeric
value.

Decorative icons are hidden from assistive technology. Controls that open search, help, or progress
management have explicit accessible labels.

## Motion

Global styles reduce animation and transition durations when `prefers-reduced-motion: reduce` is
active. The article swipe boundary animation also checks the reduced-motion preference before
playing.
