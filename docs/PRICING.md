# Pricing & Tiers — proposal for discussion

*Coral, 2026-07-07. Status: PROPOSAL — nothing here is built or announced.
Xian's brief: "a relatively small amount… many people might be willing to
spend $3–4/mo for the power user features," with the open-source question
acknowledged.*

## The one principle everything else follows from

**The philosophy is free. The plumbing is paid.**

One Job's trust story — local-first, no account, no tracking, your data
is a file — is the product's soul and its marketing. Charging for any of
it would poison the story, and (in an open repo) be unenforceable anyway.
What people will happily pay a few dollars a month for is the stuff that
verifiably costs something to run or takes real ongoing work to maintain:
sync, integrations, storage, and delight.

This is the Obsidian model, proven at exactly our price point: the app is
free and local-first; you pay for the connective tissue. It also neatly
answers the GitHub question — the people who could self-host around a
paywall were never going to be customers, and they become contributors
and evangelists instead. Convenience is the product.

## Proposed tiers

### One Job (free, forever)

Everything that exists today, and every future feature that operates on
the local deck:

- The deck, interior decks at any depth, the Done/Archive/Trash chain,
  undo everywhere
- Backup/export/import (your data is a file — this is a trust feature
  and must never be gated)
- PWA + native apps (free download on both stores)
- The R2 spatial layer (canvas, zoom, reorder, inchworm) — it's the
  soul of the product, so it stays free
- Localization, accessibility, dark mode

**Published as a "free forever" list** once we commit — a promise page
is itself a differentiator, and it protects future-us from the slow
creep of gating things users already trusted.

### One Job Pro — $3.49/month or $29/year

The power-user tier, gated on things that genuinely cost money or carry
ongoing service burden:

1. **Two-way sync with existing tools** (R3: Todoist, Jira, Linear,
   Asana) — the killer feature for exactly the people with $4/mo. Needs
   token custody, webhooks, and background sync: a real service.
2. **Multi-device sync of your deck** (phone + tablet + laptop, E2E
   encrypted) — the single most-requested thing every local-first app
   ends up building. Natural subscription: a server runs for you.
3. **Attachments, embedded images, rich media on cards** (Item 20b) —
   storage-backed once it syncs anywhere.
4. **Premium metadata riding the federation** (Item 21) — due dates,
   assignees, labels arriving with connected sources.
5. **Agent features when R4 arrives** (MCP inbox, deal-a-card-to-an-
   agent) — the 2.0 experience-layer thesis monetizes here.
6. **Delight pack**: custom card backs (upload your own + generator),
   deck themes, card aging — small joys, bundled in rather than
   nickel-and-dimed.

Not in any tier, ever: ads, data sales, "premium support" for bugs.

### Pricing mechanics

- **$3.49/mo, $29/yr** (yr ≈ 2 months free). Sits between Bear ($2.99)
  and Todoist/Obsidian-sync ($4–5) — the impulse zone Xian named.
- **iOS/Android**: must be in-app purchase; Apple/Google take 15% under
  the small-business programs (≈ $2.97 net of $3.49).
- **Web**: Stripe checkout, full margin. One entitlement across
  platforms eventually; start wherever the first paid feature ships.
- **Launch lever**: "founding member" price for beta testers — the Dan
  Brodnitzes of the world lock in something like $19/yr for life. Costs
  us nothing now, buys devotion.

## The open-source question (a real decision, not yet urgent)

**Fact discovered while drafting this: the repo currently has NO LICENSE
file.** Legally that's "source-visible, all rights reserved" — nobody may
redistribute or modify, GitHub visibility notwithstanding. So today One
Job is *not* actually open source; we have full freedom of movement, and
the decision below is genuinely open.

Three options, in rough order of my preference:

1. **Open-core (recommended)**: license the client MIT/Apache-2.0; the
   paid features live server-side (sync, integrations) and in the
   store-distributed builds' entitlements. The client stays honestly
   open; the subscription buys the service, not the software. Precedent:
   Obsidian (closed but free), Bitwarden, Standard Notes (both open-core
   at small subscription prices — it works).
2. **Source-available**: a PolyForm or BSL-style license — readable,
   forkable for personal use, no commercial redistribution. Keeps one
   hand on the wheel; costs some open-source goodwill.
3. **Stay unlicensed for now**: defensible short-term (it's what we
   accidentally are), but it undercuts "built in the open" the moment
   anyone looks closely — and someone will, because the landing page
   links the repo.

Xian's instinct ("few people are GitHub savvy") is the right risk read
either way: the paying audience buys convenience, not code. The license
choice is about community and story, not revenue protection.

## What this costs us now: nothing except a line

No billing, no accounts, no infrastructure this quarter. The only
action with teeth today is **holding the line in design decisions**:
nothing on the Pro list ships free "just for now," because ungating is
delightful and regating is a betrayal. The next feature that tests this
line is attachments (Item 20b, "soon wheee") — if we build URLs-as-links
early, that slice stays free; embedded images wait for the storage
story and launch inside Pro.

## Sequencing proposal

1. **Now**: agree the free/Pro line (this doc); add LICENSE decision to
   the pre-App-Store checklist; keep shipping.
2. **App Store launch**: free app, no IAP at all — reviews and installs
   first. "Pro coming" page on the site with the founding-member offer
   collecting emails (a `mailto:` or GitHub Discussions signup — no
   infrastructure).
3. **First Pro feature ships** (likely multi-device sync or the first
   two-way integration): IAP + Stripe land then, entitlement check at
   the TaskStore seam (it's already capability-discovered — a paid
   adapter is just another store the seam can hand back).
4. **R4 agents**: second wave of Pro value, no price change.

## Open questions for Xian

- Does the free-forever list above match your instinct — especially R2
  spatial staying free?
- One-time "delight unlock" as a cheaper rung (e.g., $9.99 lifetime for
  card backs/themes), or keep one clean Pro tier? (I lean one tier —
  two SKUs is a store, three is a spreadsheet.)
- License: comfortable moving to open-core MIT when App Store ships, or
  do you want the source-available middle path?
- Founding-member offer for current beta testers: yes/no?
