# Review notes for Chuggs

I've finished the insights feature. These notes cover what I changed and the
patterns behind it, so the same issues don't come back. Every fix is its own
commit, and its body explains why, if you want the detail.

## What was good

The structure was easy to pick up. The app's queries used bound values, Zod
already guarded the config, the shared `lib` package and the Vite proxy were set
up properly, and `withDB` made database tests cheap to write. Most of my changes
built on that rather than replacing it.

## Six things to take forward

**1. Run it end to end before calling it done.** The list endpoint sent `200` as
its body, no table was ever created, the client expected different field names,
and it stored a promise instead of the data. A five-minute click-through would
have caught all four. There are now tests that add and delete an insight through
the whole app.

**2. Make sure the checks actually run.** `deno check` failed on every CSS
import, so no type errors were visible, and React was typed as `any`. The test
setup never loaded its matchers. Git hooks now run format, lint, types and the
related tests on every commit, so a broken check can't go unnoticed.

**3. Validate data where it comes in.** Ids reached the database unchecked,
blank text was accepted, there was no length limit, and the test fixture built
SQL from strings. The API now checks every input against one schema that the
client shares, so the two can't drift.

**4. Design the failure and slow paths, not just the happy one.** A failed load
looked like an empty list, a failed save lost the user's text, and a server that
never answered left the page loading forever. Each now has a clear state and a
test.

**5. Treat accessibility as part of done.** `all: unset` removed every focus
ring, the close and delete icons couldn't be reached by keyboard, and the modal
wasn't a dialog. The tests now find controls by role and name, so a control that
isn't accessible breaks its test.

**6. Put a few boundaries in early.** It's a small app and shouldn't be
over-built. But the client and server had separate schemas that disagreed, even
with a shared `lib` package there to hold one. Every route lived in `main.ts`,
so nothing could be tested without a server. The page component fetched data and
held all the state. Each took minutes to separate, and each one fixed a bug or
made a test possible.

## Next

Each of these is something to own when you write the code, not something to
leave for review to catch. Happy to pair on any of it.
