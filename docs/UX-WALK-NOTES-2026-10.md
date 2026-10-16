# UX walk notes — xian narrates, Coral records (from 2026-10-11)

**How it works** (xian, 2026-10-11): a conversational walk, the
B-topic of whatever else is going on. One step at a time, until that
step is exhausted, then the next. The rails are in
`UX-SESSION-PREP-2026-09.md` ("The walk order"). xian's words are the
data; Coral's notes are marked as Coral's.

**Where we are:** step 2, opened 2026-10-12. xian has spoken on swipes and on the open card. Card shape agreed. Waiting for xian to say whether step 2 is exhausted.

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
- **xian, 2026-10-12, answering:** "yes meant Created" and "card
  shape agreed".
- *Asked next:* anything more on tapping and editing, or is step 2
  done.
- **Built 10-12 (Coral):** the open card is a card in the deck card's
  5:7 shape, a little larger. No headings, no Status, no Created, no
  Edit, Close, Save or Cancel buttons. Tap the title or the
  description to edit that element; it saves when you leave the field
  or close the card. The sub-deck is 75% wider than before and wears
  the deck's colour, as does the card's margin. A card that came from
  outside, or is done, shows one small grey line saying so. Checked
  with phone-sized screenshots. Live in the web app; the phone app
  needs a new build. Not yet seen by xian.
- **xian, 2026-10-13:** "go for build 43", "rebuild card feels good",
  "will test siri change on build 43".
- *Coral's notes:* step 2 is closed on "feels good". He saw it in the
  web app; build 1.1.1 (43) puts it on the phone. Anything he finds
  there on tap and edit is recorded under step 3.

## Step 3 · Adding a card

*Asked 10-13:* add a card or two as you normally would (the long
press, the arc menu, the form, where the card lands). What feels
right and what doesn't? Not yet answered.

### The open card on the phone (build 43), recorded here as agreed

- **xian, 2026-10-16, on build 43:** "I like the card experience much
  better, thanks. I have a few ideas for improvements: 1. We need at
  least a hint that the title and description are now editable.
  Perhaps thin light interior drop shadow appear? or ... well I'm a
  PM not a visual designer versed in the current vernacular so I am
  open to suggestion 2. I think the default height of the description
  in this view can be one line. high, so that the space for a subdeck
  is maximized. 3. If you agree then when tapping on the description
  to edit, its box could extend to cover the entire area below,
  temporarily hiding any subdeck." And: "I feel strongly about 1 and
  for 2 and 3 I am going more on gut and am open to persuasion.
  Definitely it already addresses the core goals of the update."
- **Built 10-16 (Coral), in the web app; the phone needs a build:**
  1. The title and the description each sit in a faint inset well
     (his interior shadow, with a light edge), so they read as fields
     before you tap. Editing deepens the same well.
  2. *Changed from his version:* the description is as tall as its
     text, so a one-line description takes one line, and it scrolls
     after about five lines. A fixed single line would make reading a
     long description a tap, and a tap now starts editing. The
     sub-deck takes the space that is left: about a third bigger
     than in 43, capped at half the card's width.
  3. As he described: while the description is being edited, its box
     fills everything below the title, and the sub-deck is hidden
     until he leaves the field.
  A sub-card (which can't hold a deck) keeps the full-height
  description. Checked with phone-sized screenshots; saving on leave
  and on close, and a blank title going back, all still pass.
- **xian, 2026-10-16, on point 2:** "you're probably right. my one
  concern is that maybe the subdeck shouldn't flex in size, idk."
  Then, after Coral's recommendation (a fixed size, about a third
  bigger than in 43): "agreed with your take on the fixed-size subdeck
  and its size."
- **xian, 2026-10-16, a new point:** "the design up to now does not
  deal well with huge long text blocks. The old github import brought
  in walls of text that just took over the screen... we need to make
  sure some sort of smart truncation happens at least for smart
  display, scrolling is supported if needed, etc."
- **Built 10-16 (Coral):** the sub-deck (and the ghost deck) is one
  fixed size on every card, 12rem high. The title, the description
  and the source line share one scrolling area above it, whose bottom
  edge fades when the text runs on. The open card keeps its 5:7 shape
  whatever the text. The card face already cut the description at 180
  characters and shrank the text to fit; checked with a GitHub-style
  wall of text (a six-line title, about 3,000 characters of Markdown
  with a long link): nothing wider than the screen, the text scrolls,
  and editing fills the card. With a title that long, only a faded
  line of the description shows until you scroll. Raw Markdown (`##`,
  `**`) still shows as typed: his call (see the board).
- **xian, 2026-10-16:** "1. go for 44 before the pilot update 2.
  render it please, just as you say. make sure we are documenting
  these choice and not just patching them. 3. ready for that next step
  in the walk when you are."
- *Coral's notes:* Markdown is built as recommended. Every rule about
  how a card shows itself (shape, face, open card, Markdown, Done
  list) is now written down, with who decided it, when and why:
  `docs/CARD-DESIGN.md`. Found while checking walls of text: the
  Done view let a long text stretch its card past the screen; fixed
  at the shared card shape. Build 44 is being made.
- *Asked (step 3):* on the phone, add two cards the way you normally
  would, one from the red + button and one from the long-press menu.
  Watch the form, the keyboard, and where each card lands. What felt
  right, and what didn't?
