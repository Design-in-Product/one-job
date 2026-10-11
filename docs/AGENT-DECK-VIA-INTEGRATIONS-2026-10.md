# The agent's deck, through integrations — xian's insight (2026-10-11)

**Status:** a write-up of what xian said, for him to correct. Nothing
here is decided or built. Board item 40.

## What xian said

His notes, 2026-10-11, lightly tidied:

- Don't build anything special for "agent decks".
- Don't build any form of syncing as we have discussed it.
- Instead, extend the roadmap item that already exists: integration
  with back-end task and project management systems.
- Go ahead with Todoist, and later abstract it into a connection
  layer. This serves an early tester's proposed use (a designated list
  in Todoist that One Job takes in) as well as the agent thesis.
- Then xian and his agents both work with the underlying service
  (here, Todoist) through its API, its MCP access, or other remote
  means. One Job doesn't carry that apparatus.
- xian can make cards on his own deck and on the agent's deck, because
  both are lists in his account. The agent can put cards on his deck
  or its own, because it has access to the same account. That gives
  two-way communication about task status and what needs attention.
- The agent is working with a to-do list app and sees a canonical
  order. The human keeps the deck, for clarity and focus.

His drawing shows the same thing: xian and the agent on either side of
two lists, one his and one the agent's, each able to reach both. It
carries three notes: "Get for free w/ integrations!", "Pro", and
"worth it? just me?".

## In one sentence

The agent's deck is a second Todoist list, and One Job is the lens on
both lists. The agent never talks to One Job at all.

## The roadmap items this would use

All of these are already in `ROADMAP.md`.

| Roadmap item | State | Role here |
|---|---|---|
| R3.1 source adapter seam | Shipped | Todoist plugs in here, as GitHub does. |
| R3.2 first import, read-only | Shipped (GitHub) | The pattern Todoist copies. |
| P3 Todoist, one designated list, read-only first | Next up | Becomes "designated lists": one for xian, one per agent. |
| R3.4 completion write-back, after a proven week | Planned | Swiping Done closes the task in Todoist, so the agent sees it. |
| R3.3 mapping store | Planned | Ties each card to its Todoist task. |
| R3.5 several sources | Planned | The "abstracted connection layer" xian names. |

## What this would make unnecessary

- **R4.1 MCP inbox** and **R4.3 dispatch a card to an agent**, as
  things One Job builds. Todoist's own API and MCP server do that job.
- **The card exchange** as the route for agents. It could stay as
  backup and restore.
- **The attention deck's file import.** Coral could write its asks
  into a Todoist list instead of publishing a JSON file.

## Where I'd check the claim (keeping it honest)

1. **"No syncing" is nearly true, not fully.** We'd build no sync
   service of our own and run no server. But One Job and Todoist
   still have to agree: a card swiped Done offline must reach Todoist
   later, and a task the agent closed must leave the deck. That is
   R3.4, and it is real work, though far smaller than our own sync.
2. **Order.** Todoist has one order that the agent can change. One
   Job's "Later" moves a card to the bottom, and the roadmap's R4 gate
   says no agent can ever reorder your deck. Does the deck follow
   Todoist's order, or keep its own? This needs a ruling.
3. **Answering.** xian's finding on the attention deck (same day): a
   card says what to do, but he can't answer from it, and he can't
   swipe it until he has answered. Todoist offers two ways to answer:
   complete the task, or comment on it. Completing comes with R3.4.
   Commenting would be a new thing for One Job to write.
4. **Making a card for the agent from the phone.** One Job would need
   to create tasks in Todoist. The roadmap has read, then completion
   write-back. Create isn't on it. Until then, xian would add the
   agent's cards in Todoist itself.
5. **The order of work doesn't change.** Read-only first, a proven
   week, then write-back. P3's precondition also still stands: scope
   or hide the GitHub import first.
6. **The token.** A Todoist token would sit on the device as the
   GitHub token does now. That is part of the threat-model question
   xian hasn't answered yet.
7. **"Worth it? just me?"** Every agent's-deck user would need a
   Todoist account and an agent that can use it. The roadmap's P4 (ten
   agent-heavy users) and P5 (ask what a review queue is worth) are
   where that question gets answered.

## Tier

Open. xian's drawing puts it near "Pro". A clean split would be: one
designated list is free, and more than one list (which is what an
agent's deck needs) is Pro. That is a flag, not a fork.

## Questions for xian

1. Is this write-up right? What did I get wrong or leave out?
2. Order: does the deck follow Todoist's order, or keep its own?
3. Answering: is "complete it" enough at first, or do you need to
   write a reply from the card?
4. Does this replace R4.1 and R4.3 on the roadmap, or sit beside them?
