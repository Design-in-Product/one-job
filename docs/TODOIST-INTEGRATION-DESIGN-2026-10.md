# Todoist integration: design (2026-10-12)

**Status:** xian answered the questions on 2026-10-12 (below). Build
started the same day, at stage `alpha`. Board item 40. Background: `AGENT-DECK-VIA-INTEGRATIONS-2026-10.md`.

## What is decided

- Todoist is the first real integration. The GitHub import stays
  behind its beta flag (xian, 10-12).
- Read-only first, then a proven week, then completion write-back
  (ROADMAP R3.4).
- When the user adds the integration, One Job asks whether Todoist
  updates the deck's order during sync or the deck's order is
  maintained. The default is One Job's order. There is no general
  "don't ask me again"; the choice can be changed in the
  integration's settings (xian, 10-12).
- The mapping is "loose but simple" (xian, 10-12):
  - A deck is tied to one project or one section, whichever the user
    picks.
  - A sub-project is a separate thing to pick. It is not pulled in
    automatically.
  - A task's sub-tasks become the deck inside its card.
- One Job has no concept of "agent". Both of xian's sections are just
  lists (xian, 10-11).

## What Todoist's API returns (observed 10-12, test account)

Read with xian's test token. Unified API v1,
`https://api.todoist.com/api/v1`, header `Authorization: Bearer …`.

- `GET /projects`, `GET /sections?project_id=`, `GET /tasks?project_id=`
  each return `{ "results": [...], "next_cursor": null }`. `limit` is
  at most 200. A bad token returns 401 with a JSON error.
- The browser preflight allows the `Authorization` header from
  `https://onejob.co` and from `capacitor://localhost`. So the web app
  and the phone app call Todoist directly. One Job runs no server.
- A task has, among others: `id` (a string), `content` (the title),
  `description`, `project_id`, `section_id`, `parent_id` (set on a
  sub-task), `child_order`, `checked`, `added_at`, `completed_at`,
  `priority`, `due`, `labels`.
- A section has `id`, `project_id`, `name`, `description`,
  `section_order`.
- Sub-tasks come back in the same flat list as their parents, with
  `parent_id` set and the parent's `section_id`.

## How a task becomes a card

| Todoist | One Job |
|---|---|
| The picked project or section | One deck, named after it, bound by its id (not its name) |
| `content` | Card title |
| `description` | Card description |
| Task with `parent_id` | A card in its parent's interior deck |
| `child_order` | First import: the deck's order. Later: only if the user chose "Todoist updates the order" |
| `id` | The card's provenance (`todoist`, task id). The card gets its own local id |
| `checked: true` | Not imported |
| Due date, priority, labels | Not shown at first. One Job has no place for them |

## The flow

1. Integrations → Todoist → paste a token. The hint says where to
   find it. The token is kept on the device, as the GitHub one is.
2. One Job lists the user's projects and their sections. The user
   picks one.
3. One Job asks the order question, with "keep One Job's order"
   selected.
4. Import. The deck appears, named after the project or section.
5. Sync afterwards: when the app opens and comes to the front, and
   from a "Sync now" button. New tasks come in. Nothing is written
   to Todoist until write-back is earned.

## What the seam needs

`SourceAdapter` and `importFromSource` already do most of this for
GitHub. Three additions:

- A deck name separate from the service key, so a deck can be called
  after its section while it is bound by the section's id.
- Sub-cards on an external card, so sub-tasks land in the interior
  deck.
- A second pass on sync for tasks that changed or closed upstream
  (question 2).

Red zone: anything that changes or removes cards on sync, and the
order rule. Yellow zone: the adapter and the picker.

## Stage and tier

Starts at `alpha` in `featureStages.ts`, like any new feature, then
`beta`. Tier is question 3.

## xian's answers (2026-10-12)

1. **A new task lands on top.** "yes this is ok because the
   integration is going to a deck for that purpose."
2. **A task closed in Todoist goes to Done in One Job, "and vice
   versa on sync".** A card swiped Done closes the task in Todoist.
   *Coral's note:* the second half is write-back (R3.4), which the
   roadmap puts after a proven week of read-only. Built in that
   order unless he says otherwise.
3. **Tier: not decided.** "let's not decide this yet. it may be that
   any integration at all is what costs money or maybe it's the
   second list as you say."
4. **Token on the device: "yes for now… likely we support oauth
   ultimately".**
5. **Coral may write to the One Job project in Todoist** (his words
   in session). Coral adds tasks to both sections and closes only its
   own.

## Build log

- **2026-10-12, slice 1 (done):** `src/services/todoistAdapter.ts`:
  list the user's projects and sections; read one project's or one
  section's open tasks as cards, in order, with sub-tasks nested;
  follow pages; fail loudly. The seam gained a deck name and
  sub-cards. Stage `alpha` is registered. 12 new tests. Run against
  the real test account, read-only: both sections came back as decks
  of four cards. Sub-task nesting is covered by tests only; the test
  account has no open sub-tasks at the moment.
- **Next, slice 2:** the Integrations screen: token, pick a list, the
  order question, import. Nothing in the app shows Todoist yet.
- **Then, slice 3:** sync. New tasks land on top; a task closed in
  Todoist goes to Done; the order rule. Red zone.
- **Later:** completion write-back (R3.4), when xian says.
