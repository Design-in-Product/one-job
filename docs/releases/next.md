# Next phone build: changes since 1.1.1 (44)

Live on the web app as each lands; in the phone app from the next build
(waits on xian's go). When the build is cut, this becomes its release
note and the list starts empty again.

- **A card said to Siri while the inbox was draining is kept** (2026-11-08,
  `da6fccd`). Before, clearing the queue after the drain erased it.
- **A full phone no longer reports a saved card as failed** (2026-11-25).
  When storage was full, the save went through but the daily safety copy
  didn't, and the app said "Add failed" (a retry duplicated the card) and
  skipped the copy kept in iOS storage. Now only a failed save of the card
  itself reports failure; old safety copies are cleared before a new one
  is written. Tests: `localTaskStoreQuota.test.ts`.
- **Todoist sync** stays alpha (`?alpha=on`), not in store builds.
