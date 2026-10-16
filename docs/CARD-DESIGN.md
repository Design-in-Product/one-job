# One Job — how a card shows itself

**Started:** 2026-10-16, Coral, on xian's instruction: "make sure we
are documenting these choices and not just patching them."

**What this is:** the standing record of how a card displays its
content: the face in a deck, the open card, and the Done view. Each
rule says what it is, who decided it and when, why, and where it
lives in the code. Change a rule here in the same commit as the code.
Gestures (tap, hold, swipe) are in `GESTURES.md`. The words behind
each decision are in `UX-WALK-NOTES-2026-10.md`.

**Status:** live in the web app since 2026-10-16. The phone app gets
it in build 1.1.1 (44).

## 1. Every card is one shape

| Rule | Decided | Why | Code |
|---|---|---|---|
| Every card is 5:7, a playing card, and keeps that shape whatever it holds. | Since the first deck; made strict 2026-10-16 (Coral) | A card that changes shape stops reading as a card. A long text in the Done view had stretched the card past the screen, because an `aspect-ratio` box grows to fit its content unless its minimum height is zero. | `CARD_GEOMETRY` in `src/components/FlipCard.tsx` (with `min-h-0`). Every card face uses it, the Done view included. |
| The open card is 5:7 too, a little larger, not a sheet and not the whole screen. | xian, 2026-10-12 ("card shape agreed") | It is the same card, come forward. | `TaskDetails.tsx`, the `DialogContent` class |

## 2. The face in a deck

| Rule | Decided | Why | Code |
|---|---|---|---|
| The title and the description are sized to fill the face. | 2026-08 (fit text) | One card at a time: the face should read from arm's length. | `useFitText` in `TaskCard.tsx` |
| The description is a preview: plain text, Markdown marks dropped, cut on a word at 180 characters with "…". | Cut: earlier. Plain text: xian, 2026-10-16 (board 48) | The face is for recognising the card, not reading it. Marks like `##` are noise there. | `previewText` in `src/domain/markdown.ts`; used by `TaskCard.tsx` |

## 3. The open card

| Rule | Decided | Why | Code |
|---|---|---|---|
| No headings, no Status, no Created, no Edit button. | xian, 2026-10-12 | "The layout is too fussy." | `TaskDetails.tsx` |
| Tap the title or the description to edit it in place. It saves when you leave the field or close the card. A title left blank goes back to what it was. | xian, 2026-10-12 ("like a wiki"); saving rule 2026-07-06 | Editing shouldn't be a mode you enter. Navigation must never lose an edit. | `TaskDetails.tsx` (`flushPendingEdits`); `pendingEdit` in `src/domain/cardEdit.ts` |
| An editable field sits in a faint inset well, which deepens while you edit. | xian, 2026-10-16 (he felt strongly; his idea of an interior shadow) | Without a hint, nobody would know the text could be tapped. | `well` and `wellEditing` in `TaskDetails.tsx` |
| The description's well is only as tall as its text. | xian asked for a single line; Coral modified it; xian: "you're probably right" (2026-10-16) | A fixed single line would make reading a long description a tap, and a tap now starts editing. | `TaskDetails.tsx` |
| Title, description and the source line scroll together, and the bottom edge fades when there is more. | xian, 2026-10-16 ("walls of text... took over the screen") | A wall of text (a GitHub issue, say) stays inside the card, and the fade shows it scrolls. | the scrolling `div` in `TaskDetails.tsx` |
| The sub-deck is one fixed size on every card (12rem high, 5:7), in its parent deck's colour. With no sub-deck yet, a dashed card of the same size starts one. | Bigger and coloured: xian, 2026-10-12. Fixed size: xian, 2026-10-16 ("agreed... fixed-size subdeck and its size") | A deck that changes size from card to card reads as a different object each time. | `h-48 aspect-[5/7]` in `TaskDetails.tsx` |
| While you edit the description, it fills the card below the title and the sub-deck is hidden. | xian, 2026-10-16 | The keyboard takes half the screen; writing needs the room. | `writing` in `TaskDetails.tsx` |
| Known edge: with a very long title (six lines), only a faded line of the description shows until you scroll. | Coral, 2026-10-16, said to xian, not changed | Cutting the title in the open card would hide part of it in the one place you go to see all of it. | — |

## 4. Markdown

xian, 2026-10-16 (board 48): "render it please, just as you say."
Text from GitHub and Todoist often carries Markdown.

| Where | What shows | Why |
|---|---|---|
| The face, and the Done list | Plain text: marks dropped, list numbers and bullets kept, links as their words. | Recognition, not reading. |
| The open card, reading | Headings (as bold labels, not big titles), bold, italics, inline code, code blocks, bulleted and numbered lists, task boxes (☑ ☐), quotes, rules, and links you can tap. | Imported text was written to be read this way. |
| The open card, editing | The text exactly as typed, marks and all. | What is stored is what was written. Rendering never changes the saved text. |

Safety rules, each tested in `src/domain/__tests__/markdown.test.ts`:

- **Nothing is ever treated as HTML.** The parser makes plain data
  and the UI builds React elements from it (`MarkdownText.tsx`).
  `<b>` shows as the text `<b>`.
- **Links go only to the web or to mail** (`http:`, `https:`,
  `mailto:`). Anything else, such as `javascript:`, shows as its
  words with no link. Links open in a new page and don't start an
  edit.
- **Images are never loaded.** `![a chart](…)` shows as "a chart",
  linked when the address is safe. Loading a picture from imported
  text would tell its host when you looked at the card.
- **Nothing typed is dropped.** An unclosed code block runs to the
  end of the text.

Left out on purpose: tables, footnotes, nested lists, and HTML. They
are rare in task text, and each would add more code than it's worth.
Add them here first if that changes.

Code: `src/domain/markdown.ts` (parsing, `previewText`),
`src/components/MarkdownText.tsx` (rendering).

## 5. The Done list

| Rule | Decided | Why | Code |
|---|---|---|---|
| The list shows a preview of the description (plain text, at most 140 characters and three lines), never the whole text. | xian, 2026-10-16 (walls of text) | An imported issue body would fill the screen. | `CompletedTasks.tsx` |
| The Done, Archive and Trash rooms show cards in the shared card shape. | 2026-10-16 fix (Coral) | See §1. | `ChainView.tsx` uses `CARD_GEOMETRY` |
