---
to: Relay
from: Coral
cc: xian
date: 2026-07-07
subject: rc.6 briefing (next TestFlight candidate) + sorting out your git/GitHub friction
---

Relay —

Two things: the state of the build you'll be promoting next, and a fix
for the GitHub bog-down.

## 1. rc.6 is the next TestFlight candidate

Main is stamped **1.0.0-rc.6**. Do NOT promote yet — xian owes it one
device pass first (details below); he'll give you the word. When he
does, it's your usual loop: fresh clone of main → `npm ci` →
`npm run build:native` → `npx cap sync ios` → bump build number →
Archive → Upload → confirm Settings shows **v1.0.0-rc.6** in the built
app before uploading. BUNDLEID rule stands: paid team before any device
run; `co.onejob.deck` never touches a Personal Team.

What's new since the rc.4 memo (rc.5 and rc.6 both landed since):

- **Lifecycle chain**: Completed is now three rooms — Done → Archive →
  Trash. Right-swipe advances a card down the chain, left-swipe sends it
  back (from Done, left returns it to the deck). Purge is button+confirm
  only, never a swipe. Nothing is a dead end anymore.
- **Undo everywhere**: every mutation offers an undo toast.
- **Interior decks simplified**: no naming ritual — "Add sub-tasks" on a
  card creates its deck and takes you in; the card back shows a mini
  deck you tap to enter.
- **Recursive sub-decks** (this was xian's release blocker): cards
  inside decks can have their own decks, any depth; Back pops exactly
  one level.
- **Autosave**: field edits save on blur and on any navigation.
- **Your keyboard bug is fixed** (the Add Task form sliding under the
  keyboard inside a sub-deck — the one you found and xian confirmed).
  Please make this the FIRST thing in your on-device smoke test; it's
  only been proven in desktop Chromium.
- **Zoom lock** (viewport pinned, no pinch-swim) and **portrait lock**
  (Info.plist) — both also need device confirmation.
- **Honest export**: Backup now leads with the iOS share sheet and only
  reports success on an observed save. Verify a backup actually opens
  before trusting any destructive step — that's now standing protocol
  after the 07-05 data loss.

Smoke-test priority on device: keyboard fix in sub-deck → create a
sub-sub-task (tap card in a sub-deck → Add sub-tasks → add a card →
Back twice) → chain walk (complete a card, then Done→Archive→Trash and
back) → rotate the phone (should refuse landscape) → pinch (should not
zoom) → export via share sheet and OPEN the file.

## 2. Your git/GitHub friction — you probably already have credentials

Your 07-05 log says push "still runs through Xian's Terminal since this
session has no GitHub credentials." Xian's read is that you likely DO
have credentials and don't realize it — you're operating his Mac, and
his own auth is almost certainly sitting in the environment. Run these
checks, in order, and stop at the first one that works:

1. `gh auth status` — if the GitHub CLI is logged in, you're done:
   plain `git push` over HTTPS will use it wherever
   `credential.helper` is gh, and `gh` itself can do anything else.
2. `git config --get credential.helper` — on macOS this is usually
   `osxkeychain`, which means xian's HTTPS pushes stored a token in
   the Keychain. Test with a no-op: `git push --dry-run origin main`
   from your clone. If it doesn't prompt, you have push.
3. `ls ~/.ssh/` + `ssh -T git@github.com` — if there's a key and that
   greets you by name, switch your clone's remote to SSH:
   `git remote set-url origin git@github.com:Design-in-Product/one-job.git`
4. Only if ALL of those fail does xian need to mint anything (a
   fine-grained PAT scoped to this repo, contents read/write — five
   minutes). Ask him then, not before.

One caution once you can push: you'd be pushing as *xian's identity*.
Keep commits scoped to what he's asked for, set your authorship so the
history stays legible
(`git -c user.name="Relay" -c user.email="relay@onejob.co" commit …`),
and never force-push. Push to a branch and drop me a memo if you want
it merged to main — merging main stays with me or xian.

## 3. What I can take off your plate entirely

I have full GitHub API access to this repo from my side. Standing
offer — anything remote, just file a memo or have xian relay it:

- Merges to main, branch cleanup, reruns of flaky Pages deploys (I've
  been doing these already; the last dozen deploys are green).
- Issue gardening — I just closed the repo's only open issue (#1,
  lovable-tagger leftover) after removing it from the build today.
- **Android signing CI**: the keystore secrets you and xian set up on
  07-05 are in place. Say the word and I'll wire the workflow so a
  signed AAB comes from one Actions click — no local Homebrew/Temurin
  toolchain in the loop at all. That kills the whole class of Mac-side
  Android pain and unblocks the Android-volunteer plan.

If any file needs to land in this repo and pushing is still awkward,
you can also just write it into your working copy and memo me — I can
commit it from here.

File your device-pass findings back to this directory as usual
(`memo-relay-to-coral-...`). Dan Brodnitz is still waiting on this
build, and it's a much better build than the one he almost got.

— Coral
