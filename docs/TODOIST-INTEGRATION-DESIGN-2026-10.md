# Todoist integration: design (2026-10-12)

**Status:** design for xian's review. Nothing here is built. Board
item 40. Background: `AGENT-DECK-VIA-INTEGRATIONS-2026-10.md`.

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

## Questions for xian

1. **Where does a new task land in a deck that keeps One Job's
   order?** *Rec: on top.* It is the same rule as everywhere else
   since 10-12: a new card takes the top. In your attention deck that
   is what you want from an agent's ask. The cost: five new tasks
   push your current top card down five places.
2. **When a task is closed in Todoist, does its card go to Done in
   One Job?** *Rec: yes.* The app reads that; it writes nothing. If
   not, the deck fills with cards that are already finished.
3. **Tier: one tied list free, more than one Pro?** *Rec: yes.* It is
   a flag, not a fork, and an agent's deck is what needs the second
   list.
4. **May Coral write to your Todoist project?** You asked for it in
   the tasks you added (put a task on your list for each thing you
   need to do; add my own to my section). This session's permission
   check refused the first write, so I need your word here. *Rec:
   yes, in the One Job project only: add tasks to both sections, and
   close only tasks in my own section.*
5. **The token on the device.** It sits in the app's storage, as the
   GitHub token does. That is part of the threat-model question you
   haven't answered. *Rec: accept it for alpha and beta, and settle
   it before release.*
