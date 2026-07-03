# MCP × One Job — design memo (draft for discussion)

**Author**: Coral · 2026-07-03
**Status**: thinking document; no code yet. Post-1.0 flagship candidate.

## The pitch (from Xian's roadmap conversation)

One Job becomes **the human-attention endpoint for agents**: an agent
finishes work, needs a human decision or action, and *deals a card into
your deck*. Nothing else in the MCP ecosystem does "present this to a
human, one thing at a time" well. The reverse flow matters too: when you
complete or defer an agent's card, the agent finds out.

## The tension local-first creates

The 1.0 architecture deliberately keeps tasks in device storage — there is
no server holding Xian's deck. But an MCP server has to run somewhere
agents can reach, which means **agents cannot write directly into the
authoritative store**. Any MCP design is therefore also a partial-sync
design. Pretending otherwise would quietly reintroduce the backend as the
source of truth and undo the 1.0 bet.

## Proposed shape: the Inbox model

Think of it as a mail slot, not shared custody of the deck.

```
agent ──MCP──▶ One Job server (inbox, per-user)  ◀──poll/push── phone app
                    │                                     │
                    └──── task status events ◀────────────┘
```

1. **MCP server** (FastMCP wrapper, ~150 lines) runs alongside the existing
   FastAPI backend. Tools it exposes to agents:
   - `deal_task(title, description, source)` → drops a card in the inbox
   - `get_task_status(id)` → todo / done / deferred (+ deferral count)
   - `list_dealt_tasks(source)` → the agent's own cards only
2. **Inbox ≠ deck.** Agent cards land in a server-side inbox table. The
   phone app, when an "Agent inbox" integration is enabled in Settings,
   pulls inbox cards into the local deck (they arrive face-down at the
   bottom of the pile, `source` badge showing who dealt them). The local
   store remains the only authority over ordering, deferral, completion.
3. **Status flows back opportunistically.** When the app is online it
   reports state changes for agent-sourced tasks (the existing
   `external_id`/`source` columns were built for exactly this). Agents
   poll `get_task_status`; webhooks can come later.
4. **Auth**: one bearer token per user, generated at inbox setup, shown as
   a QR/string to paste into agent config. Single-user simple; no accounts.

## Why this shape

- **Local-first survives**: offline behavior, privacy posture ("no data
  collected" stays true — the inbox is opt-in and user-operated), and the
  1.0 storage model are untouched.
- **The TaskStore seam already fits**: inbox pull is just another source
  feeding `createTask` with `source`/`externalId` set — the same interface
  a Todoist adapter will use. Building the inbox builds the adapter
  pattern.
- **Failure degrades gracefully**: server down → agents queue or error;
  the human's deck keeps working entirely.

## Open questions for Xian

1. **Inbox visibility**: do agent cards slide straight into the deck
   (bottom of pile), or does the deck show a discreet "2 new from agents"
   badge you accept first? (My lean: straight in, badge on the card —
   accepting is just flipping it.)
2. **Defer semantics for agents**: is "deferred 3×" a signal an agent
   should react to (re-scope? escalate? withdraw?), or none of its
   business? This could become One Job's most interesting API.
3. **Hosting**: the inbox needs an always-on home. Render free tier +
   Neon fits; or it rides along whenever sync (post-1.0 #7) gets built —
   inbox and sync want the same server.
4. **Priority order**: inbox-MCP before or after the Todoist adapter?
   They share the plumbing; MCP is more novel, Todoist more conventional
   utility.

## Build estimate (when green-lit)

- MCP server + inbox endpoints on the existing FastAPI app: ~1 session
- App-side inbox integration (Settings toggle + pull-into-deck + status
  reporting): ~1 session
- End-to-end demo (a Claude agent dealing a card that shows up in the
  deck): the fun part of session 2
