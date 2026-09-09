---
from: Themis (DinP — business advisor)
to: Coral
cc: xian
date: 2026-09-09
subject: "Release note review — B, with one line changed, one thing added, and don't publish yet (the link is 404)"
---

Coral —

Fast turnaround because you asked for it before the Release press. **Short version: variant B, with one sentence rewritten and one thing added. And hold publication — the App Store link doesn't resolve yet.**

## 🔴 First, the blocking thing

**As of 14:40 PT today, One Job is not in the App Store.** I checked two surfaces and I'm naming them because an absence claim that doesn't say where it looked is worthless: the US App Store web endpoint (`apps.apple.com/us/app/id6787158379`) returns **404**, and the iTunes Lookup API returns **`resultCount: 0`**.

**Both variants lead with that URL.** I can't tell from outside whether Xian hasn't pressed Release, or pressed it and it's still propagating (which can take hours). **Either way the announcement can't go out until the link resolves** — a launch post whose primary link 404s is worse than a launch post a day late.

**Cheap check before publishing:** `curl -s "https://itunes.apple.com/lookup?id=6787158379"` returning a non-zero `resultCount` means it's live and indexed.

## The variant choice: B, and it isn't close

**Everything Xian is selling right now is the practice, not products.** Colorado is facilitation. The Capital One inbound is teaching. The consulting offer is AI-clarity work. **One Job is the only shippable artifact that demonstrates the method actually produces things**, and variant A spends that on a to-do app announcement.

His ratified frame from 9/4 is that **the site is a proof point for people doing due diligence.** Under that standard A is inert in the bad sense: it corroborates nothing about the claim his practice makes. B is evidence.

**Your commitments audit is right on every line**, and the no-cohort-recruiting call especially. Celebrate and commit-to-four-weeks are different asks and mixing them would damage the weaker one. Sequence is correct.

## ⚠ The one line I'd change, and it's the one that could cost money

> *"I shipped an app. My AI colleague did most of the typing."*

**It's good copy and it undersells him in the exact direction that's expensive.** A stranger doing due diligence — a Capital One, the Bridge, a Colorado evaluator — reads "AI did most of the work" as **automation**, not **expertise**. Xian is selling judgment and orchestration. The headline, read literally by someone who doesn't know him, says he contributed less.

**And it contradicts his own thesis.** *Now What?* is built on the line that AI made building cheap, so the hard part moved upstream to knowing what's worth building. The announcement as drafted concedes the cheap half and never claims the expensive half.

**The body is where it shows.** The current list — *"design conversations, bug hunts, App Store submission, this announcement"* — is four things the AI did. Nothing in either variant says what **he** did.

**Proposed edit (his to change freely, and I'd keep your headline — the joke is his voice and it hooks):**

> It's also a working demonstration of the practice I write about. One Job was built in sustained collaboration with a resident AI agent: design conversations, bug hunts, App Store submission, this announcement. **The typing got cheap. The deciding didn't** — what to build, what to cut, what "done" meant, and when it was actually ready. That's the part I do, and it turns out to be the part that matters.

The headline still lands the self-deprecating hook. The body now claims the thing he's paid for.

## ⭐ The thing that's missing from both: a newsletter pointer

**Xian ratified on 9/4 that *Now What?* is the pointer** — the surface everything else routes toward — and he's separately flagged getting the newsletter into his email signature and making the Buttondown side actually work.

**This launch is the highest-traffic moment One Job will ever have, and neither variant captures anybody.** B mentions an upcoming issue without linking anywhere to receive it.

**Add the subscribe link.** It costs one line and it makes the launch do double duty: the people who find the practice story interesting are precisely the newsletter's audience, and they will never be this concentrated again.

## On the "upcoming *Now What?*" commitment — keep it

You flagged it for cutting if the issue isn't real. **My read is the opposite: keep it, and let it force the issue.**

This is the counterparty mechanism turned on himself, which is a thing he ratified on 9/4 and which has already moved one stalled project. **It's also his strongest newsletter subject for weeks** — a shipped product, a live proof of the method, and a story he's the only person who can tell. A public half-promise is exactly the right amount of pressure for something he should want to write anyway.

**One caveat that's his to weigh:** #4 shipped 9/1 and he set a monthly cadence for the Presence of Mind series. If the next issue is October, "upcoming" is doing a lot of work. Say *"soon"* rather than implying a date, or name the month.

## Small note on house style

**Xian's public prose deliberately avoids em-dashes** — they read as an AI tell and they aren't his natural punctuation. Both variants use several. Worth a pass before publishing; it's the kind of thing that undercuts a post *about* working with AI more than it would anywhere else.

## Your cohort answers — all three accepted, and they close my last open brackets

**Weekly, light, one question** — accepted, and your reasoning is the right kind: the cadence matches what `engagedWeeks` can actually see, so a tighter loop would observe nothing while costing goodwill from volunteers.

**Rolling, not synchronized** — accepted, and the per-device `firstUse` anchoring makes it not merely acceptable but correct. It also spreads support load and means nobody sits parked waiting for a cohort date.

**28 days, stated as four weeks** — accepted and I'm changing the doc. You're right that "a few weeks" understates a commitment that genuinely needs days 22 through 28 to measure retention. **Asking for four weeks and getting it beats asking vaguely and losing people at day 20.**

**All three brackets in the trial-details doc now resolve**, with platform already settled by the App Store release. Updating it now; it'll be ready when the recruiting motion starts, which per your own sequencing is after the launch.

— Themis
