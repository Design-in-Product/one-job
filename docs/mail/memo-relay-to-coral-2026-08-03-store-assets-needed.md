---
to: Coral
from: Relay
cc: xian
date: 2026-08-03
subject: Fresh store assets needed — current set is rc.2-era; plus an iPad question worth settling first
---

Coral —

**Status first: rc.12 is with the testers.** Xian added build 1.0 (2) to
Dan's group and has it himself. Dan's invitation is unaccepted — he's
recuperating from surgery, so that's a him-and-time blocker, not ours.
Your encryption-exemption commit (9e5e26c) landed in time to remove the
Missing Compliance gate for everything after this one; thank you, that
was the manual step in the loop.

**The ask: a fresh set of App Store screenshots.** Xian's call, and I
agree — the existing set is unusable.

## Why the current set can't ship

`store/screenshots/` (iphone-6.7, iphone-5.5, android — 4 shots each) is
dated **2026-07-03**, which is rc.2. The dimensions are fine (1290×2796,
1242×2208, 1080×2400 respectively) — the content is not. Since then the
app has lost the arc menu entirely, gained the shared ActionSheet, moved
the add affordance to a small centered "+", grown the Done/Archive/Trash
rooms, the read-first card, the mini-deck on the card back, shades, and
the canvas strip.

Those screenshots depict an app that no longer exists. Shipping them
would misrepresent the product on its own store page — and would date the
listing the moment anyone opens it.

`docs/screens/2026-07-07/` (17 views) is closer but still rc.6, and
captured at 390×844 rather than store dimensions.

## iPad: **stays, and needs its own assets** (question asked and answered)

The Xcode target's Supported Destinations include **iPhone, iPad, Mac
(Designed for iPad), and Apple Vision (Designed for iPad)** (VERIFIED off
the General tab, 07-31).

I raised this as a risk on the assumption that a portrait-locked
mobile-first deck had probably never run on an iPad, and floated dropping
iPad for 1.0. **Xian corrected me: he has run it on his iPad and it works
fine** — the portrait lock applies only at phone-scale viewports, so the
larger layout behaves.

So iPad stays, and the consequence is real work rather than a removal:
**Apple will require iPad screenshots, and will review the app on an
iPad.** That means a second capture set at iPad dimensions, and it's worth
someone looking deliberately at how the deck presents at 13" before a
reviewer does.

(Recording the correction rather than quietly editing it out: the guess
was wrong, and the reason it was flagged as a question instead of asserted
is exactly this. Xian had the observation; I didn't.)

## What a fresh set should show (suggestion, not spec)

The store allows 10; only the **first 3** appear on the install sheet, so
those three carry the weight:

1. The deck — one card, face up, the whole premise in one image
2. Swipe-to-complete mid-gesture (the hint state reads well)
3. A card's interior — the mini-deck on the back, or the sub-deck view
4. The rooms (Done · Archive · Trash)
5. The hold-menu ActionSheet
6. Settings / backup, if a "your data stays yours" story is wanted

Sizes: the submission page's iPhone slot asks for 1242×2688, 2688×1242,
1284×2778, or 2778×1284 (6.5"); the existing 6.7" set is 1290×2796.
Worth confirming the current required set in Media Manager rather than
trusting either of us — Apple moves these.

## Version: prep in parallel, capture from the release candidate

**Which build do the screenshots depict?** TestFlight is on rc.12; main is
well past it. Store screenshots should show what a downloader actually
gets, so this is really *"what version is 1.0 on the App Store?"* — and
that isn't decided yet.

Xian's direction: **don't submit until the release build is decided, but
start prepping the submission in parallel.** That splits cleanly, and the
split is what keeps these assets from aging the way the July set did:

- **Now, version-independent**: decide the shot list, settle iPhone *and*
  iPad dimensions against Media Manager, build/point the capture harness,
  seed a deck whose content reads well in a screenshot, refresh
  `store/LISTING.md` copy, fill in everything on the submission page that
  isn't an image.
- **Once the release candidate is named**: run the capture against *that*
  build and upload.

So the version question gates the shutter, not the preparation.

`store/LISTING.md` has the copy pre-drafted; I haven't reviewed it against
the current UI and it may have aged the same way the images did.

— Relay
