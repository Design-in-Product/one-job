# Pro-feedback session prep — the walk order + open design items

**For:** the conversational screen-by-screen session Xian asked for
(2026-09-10). His narration is the data; this doc is just the rails.
**Also carrying:** his three usability screenshots from launch week,
with status and my initial takes for the conversation.

## His three reports (2026-09-10, from real daily use)

### 1 · Toasts under the iOS reserved area — ✅ FIXED (rc.40)
Top-center toasts rendered beneath the status bar clock in the native
app (viewport-fit=cover extends the webview under it). Now offset by
`env(safe-area-inset-top)`; web unchanged.

### 2 · Empty deck state deserves a real design — FOR THE SESSION
His read: it should show the deck's name, maybe a light wash of the
deck's color — "a spare screen that deserves a real design." His
spitball: every deck always holds at least one card, so an "empty"
deck shows one blank card ready for filling.

My initial take, for argument: deck name + color wash feels clearly
right (the empty state is currently deck-anonymous — with multiple
decks you can't tell WHOSE caught-up you're looking at, and the peeks
on either side make the anonymity stranger). The always-one-blank-card
idea is the more interesting fork: it makes the deck literally never
empty (nice metaphor continuity — a real deck has card backs even when
nothing's dealt) but it trades away the reward moment — "You're all
caught up 🌟" is the emotional payoff the whole app aims at, and a
blank card waiting to be filled quietly converts *done* into *next*.
Possible synthesis: keep the caught-up moment as the FACE of an
always-present blank card — tap it and it becomes the add form. Worth
sketching live.

### 3 · Cards in the rooms render irregular and weird — FOR THE SESSION (investigation first)
His Archive screenshot: "shift ux / sept 24-25" auto-sized to enormous
type, gray, awkward. The title auto-sizing was designed for the ACTIVE
card (one card, fill the space); in the rooms it fights the sift
layout — long titles go giant, short ones don't, so consecutive cards
have wildly different type scales. Also visible in his shot: Done (50)
/ Archive (62) — the rooms now hold real volume, which the sift design
never saw at scale. My lean: rooms cap the type scale (rooms are for
scanning, not focus), but I'll bring measurements to the session.

## The walk order (narrate anything; I'll capture everything)

1. Cold open — deck face-down state → tap to reveal
2. The active card: swipe right (complete), swipe left (defer), tap
   (details), edit title/description, autosave on blur
3. Add: empty-state form, arc-menu Add Task, + button
4. Into a card: sub-deck badge → interior → nested add → blocked
   completion ("finish what is inside") → back out
5. Multi-deck: Decks… menu, switch, create, rename, move card between
   decks, the canvas peeks at the edges
6. The rooms: Done → Archive → Trash, sift gestures (swipe ↓/↑),
   un-done / restore paths, permanent delete confirmation, search
7. Long-press arc menu: every entry, Undo behavior
8. Settings: backup export → OPEN THE FILE → import round-trip, quiet
   mode, usage panel + share summary, version line
9. Integrations: GitHub import (repo picker, dedupe), demo labeling
10. Anything that annoyed you this week that the list above missed —
    the screenshots conversation
