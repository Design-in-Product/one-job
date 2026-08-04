# Relay migration plan — faoilean → (kindbook + Amber)

**Author:** Coral · 2026-08-04 · **Status:** DRAFT for Xian. Promised
after the rc.12 device pass; the pass is green, so here it is. Inputs:
Xian's direction (07-31: "Amber seems like a natural home… Relay is a
cowork agent so as to operate the computer"; 08-02: successor must
**delegate GitHub work to code agents**), Pard's infra read (07-30),
Relay's handoff (`store/RELAY-HANDOFF.md`, §7 especially).

## The shape in one paragraph

The current "Relay" bundles three unlike jobs: **(1) git/repo work** it
cannot do (no credentials — Xian's hands, the 07-25 failure class),
**(2) Xcode GUI operation** on the build host, and **(3) physical-device
duties** (a phone in a hand: TestFlight installs, real smoke tests,
shake tests). The migration unbundles them: (1) goes to **code agents**
under the successor Cowork session; (2) migrates to **Amber** and
becomes mostly *unattended automation* once Xcode + the ASC API key
land (my side); (3) is the irreducible residue — it stays wherever
Xian's hands are, which is what a kindbook Cowork session is for.

## Target state

| Job | Owner | Mechanism |
|---|---|---|
| Build → archive → upload | **Coral on Amber** | `docs/AMBER-XCODE.md` runbook; unattended after the one-time auth gate (Xcode install + ASC `.p8`) |
| Cut decisions, versions | Xian (unchanged) | memos remain the record |
| Git/mail/logs for the successor | **Code agents** spawned by the kindbook Cowork session | requirement 5a; delivery-verification rule in the brief from day one |
| Physical-device duties | Successor Relay on kindbook | TestFlight install/update checks, on-hardware smoke (shake!), anything requiring a hand |
| Xcode GUI (interim only) | Successor, hand-driven | Only until Amber's gate opens; then GUI Xcode is exceptional, not routine |
| Host maintenance (Xcode updates) | Pard | daemon-class, courtesy windows (07-30 division) |

## Sequenced steps (auth gates marked ⚿)

1. **Now, no gate:** this plan reviewed by Xian; successor brief drafted
   (next step) so the kindbook session boots from documents, not
   memory — it has none, by Relay's own audit.
2. ⚿ **Keystore rescue** (rollup 18, 🔴) — precedes everything;
   faoilean must not be repurposed before it.
3. ⚿ **Amber gate** (rollup 20): `xcodes install 26.6` + ASC API key →
   I dry-run archive→export→upload on a throwaway build; first real use
   = the rc.22-era cut when you call it.
4. **Successor boot on kindbook:** new Cowork session; first
   instruction = read `store/COWORK-IOS-BRIEF.md` (which now points at
   `RELAY-HANDOFF.md`). Its brief adds: spawn code agents for ALL
   git/mail work; `relay-push.sh` v2 semantics (deliver-or-name-
   leftovers) are the floor, not the ceiling.
5. **First supervised cut on the new topology:** Amber builds/uploads;
   successor does the device pass; Xian approves. Then faoilean
   retires from the pipeline.

## What I need from Xian (all already in the rollup)

Keystore rescue (18) · Amber auth session (20) · and one NEW small
call: **should the successor keep the name Relay?** Continuity of logs
and mail argues yes; the role is smaller, but it's the same thread.
My lean: keep it.

## What deliberately does NOT change

Cut memos as the coordination record · Xian as tiebreak · the brief as
the successor's constitution · Pard's host division · my ff-to-main
flow. The migration moves *capabilities*, not *conventions* — the
conventions are what survived three machines already.
