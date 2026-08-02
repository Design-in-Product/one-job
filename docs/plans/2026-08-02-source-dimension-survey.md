# Source-dimension survey — the task-surface landscape, mapped before Trello

**Author:** Coral · 2026-08-02 · **Status:** FOR DISCUSSION. Xian's ask:
*"survey a number of different task management surfaces now and try to
capture all of their dimensions… perhaps even [let] advanced users
choose different types of mappings, although that's perhaps a little
too much flexibility, who knows."* This doc is the survey and a lean on
the flexibility question. **Nothing here builds anything** — the Trello
adapter stays Gall-gated on his GitHub real-use test.

**Tier:** the thinking is free; every adapter it informs is R3 pro
plumbing (PRICING).

---

## 1. The surfaces, surveyed

| Surface | Containment | Status model | Cross-cutting | Time | Notable quirk |
|---|---|---|---|---|---|
| **Trello** | board → list → card (+ checklists) | **lists ARE often the status** (To Do/Doing/Done) — or categories; the board decides | labels, members | due date | The list-semantics ambiguity is THE mapping question |
| **Todoist** | project → section → task → subtask (4 fixed levels) | binary done | labels, priority (1–4) | due + **recurring** | Recurrence is first-class; sections are weak containers |
| **Asana** | workspace → project → section → task → subtask | done + custom stages | tags, custom fields, assignee | due, start | **Multi-home**: one task lives in MANY projects — breaks every tree model |
| **GitHub Issues** | repo → issue (flat) | open/closed | labels, milestones, assignees | milestone due | Shipped (rc.21): flat made it the easy first source |
| **Apple Reminders** | list → reminder (+ subtasks) | binary done | flags, priority | due, **location** | The default-app gravity well; EventKit access is native-only |
| **Things** | area → project → heading → to-do | binary done | tags | due + **start ("when")** | Start-vs-due distinction is genuinely good design |
| **Linear** | team → project → issue → sub-issue | **workflow states** (custom pipelines) | labels, priority, cycles | cycle, due | States are the product; cycles are time-boxes |
| **Jira** | project → epic → story → subtask | arbitrary workflow graphs | labels, components, sprints | sprint, due | Maximal everything; the anti-One-Job |

## 2. The dimension inventory (what the mapping store must speak)

Extracted across all eight — these are the axes any source must be
described in:

1. **Containment depth & rigidity** — fixed shallow (GitHub: 2) vs
   fixed deep (Todoist: 4) vs recursive (us). Ours is the only
   *alternating* recursion (deck → card → deck).
2. **Status: binary vs staged vs graph** — done/not (us, Todoist,
   Things) · fixed stages (Trello-as-kanban) · arbitrary workflows
   (Linear, Jira). Our chain (deck→Done→Archive→Trash) is a *lifecycle*,
   deliberately not a *workflow* — the distinction matters below.
3. **Cross-cutting grouping** — labels/tags everywhere; orthogonal to
   containment. We have NO cross-cutting axis today (decks are
   exclusive). Honest gap, not an accident: covenant 7's fussiness
   principle says don't invite taxonomy play.
4. **Time** — due dates (most), start dates (Things), recurrence
   (Todoist), time-boxes (Linear cycles). We carry none on the face —
   per the aesthetic rule, capture in DATA, never render as dread.
5. **Multi-home** — Asana only, but it breaks tree-mapping entirely;
   any general model needs a primary-home + provenance answer.
6. **People** — assignees/members. Meaningless for us until R4 deals
   cards to agents (an assignee is who holds the card).
7. **Checklist-lite children** — Trello checklists, Reminders subtasks:
   children that are less than full objects. Ours are FULL cards at
   every depth — imports must *promote* them honestly or drop them
   with provenance.

## 3. Xian's taxonomy insight, formalized (2026-08-01)

**Project management ≠ task management.** PM surfaces (Jira, Linear,
Asana) center the *workflow graph and the team*; task surfaces
(Reminders, Things, Todoist) center the *person and the next action*.
Trello straddles — kanban boards are PM, grocery boards are personal.
One Job is radically task-side: one card, one person, now. **Import is
therefore always a projection** — flattening someone else's workflow
dimensions into our lifecycle — and a projection loses data BY DESIGN.
Provenance (`source`, `externalId`, later the R3.3 mapping store) is
what makes the loss honest and reversible-at-the-source.

## 4. Mapping strategies, per dimension

- **Containment → alternation:** container-of-containers needs a
  carrier card at each odd level (the R2.1 corollary generalizes:
  *anything that holds decks must be a card*). Trello: board → root
  deck; **lists → named interior decks of… a board carrier card**, or
  lists → carrier cards in the board deck. Item 17's multiple named
  decks per card is exactly the shape lists want.
- **Status stages → lifecycle:** a "Done" list maps to our Done room;
  intermediate stages ("Doing", "In Review") have NO home — they
  flatten to "in the deck" (position can encode order). This is loss;
  see §3.
- **Tags/labels →** capture in data (provenance blob), render nothing.
  A future cross-cutting surface is its own design fight; don't
  back-door it through import.
- **Due/recurring →** capture in data; no face rendering until the
  card-aging/time material language pass decides how time FEELS here.
- **Multi-home →** primary home wins (first project / user-chosen),
  duplicates skipped by provenance.
- **Checklist items →** full cards in an interior deck (promotion), or
  skipped with a count in provenance. Lean: promote — a checklist item
  is a task that deserves personhood.

## 5. The flexibility question — my lean

Your instinct ("perhaps too much flexibility") is right, and Gall
agrees. A mapping *editor* is a taxonomy playground — the exact
fussiness temptation the 07-29 principle warns against, sitting at the
exact moment (import) when a user least understands our model.

**Lean: one blessed mapping per source, plus AT MOST one import-time
question, asked only where the source is genuinely ambiguous.** For
Trello that question is real and singular: **"Are this board's lists
stages of work, or categories of it?"**
- *Stages* → Done-ish lists land in the Done room; the rest join one
  deck in list order.
- *Categories* → lists become named interior decks (Item 17 shape).

Everything else defaults. **Choosable/custom mappings** land on the
premium shelf as a maybe-never: revisit only if real imports produce
real complaints. (This also keeps the R3.3 mapping store simple: it
records what a blessed mapping DID, not a user's mapping *program*.)

## 6. What this changes about the sequence

Nothing. GitHub test → Trello adapter (with §5's single question) →
mapping store records projections → R3.5 federation normalizes across
sources using §2's dimension inventory as its schema. The survey's job
was to make sure the Trello adapter's shortcuts are *chosen*, not
stumbled into — and to give R3.5 its vocabulary three releases early.
