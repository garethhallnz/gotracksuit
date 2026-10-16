# Submission notes

The handover said only two endpoints were left. In practice the list couldn't
even load. The first 7 commits get it working: they fix what stopped the list
loading, add the two endpoints and wire them into the page. Everything after
fixes bugs that could lose or corrupt data, and problems with usability,
accessibility and structure. Each commit does one thing, and its body says why.

## Made it work

- **The create and delete endpoints were empty stubs.** Both now exist:
  `POST /insights` and `DELETE /insights/:id`.
- **No table was ever created**, so the first query failed. It's created on
  startup.
- **The list endpoint sent `200` as its body** instead of the insights. It now
  returns them.
- **The client and server disagreed on field names**, and the client stored a
  promise instead of the data, so the list couldn't render. The client and
  server now share one schema, so they can't drift apart again.
- **The add form and the delete icon did nothing.** Both now work.

## Improved the UX

- **Confirm before deleting.** Delete was one click with no undo. An inline
  "Delete this insight?" now guards it.
- **Readable insights.** Brands showed as raw ids and dates as
  `Date.toString()`. You now see brand names and readable dates, newest first.
- **Loading and error states.** While loading, the page shows a loading message
  instead of flashing "We have no insight!". A failed load says so and offers
  Try again, and a failed delete shows an error.
- **Nothing lost on a failed save.** The form stays open with your text and says
  what went wrong.
- **One save per submit.** Clicking again while saving does nothing.
- **A live character counter.** Text had no limit. It's now capped at 1,000
  characters, and you can see how close you are.
- **No endless loading.** A server that never answers times out after 10
  seconds.

## Correct data

- **Blank text was accepted** (spaces only). It's now trimmed and refused.
- **A large brand id broke the list for every user.** The database read it back
  as a negative number, which the client rejected. The API now rejects ids that
  large.
- **A late delete could remove the wrong insight.** Deleted ids were reused, so
  deleting an old insight a second time removed the new one. Ids are no longer
  reused.
- **A slow reload could overwrite a newer one** and bring back a deleted
  insight. Stale reloads are now ignored.
- **Closing the add dialog mid-save could wipe a new draft.** The dialog now
  stays open until the save finishes.
- **The database location depended on where the server was started**, so
  starting it from the repo root used a second, empty database. It's now always
  the same file.
- **A missing insight returned 200 with an empty body, and ids weren't
  checked.** These now return 404 and 400.

## Accessible

- **`all: unset` removed every focus ring.** Every control now shows one.
- **The close and delete icons were clickable images**, so you couldn't reach
  them by keyboard. They're labelled buttons now.
- **The modal wasn't a dialog.** It now takes focus and hands it back, closes on
  Escape, keeps the page behind it out of reach, and scrolls at 400% zoom.
- **The brand select had no label, and focus was lost after deleting.** Both are
  fixed.
- **The page had no language, and `<div id="root" />` isn't valid HTML.** Both
  are fixed.

## Safer

- **The test fixture built SQL from strings.** It now uses bound values, like
  the app.
- **Another site could post a plain-text form to the API.** Only JSON is
  accepted now.
- **Logs contained users' full insights.** A small logger replaces `console`,
  and user text stays out of the logs.
- **Unexpected errors returned plain text without the security header.** They
  now return the same error body as every other failure.

## Easier to maintain

This is a small app and doesn't need much architecture. But a few boundaries
were missing, each took minutes to add, and each one fixed a bug or made
something testable. Heavier patterns were considered and left out (see below).

- **The client and server each had their own insight schema, and they
  disagreed.** That's why the list couldn't render, even though a shared `lib`
  package already existed to hold one. There's now one schema in `lib`, used by
  both.
- **Config, the database, every route and server start-up all lived in
  `main.ts`.** The API couldn't be tested without starting a server. The app is
  now built in a function, with the routes in their own file, so tests call them
  directly.
- **Each operation converted database rows to insights by hand.** One function
  now does it.
- **The page component fetched data and held all the state, and the header owned
  the add dialog.** Requests now live in a requests layer and state in a
  `useInsights` hook, and the header shows whatever button it's given.
- **`deno check` failed on every CSS import, and React was typed as `any`.**
  Type checking now works across the repo.
- **The test setup never loaded its matchers.** Every endpoint and user flow now
  has tests.
- **Nothing ran the checks.** Git hooks run format, lint, types and the related
  tests on commit, and everything on push.

## Considered and left out

Each of these was weighed and deliberately not done. Together they're the
roadmap I'd follow next.

### Security

- **Auth.** Anyone can add or delete insights. It's the largest change and needs
  product decisions the brief doesn't make. Likely shape: staff write, customers
  read, SSO, `HttpOnly` `SameSite` cookies and role checks.
- **CSRF.** There are no logins or cookies, so a forged request carries nothing
  an attacker couldn't send directly. It arrives with auth. The one cross-site
  gap that applies today, plain-text form posts, is closed.
- **Content-Security-Policy.** It belongs where the built client is served. The
  Vite dev server needs inline scripts, and escaped JSX already prevents XSS,
  guarded by a test.
- **Rate and size limits.** These belong at the proxy. Behind a proxy the client
  IP is a weak key, and an in-memory counter isn't shared between servers.
- **`--allow-ffi`.** The SQLite driver needs it, which effectively switches off
  Deno's permission sandbox. Newer Deno has `node:sqlite` without FFI.

### Product

- **Brands as data.** Brands are a fixed list of six in the client. Rejecting
  brand 0 would still allow brand 7. The real fix is a brands table and
  `GET /brands`, which is a feature in its own right. Until then the list shows
  "Unknown brand (N)".
- **Pagination.** It's a breaking change through every layer. Not worth it for a
  handful of insights.
- **Automatic retries.** Try again and the add form already let the user retry.

### Libraries

- **TanStack Query.** A dependency plus a test rewrite, for one list and two
  mutations. `useInsights` is where it slots in, and it's the right home for
  optimistic updates.
- **An ORM (Drizzle or Kysely).** One table and four queries. Worth it once
  there are more tables or migrations.
- **A form library.** A two-field form that already has six tests. Revisit when
  there are more forms.
- **Complexity and duplication tools.** A one-off scan found nothing to fix, so
  another linter isn't worth it at this size.

### Code and tooling

- **File naming and folders.** Kebab-case files and a flat `components/` folder
  are consistent, so renaming would be churn. If done, it's one move into
  `features/insights/`.
- **Design tokens.** Components use raw palette shades rather than role tokens.
  That's a design-system decision.
- **`noUncheckedIndexedAccess`.** Tried it. It flagged 8 places, none of them
  real bugs, and the fixes added noise.
- **CI.** Nothing is deployed, and the hooks plus `deno task test` cover the
  checks. CI would be the only check nobody can skip.
- **Toolchain.** Deno 2.1.2 (pinned by the template), Zod 3 and framer-motion 11
  are old. Upgrading Deno would remove the per-import React type directives and
  the noisy Vite test output.
- **API edge cases.** Unknown routes return empty 404 and 405 bodies, huge ids
  aren't range-checked, and the timeout doesn't cover reading the body. None of
  these reaches a user.

### For design

- **Primary button contrast** is 3.2:1, and AA needs 4.5:1. `purple-700`
  (9.22:1) or dark text would fix it, but brand colours are design's call. The
  danger button's hover shade is also off-palette.
- **Favicon.** The link 404s, because the icon is a brand asset.
