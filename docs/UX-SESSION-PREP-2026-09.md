# Pro-feedback session prep — the walk order + open design items

**For:** the conversational screen-by-screen session Xian asked for
(2026-09-10). His narration is the data; this doc is just the rails.
**Also carrying:** his three usability screenshots from launch week,
with status and my initial takes for the conversation.

## Refreshed 2026-10-04: what has moved since this was written (09-14)

**The app's UX has not changed since 09-14.** The only code since then
is the Siri sentence-case fix (`f733378`, not yet in a build), a
data-downgrade guard, and tests. So items 2–5 below are still open
exactly as written. What's new is around the app:

- **Siri / Shortcuts "Add Card" shipped in 1.1** (Pilot tester A's idea). She
  then built a Reminders → One Job shortcut on top of it. It's now
  step 3b in the walk.
- **Title Case from Siri:** fixed at the input layer, and it's in
  build 40, which is held. That's item 33 on the board (🔒 "ship 40?").
  It's a one-word answer if you want to give it in the session.
- **Two new topics**, items 6 and 7 below: the agent's deck, and the
  testing plan's one question that's yours.

### 6 · The agent's deck — YOUR THOUGHTS (xian, 10-03)
You said you've had a few thoughts on the "agent's deck" paradigm.
This is the live centre of three threads. (a) The test plan's
agent-heavy track is blocked only on the card exchange being raw.
(b) Themis's 09-29 correction says open items should live as cards in
your deck, each with when it opened and what would close it, and leave
when closed, rather than in a new list. (c) VISION covenant 3: any
export destination is one the user designates and owns. Design notes:
`CARD-EXCHANGE-DESIGN-NOTES-2026-09.md`. **Nothing is proposed here.
This slot is for your narration first.**

### 7 · Testing the forty ordinary testers — one decision, when you're ready
The recruiting plan is drafted (`TRACK-B-RECRUITING-PLAN-2026-09.md`).
It has four quick calls: waves of 8/12/20? pass-it-on through friends,
Candidate G first? communities in or out? thank-you as early pro access, not
money? Nothing is sent until you declare the program active.

 (2026-09-10, from real daily use)

### 8 · Which deck do voice-added cards go to? (from xian's build-40 test, 10-06)
With the app open, the fix in progress lands them in the deck you're
looking at. With the app closed, they currently land in whichever deck
you next open to. Alternatives: always the default deck, or a fixed
Inbox deck. It's a taste call, and either is quick to build.

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

### 4 · Regular-user feedback channel — FOR THE SESSION (Xian, 09-13)
His direction: freeform first, structure OFFERED not demanded. Sketch
to react to: a "Send feedback" row in Settings opening a pre-addressed
email whose body holds three deletable placeholder lines (What did you
expect? / What happened instead? / Steps, if you're willing). No
server, no form; TestFlight users also get native screenshot feedback.
1.2-sized once discussed.

### 5 · Defer is doing double duty — recurrence has no home (Xian, 09-15)
Reading his returned backup I called 80+ deferral counts the most
interesting signal R1.5 had seen. His correction: "a lot of those life
cards are recurring reminders." So defer is carrying two jobs — *not
now* and *again next week* — and the app cannot tell them apart. Two
consequences worth the session: (a) R1.5's deferral-depth metric
conflates friction with function, which will mislead the cohort read
unless we can separate them; (b) there is an unmet need here that
users are solving with a gesture, which is usually where a real
feature is hiding. Deliberately NOT proposing recurring-cards-as-a-
feature yet: the covenant is one card at a time and no chrome, and a
repeat scheduler is exactly the kind of thing that arrives as a date
picker. Worth designing rather than adding.

## The walk order (narrate anything; I'll capture everything)

1. Cold open — deck face-down state → tap to reveal
2. The active card: swipe right (complete), swipe left (defer), tap
   (details), edit title/description, autosave on blur
3. Add: empty-state form, arc-menu Add Task, + button
   3b. Add from outside: Siri "Add Card" / the Shortcuts action
   (and Pilot tester A's Reminders → One Job shortcut, if you've tried it)
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
10. The agent's deck: your thoughts (item 6), then the attention deck
    as you actually use it (rollup item 27)
11. Anything that annoyed you this week that the list above missed —
    the screenshots conversation
