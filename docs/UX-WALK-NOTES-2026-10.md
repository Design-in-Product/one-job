# UX walk notes — xian narrates, Coral records (from 2026-10-11)

**How it works** (xian, 2026-10-11): a conversational walk, the
B-topic of whatever else is going on. One step at a time, until that
step is exhausted, then the next. The rails are in
`UX-SESSION-PREP-2026-09.md` ("The walk order"). xian's words are the
data; Coral's notes are marked as Coral's.

**Where we are:** step 2, opened 2026-10-12. xian has spoken on swipes and on the open card. One follow-up is out: card shape or whole screen.

| Step | Topic | State |
|---|---|---|
| 1 | Cold open: deck face-down, tap to reveal | Narrated 10-12; xian moved on to step 2 |
| 2 | The active card: swipes, tap, edit | **Open**: swipes, and the open card, given 10-12; one follow-up out |
| 3 | Add (and 3b, add from outside) | Partly given 10-12 (see below) |
| 4 | Into a card: the interior deck | Not started |
| 5 | Multi-deck | Not started |
| 6 | The rooms: Done, Archive, Trash | Not started |
| 7 | Long-press arc menu | Not started |
| 8 | Settings | Not started |
| 9 | Integrations | Not started |
| 10 | The agent's deck and the attention deck | Partly given 10-11 (see below) |
| 11 | Anything else that annoyed you | Not started |

## Already said, ahead of its step

- **Step 10, attention deck (10-11):** "Answering from the deck feels
  ambiguous. The deck is for me completing tasks. I can't swipe it
  till I answer and I can't answer directly from the deck. Cards tell
  me what to do but are not currently actionable unless the
  description contains a link or affordance."
- **Step 10, agent's deck (10-11):** see
  `AGENT-DECK-VIA-INTEGRATIONS-2026-10.md`.
- **Step 3b, Siri (10-06):** with the app open, cards needed a restart
  to appear and landed in the wrong deck. Fixed in build 41.
- **Step 3b, Siri (10-12, retest on build 41):** "good news: card
  appears (under the current card) as designed. bad news: UI still
  says it will appear after restart, as does Siri report on
  completion. curve ball: when I add a new card manually it appears
  on top. I either let it be my "one job" or I immediately defer it
  to the bottom. I kind of want this to work the exact same way and
  it's odd that the new card is "hidden". (I know the reasoning but I
  think it fails in reality as an experience)."
  - *Coral's notes:* the stale wording is two strings in the Siri
    intent (its description and its spoken reply); the web app says
    nothing of the kind. Both are corrected in the source and reach
    the phone with the next native build. The placement point
    questions the 2026-09-12 ruling that cards from outside join
    behind the top card. Board item 36 carries the question.
- **Step 3b, the ruling reversed (10-12):** "I am reversing that
  ruling. It was persuasively argued but my own experience has now
  convinced me it represents "optional complexity" that does not
  provide sufficient value. I just think we overengineered it and now
  that it's instant there is no need." On arrivals in bulk: "yes,
  maybe, to bulk arrivals but it might be better to say they come in
  as a deck inside a new card and that card may be on top till sorted
  elsewhere to avoid the need for even this exception."
  - *Coral's notes:* done in build 42. An import already lands in a
    deck of its own, named for the service, so nothing uses "behind
    the top" any more and the option is removed. His deck-inside-a-
    card idea is recorded in the roadmap, not decided.

## Step 1 · Cold open

**xian, 2026-10-12:** "Recall I have a pro account with multiple
decks. When I open it I see the last one I was on and the color
pleases me as well as knowledge I have other decks and can skim this
one or all of them to see or add things. This part of the experience
is very good for me, closely meets my design vision, and is in line
with some of the future roadmap canvas concepts rooted in the oldest
design prototypes (I should dig them up and add them to the archive
if I never did that in the first place)."

- *Coral's notes:* two typos in his message are corrected in the
  quote ("muiltiple", "was one"). What he names as good: returning to
  the last deck, the deck's colour, and knowing the other decks are
  there to skim or add to. He connects it to the canvas ideas in the
  oldest prototypes, which he may add to the archive; that is his to
  do, not a board item.
- *Follow-up asked (10-12):* the face-down deck and the tap to reveal.
  He described what he sees once the deck is showing, and didn't
  mention that moment.
- **xian, 2026-10-12, on that follow-up:** "the moment of revealing
  the first card feels "fun"".
- *Asked next:* whether step 1 is exhausted.

## Step 2 · The active card

**xian, 2026-10-12:** "Feedback on swiping, tapping, and editing a
card is going to be involved. The swipes are pretty good. The swipe
to the right and swipe to the left are definitely release-ready from
my point of view. Tapping and editing have a lot of things that need
to be desired and I'm going to walk through that in my next response
to you on this thread"

- *Coral's notes:* swipe right and swipe left are release-ready in
  his view. Tap and edit are where the work is; his walk-through is
  to come. No follow-up asked; waiting for it.

**xian, 2026-10-12, with a screenshot of an open card** (title, a
"Description" heading and text, a "Status" heading with an "Active"
pill, a "Created" heading with "about 2 hours ago", a small sub-deck
tile labelled "Sub-tasks", then full-width Edit and Close buttons, in
a white sheet over a dimmed deck):

"The layout is too fussy. Status isn't really a thing I need to see —
it feels redundant, same with creative… i'd remove those. the subdeck
should be much bigger and it should inherit the color of its parent
deck.

The edit button feels redundant. It should be like a wiki where
tapping on any element makes it editable.

Also I still want it to feel like a card or a card shape, or it
should take over the whole screen but right now is it's in between
those two feels.

This has been my feedback for some time so it's good to get to it!"

- *Coral's notes:* I read "creative" as "Created", the heading under
  Status in his screenshot. Five asks: (1) remove Status; (2) remove
  Created; (3) the sub-deck much bigger, in its parent deck's colour;
  (4) no Edit button, tap any element to edit it in place; (5) a
  real card shape or the whole screen, not the sheet in between.
  Nothing is built yet.
- *Follow-up asked (10-12):* card shape or whole screen.
