# What's next?

This is not a roadmap. There are no dates hiding in here, and none of these ideas is a promise. It is
just a list of things I'd like to try if they still sound useful when I get around to them.

## Favourites

Sometimes I find a question I want to come back to, but I am not ready to read it properly. A way to
favourite questions would solve that without turning the handbook into a to-do app.

I'd keep favourites local, just like reading progress. The interesting bit is deciding whether they
should travel with progress in the QR transfer format. If they do, that means evolving the format
without breaking snapshots people have already saved. I would rather think that through than bolt a
star icon onto the page and call it done.

## Learning paths

The articles already have prerequisite and related-question links. A next step could be a few
curated paths through the material: for example, a JavaScript fundamentals path or a browser
rendering path.

These should be useful sequences, not a giant course builder. A small, opinionated list is probably
better than inventing another system for people to configure.

## Progress-aware discovery

The site already knows whether a question is untouched, in progress, or complete. Search and the
question listings could make better use of that information with filters such as **Not started**,
**In progress**, and **Completed**.

That would make the existing progress data more useful without needing accounts, a server, or a new
kind of state.

## Pick something for me

Sometimes I know I want to read something and have absolutely no idea what. A random-question action
could pick from the whole handbook, or optionally skip questions I've completed.

Small feature. No grand architecture. Sometimes that is allowed.

## Could favourites fit in the QR code?

Maybe. Favourites are just question IDs, and every question already has a slot in the manifest, so
a compact bitset might be enough to carry them. The current QR format is already pretty tight: a
worst-case test keeps 150 questions with reading progress for every one under 1,500 characters.
And payload length isn't the whole story — the generated code still needs to scan reliably.

I haven't tried it yet. It would mean extending the transfer format (probably with a new version),
then checking the actual QR size and trying a few real scans. If the code gets too dense or fussy to
scan, favourites can stay on the device. Not every bit of state needs a boarding pass.
