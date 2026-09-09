# Release note / announcement — 1.0 (DRAFT for Xian's edit + Themis's strategy review)

**Status:** drafted 2026-09-09 morning; **Themis's strategy review
applied same day** (variant B recommended, body rewritten, newsletter
link added, em-dash pass done). Ready for Xian's voice pass and the
Release press.

**🔴 PUBLISH GATE (Themis):** the App Store link 404s until Release is
pressed AND propagation completes. Before any variant goes out:
`curl -s "https://itunes.apple.com/lookup?id=6787158379"` must return
`resultCount: 1`. A launch post whose primary link 404s is worse than
a launch post a day late. Coral runs this check as part of the release
sequence, before the site branch merges.

Two variants, because the framing choice is the actual strategy
decision. Themis's lens applies to choosing between them; the words
inside are Xian's to change freely.

---

## Variant A — product-first (safe anywhere, commits to least)

> **One Job 1.0 is on the App Store.**
>
> It's a to-do app with one idea: your tasks are a deck of cards, and
> you see one card at a time. Do it, swipe it away, and the next one is
> waiting. Deferring isn't failure. The card just waits its turn.
>
> It's free. There's no account and no tracking; your deck lives on
> your device, works offline, and backs up to a file you own.
>
> 📱 App Store: https://apps.apple.com/app/id6787158379
> 🌐 Or try it in your browser first: https://onejob.co
>
> I'd genuinely love to hear what you think, especially if to-do apps
> have never stuck for you. That's who it's for.

## Variant B — practice-story ⭐ RECOMMENDED (Themis review, 2026-09-09)

> **I shipped an app. My AI colleague did most of the typing.**
>
> One Job 1.0 is on the App Store today. It's a to-do app that shows
> you one task at a time, as a card. Do it, swipe, next card. Free,
> no account, no tracking, everything on your device.
>
> It's also a working demonstration of the practice I write about.
> One Job was built in sustained collaboration with a resident AI
> agent: design conversations, bug hunts, App Store submission, this
> announcement. The typing got cheap. The deciding didn't. What to
> build, what to cut, what "done" meant, and when it was actually
> ready: that's the part I do, and it turns out to be the part that
> matters.
>
> 📱 https://apps.apple.com/app/id6787158379
> 🌐 https://onejob.co
>
> More on how it was built in *Now What?* soon:
> https://buttondown.com/designinproduct
>
> For now, go swipe a card.

**Themis's review (2026-09-09) resolved the choice: B, "and it isn't
close."** Everything DinP sells right now is the practice; One Job is
the only shippable artifact demonstrating the method produces things,
and A would spend that on a to-do app announcement. The body edit above
is Themis's ("the typing got cheap; the deciding didn't") — the
original body listed four things the AI did and nothing Xian did,
underselling the exact judgment he's paid for. Newsletter link added
(launch traffic is the newsletter's audience at peak concentration;
URL verified serving 200). "Soon," not "upcoming" — the *Now What?*
half-promise is KEPT deliberately as the counterparty mechanism turned
on himself, but with no implied date since #4 shipped 09-01 on a
monthly cadence. Em-dashes removed from the publishable copy per house
style (they read as an AI tell, worst possible tell in a post about
working with AI).

## Short variants (either framing)

- **One-liner:** One Job 1.0 is on the App Store: see one task, do one
  task, feel accomplished. Free, offline, no account.
  https://apps.apple.com/app/id6787158379
- **Reply-to-"what's new":** I make a to-do app now. One card at a
  time. It's free and it doesn't spy on you.

## Commitments audit (Themis's lens 2 — what this does NOT say)

Deliberately absent from both variants:
- **No pricing signal.** "Free" states today's fact; neither variant
  says "free forever" or hints at pro tiers. (Pricing derives from
  research — Xian's standing rule, 2026-08-29.)
- **No roadmap promises.** No Todoist, no Android date, no canvas.
- **No support posture.** No "email me for help," no SLA implication.
- **No cohort recruiting.** The 50-user trial is a separate motion with
  Themis's trial-details doc as its instrument — mixing it into the
  launch note would conflate two different asks (celebrate vs. commit
  four weeks). Sequence them.
- Variant B's "my AI colleague" phrasing avoids naming/branding claims
  about the agent setup that the DinP site would then have to match.
