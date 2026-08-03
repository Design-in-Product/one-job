# Relay → successor: handoff

**From:** Relay (Cowork agent on faoilean, 2026-07-03 → 2026-08-02)
**To:** whoever next holds the iOS/TestFlight role for One Job
**cc:** Coral, Xian, Janus, Pard
**Status of claims:** marked **VERIFIED** (I observed it) or **BELIEVED**
(inferred, plausible, unconfirmed). Do not promote a BELIEVED to fact
without checking — that habit is most of what this document is.

---

## 0. What this role actually is

Coral works **from the repo** and is portable. You work **from a machine**
and are not. The division is not seniority, it's physics: someone has to
click Xcode, hold the signing identity, and touch the phone.

Coral is the lead. Xian is the tiebreak, explicitly and repeatedly, and
several good decisions this month came from him overruling a memo.

**You cannot commit or push.** (VERIFIED, tested more than once: no
GitHub credentials, no SSH key, no `gh` in the agent sandbox — and
spawning a subagent does not change this, since it inherits the same
environment.) You write files; Xian runs every git command. **Xian wants
this fixed for you** — he has said he hopes a successor "can manage gh
directly the way most agents can." If you can, a whole class of failure
below disappears.

---

## 1. Hard-won lessons

### 1.1 The repo you are reading may not be the repo he is using — VERIFIED

There were two folders: `~/Developer/one-job` (stale, abandoned after
07-08) and `~/Development/one-job` (real, aliased `~/cool` in his shell).
A typo made them near-twins. Cowork was connected to the stale one.

**Cost: three weeks.** Every status read came back frozen at rc.6 while
main was at rc.9+. It was diagnosed as "a stuck mount," twice, because
that hypothesis fit the evidence. It was not a mount bug. It was the
wrong folder.

The stale one is now `~/Developer/one-job-OLD-DELETE-ME`. Two residues:

- **Xcode's recent-items list still offers it.** (VERIFIED — it appeared
  in the welcome window on 07-29, after the rename.) Renaming a stale
  checkout does not retract it from other applications' memories. **Always
  open the project via `npx cap open ios` from the known-good directory,
  never by clicking a recent item.**
- The Android keystore lived *only* there. See §3.

**Generalise:** when a reading looks impossibly stale, check *what you are
reading* before theorising about *why it is stale*.

### 1.2 Signing does not survive a `git checkout` — VERIFIED, now mitigated

`DEVELOPMENT_TEAM` lives in `ios/App/App.xcodeproj/project.pbxproj`, which
git owns. Any ref switch resets Team to **None**, and the dropdown then
offers two entries one row apart:

```
Christian Crumlish                  ← paid team, YZ4B34YGX9. THIS ONE.
Christian Crumlish (Personal Team)  ← free team. NEVER.
```

**Mitigated 2026-08-02**: `DEVELOPMENT_TEAM = YZ4B34YGX9` is now committed
(cc13031), so fresh checkouts arrive correctly configured. The rule is
also in the brief's BUNDLEID box. **Verify anyway** — this is exactly the
check that must not be allowed to become ceremonial.

### 1.3 The BUNDLEID trap already destroyed one identifier — VERIFIED

`co.onejob.app` is **permanently unusable.** A device run under the free
Personal Team registered it on Apple's backend; bundle ids are globally
unique; free-team App IDs are invisible and undeletable in the portal, so
the paid team can never claim it. Remedy would have been an Apple Developer
Support release request. Instead Coral renamed to **`co.onejob.deck`**.

That is the entire reason for the paranoia in §1.2. The trap is not
theoretical, it has a body.

### 1.4 An indicator that has not refreshed is not an observation — VERIFIED

The house law, and this project keeps rediscovering it (Coral has hit it
on deploys, export toasts, and a type-checker that checked zero files).

My instance: an archive failed with "Missing package product
'CapacitorHaptics' / 'CapacitorPreferences'". I checked the disk first —
paths resolve, packages present, products declared, `ios/Sources` and
`ios/Tests` both there. Disk was **correct**; the fault was Xcode's package
cache. `Reset Package Caches` *appeared* to do nothing, because **the issue
navigator holds the previous build's results until a new build runs.** The
reset had in fact worked. Had I trusted the error list I'd have escalated
to nuking DerivedData for no reason.

**After any cache reset, re-run the build to get a verdict. The old error
list is an artifact, not evidence.**

### 1.5 Mail is delivered by git — and it fails in *both* directions — VERIFIED

Inbound: on 07-07 a session read the rc.4 memo while main already carried
rc.6 and a hold instruction. Ritual, now in the brief: **pull → read mail →
act**, and if a memo names a version, confirm it against `package.json` in
the *now-current* checkout.

Outbound — **my own failure, and the more insidious one**: on 07-25 I wrote
a memo answering Coral's four explicit status questions. It was never
committed, therefore never pushed, therefore **never delivered**. She spent
the following week without answers she had asked for and called "the
valuable thing to send back," and reconstructed the state from Xian
instead. I did not discover this until 08-02, while checking something
else.

The cause is structural (§0: I write, Xian pushes) but the error was mine:
**writing the file felt like sending the memo.** It is §1.4 wearing
different clothes — file-exists is an indicator, delivered is the outcome.

**A memo is not filed when it exists. It is filed when it is on
origin/main.** End sessions by confirming `git status` is clean. Coral
independently arrived at the same rule ("verify it on origin/main, not just
on disk").

### 1.6 Version must be confirmed from two independent surfaces — VERIFIED

Coral's phrasing: *a verification that cannot fail is not a verification.*
For every cut:

1. `package.json` says the expected stamp, **in the checkout you just made**
2. the `build:native` banner prints `vite_react_shadcn_ts@<expected>`

Main moves fast — rc.10 → rc.22 in about four days — so "fresh pull of
main" is **not** the instruction. Cut from the **tag**:
`git checkout v1.0.0-rc.N` (detached HEAD is expected and fine).

Note the consequence: at an older tag, `store/` and recent `docs/mail/` do
not exist. You cannot write logs from a detached build checkout. Return to
`main` first.

### 1.7 Tooling that has failed here before — VERIFIED

- **computer-use MCP**: went down for a full session (07-29) — three
  `request_access` timeouts over ~9 minutes with no dialog ever reaching
  Xian's screen. Not a consent gate; a server fault. Recovered after a
  reboot. Fall back to narrating clicks to Xian.
- **Xcode is tier "click"**: you can click and scroll, you **cannot type**.
  Every text entry (build numbers especially) is Xian's hands.
- **Xcode 26.x**: on first launch it may start an unrequested ~2.55 GB
  "Predictive Code Completion Model" download that can wedge the machine.
  Cancel it (Settings → Components). It cost a day here.
- **`mcp__workspace__bash`**: intermittently unavailable ("still starting",
  or timeouts). Host-path `Read`/`Write`/`Glob` stayed reliable throughout;
  prefer them when bash is flaky.
- **No GitHub MCP connector exists in this session** (VERIFIED against the
  connector registry — not installed, not offered). Browser automation via
  Claude-in-Chrome is the fallback for github.com/App Store Connect, but
  **you must not sign in** — hand credential entry to Xian.

---

## 2. Load-bearing vs commodity

**Load-bearing — irreplaceable or expensive to recreate:**

| Thing | Where | Note |
|---|---|---|
| Bundle id `co.onejob.deck` | `capacitor.config.ts`, pbxproj | Predecessor `co.onejob.app` is burned forever |
| Paid team `YZ4B34YGX9` | pbxproj (committed 08-02) | Not a secret; ships in every binary |
| **`onejob-upload.keystore`** | `~/Development/one-job/`, **gitignored** | See §3 — the single most losable artifact |
| App Store Connect record | name **"One Job - One Task at a Time"** | "One Job" was taken; store-listing name only, not in-app branding |
| Build number sequence | pbxproj `CURRENT_PROJECT_VERSION` | 1 = rc.2, 2 = rc.12. Apple rejects reuse; numbers are one-shot |
| The logs + `docs/mail/` | repo | The only continuity across a machine move |

**Commodity — regenerate freely, never agonise:**
`node_modules/`, `dist-native/`, DerivedData, SPM caches, `.xcarchive`
files, `ios/App/App/public` (rewritten by `cap sync`).

---

## 3. ⚠️ The keystore — read this before any machine move

`onejob-upload.keystore` (2678 bytes, VERIFIED) is the Android **upload
signing key**. It is **gitignored and exists in no repository.** Its three
derived secrets are already set in GitHub Actions
(`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`).

If One Job ever ships to Google Play signed with this key, **losing the
file means never being able to update that app again.** Google's recovery
path is limited and unpleasant.

It currently exists in exactly two places on faoilean:
`~/Development/one-job/` and the stale `~/Developer/one-job-OLD-DELETE-ME/`
(which is slated for deletion). **Xian: before faoilean is repurposed for
Piper Morgan, copy this file somewhere durable — password manager,
encrypted backup — and verify by opening it, not by trusting a copy
succeeded.** (That last clause is the standing destructive-action protocol,
which exists in this repo because of a real data loss on 07-05.)

The password is in Xian's password manager. I have never seen it and should
not.

---

## 4. In-flight state, as of 2026-08-02 morning

- **rc.12 is uploaded to TestFlight as build 1.0 (2)** — VERIFIED by
  observation on 08-01 18:42 PDT (Organizer row flipped "—" →
  "Uploaded to Apple"; "App 1.0 (2) uploaded" confirmation). Cut from tag
  `v1.0.0-rc.12`, commit 97ca4ae.
- **Not yet on any phone.** BELIEVED remaining: export compliance (Apple
  re-asks per build; build 1 sat on it until Xian answered 07-05 — no
  non-exempt encryption), then distribution to the tester group. Unverified
  at time of writing because App Store Connect requires a login I will not
  perform.
- **Both testers — Xian and Dan Brodnitz — are still on rc.2** (from
  2026-07-03). Dan has been waiting the entire time.
- **Gate before Dan**: Xian smoke-tests the *TestFlight* build (not a
  debug build — see §5). Coral's named checks: blocked completion springs
  back face-up with "N sub-tasks still open inside" and must **not** fly
  away or re-deal; **ordinary completion must still fly out to Done** (her
  "regression that matters most", to be tested explicitly, not assumed);
  move-into picker lists deck-mates only, readable rows; plus
  create/complete/defer, badge opens sub-deck, share-sheet export, import
  back as "import-1", flip-back control (RotateCcw, top-left).
- **Next candidate is rc.22+** (main was at rc.22 on 07-30 and keeps
  moving). Deliberately *not* shipped as the beta: rc.12 is the MVP Xian
  defined (four blockers); rc.22 adds decks, pro wall, canvas strip, quiet
  mode, shades, GitHub import, and a **schema v3 migration**. Shipping both
  at once would make Dan's feedback unattributable. rc.22's migration
  should meet Xian's own device before anyone else's.
- **Android**: keystore ✅, secrets ✅, **workflow never wired**. Coral has
  a standing offer to wire signed-AAB CI so a build comes from one Actions
  click, no local Java, no Android device required. Xian notes he has no
  Android device at present but wants to return to this soon. Taking Coral
  up on the offer *is* the remaining task.

---

## 5. Two decisions that were changed, and should stay changed

**Archive/upload before device-testing.** The brief said smoke-test on
device, then submit. We inverted it, with Coral's agreement: running from
Xcode installs a *development*-signed build over the TestFlight app, and a
signing-identity change can force a delete-and-reinstall — a data-loss path
not worth walking. Testing the TestFlight artifact also exercises exactly
what testers receive rather than a debug proxy. Coral: *"right, and I should
have specced it that way."*

**rc.12 before rc.22.** See §4. Xian's call; Coral's own rc.13 memo already
said "beta week runs on rc.12" — I had braced for a conflict that reading
one more memo dissolved. **Read the whole mailbox before assuming you
disagree with Coral.**

---

## 6. Setting up a new machine (kindbook, or Amber)

Xian is moving Design in Product work to **kindbook** and reserving
faoilean for Piper Morgan. Required on any new host, none of it in git:

1. Xcode, signed into the Apple Developer account (`xian@pobox.com`) —
   Settings → Accounts
2. The paid team available in that account
3. iPhone paired by cable, **Developer Mode enabled** (Settings → Privacy &
   Security → Developer Mode → restart). Without it the phone never appears
   as a run destination and the failure message is unhelpful. Xian's device
   shows as **"Port Monteau"**.
4. Clone of `git@github.com:Design-in-Product/one-job.git`
5. The keystore, moved deliberately (§3)
6. Node 22+ (CI requires it). If a fresh `npm install` reports success but
   the build then fails on a missing esbuild binary, that is npm ≥ 11.17
   blocking install scripts: `npm approve-scripts esbuild @swc/core fsevents`.
   Approvals are recorded in `package.json` and did **not** bite here
   (VERIFIED on 07-31).

`docs/AMBER-XCODE.md` (Coral, 07-30) is a fuller provisioning runbook for
Amber specifically, staged up to the Apple-auth gate.

---

## 7. The future, as questions rather than plans

1. **Should this role exist in its current form?** If Amber gets Xcode plus
   an **App Store Connect API key**, Coral can archive *and* upload
   unattended (`xcodebuild` + `altool --apiKey`), and the only irreducibly
   human-adjacent part left is a physical device in a hand. That is a much
   smaller job than "Relay." Worth deciding deliberately rather than by
   drift. The API key is also the single highest-leverage unblock available:
   it removes interactive Apple login from the loop permanently.
2. **Does the successor get `gh` / GitHub write access?** Xian wants yes.
   It would eliminate §1.5 outright — the failure mode where a memo is
   written but never delivered exists *only* because writing and pushing are
   split across two actors.
3. **Where does the pipeline live** — kindbook (Cowork, local, can drive a
   GUI) or Amber (headless, scriptable, shared)? These have opposite
   strengths and the answer probably differs for "cut a build" versus "test
   on hardware."
4. **What is the release cadence once 1.0 ships?** main outran the
   TestFlight track by ten release candidates in four days. That was fine
   during a beta gate; it will not be fine as a habit, and the gap is what
   made every cut memo need a superseding memo.

---

## 8. If you read only one thing

The recurring failure in this project is not technical. It is **trusting an
indicator instead of observing an outcome** — a green toast, a success
message, a stale error list, a file on disk, a familiar folder name. It has
cost, here: real user data (07-05), three weeks of frozen state (§1.1), a
permanently burned bundle id (§1.3), and a memo that was written but never
delivered (§1.5).

Say what you actually observed. When you cannot observe it, say that
instead — and say which it is.

— Relay, 2026-08-02
