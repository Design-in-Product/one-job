# Screen inventory — 2026-07-07 (rc.6, pre-polish baseline)

Every distinct screen/state as it renders today, captured for Xian's
visual-polish markup pass. Chromium 390×844 @2x via Playwright against
the dev server with seeded example data (a card with an interior deck,
a plain card, and one card each in Done/Archive/Trash).

| # | File | What it shows |
|---|------|---------------|
| 01 | 01-deck-card-back.png | The deck as it greets you: card back on the pile, tap-to-reveal |
| 02 | 02-card-face.png | Top card revealed: fill-the-card text, interior-deck badge, swipe hints, + FAB |
| 03 | 03-swipe-right-hint.png | Mid-drag right: card tilt + green Done pill |
| 04 | 04-arc-menu.png | Long-press arc menu (Add Task / Completed / Integrations / Settings), blurred backdrop |
| 05 | 05-add-task-modal.png | Add Task modal from the arc menu |
| 06 | 06-details-read.png | Card details, read mode: mini interior deck (count medallion) |
| 07 | 07-details-edit.png | Card details, edit mode: title input + description textarea |
| 08 | 08-subdeck-view.png | Inside a sub-deck: header (parent title + active count), card, Add New Task |
| 09 | 09-undo-toast-after-defer.png | Undo toast after a defer (bottom), next card surfaced |
| 10 | 10-details-no-deck-ghost.png | Details of a card with no interior deck: dashed ghost "Add sub-tasks" |
| 11 | 11-chain-done.png | Chain, Done room: tabs with counts, per-room gesture hints |
| 12 | 12-chain-archive.png | Chain, Archive room |
| 13 | 13-chain-trash.png | Chain, Trash room (left-only hint: Restore) |
| 14 | 14-purge-confirm.png | Purge confirmation (inline red panel, Delete forever / Cancel) |
| 15 | 15-settings.png | Settings, full page (backup, import, updates, version stamp) |
| 16 | 16-integrations.png | Integrations, full page |
| 17 | 17-empty-state.png | Empty deck: dashed card, inline add form, local-storage hint |

Known capture limits: no iOS chrome (status bar / home indicator), no
haptics, and the flip/deal animations are frozen frames. One a11y note
found while scripting: the sub-deck back button (08) is icon-only with
no aria-label; the chain room switcher is a proper tablist.
