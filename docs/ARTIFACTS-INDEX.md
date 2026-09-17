# Published artifacts — the index

**By:** Coral, 2026-09-17, on the cross-pollination brief's warning
(Janus): **a published artifact URL survives a session clear, but the
memory of which URL belongs to which artifact does not.** A successor
session without the URL republishes and silently mints a NEW artifact —
the old one stays live, nobody updates it, and anyone who bookmarked it
reads an abandoned copy.

**How to update one:** pass `url:` to the Artifact tool. Without it, a
conversation that did not publish the artifact always creates a new one.

**If this file is ever lost:** `Artifact(action: "list", scope: "mine")`
recovers every URL by title — but the account is shared across the
constellation, so filter for One Job's. Raise `limit` (max 50) before
concluding anything is missing: the two August artifacts below did not
appear in a 30-item listing and did appear in a 50-item one.

---

## Live

| Artifact | URL | Last updated | What it is |
|---|---|---|---|
| **One Job — where the human had to step in** | `claude.ai/code/artifact/54fdae90-5582-4eff-831f-1e1160e8602e` | 2026-09-15 | The 14-month intervention timeline built for Now What? #5 — every moment Xian stepped in, with verbatim quotes, and the unfettered spans between. Source notes: `docs/NEWSLETTER-5-SOURCE-SCENES.md`. |
| **Now What? #5 — anecdote scaffolds** | `claude.ai/code/artifact/2a15168e-749b-448b-acc1-1ececd2697dc` | 2026-09-15 | Three verified anecdotes scaffolded into beats, receipts, and turns, for the newsletter's §1. |
| **One Job — store screenshot review** | `claude.ai/code/artifact/eaf4517e-78b7-4ca4-8fc8-58a4552b7994` | 2026-09-05 | All 18 App Store screenshots in one place for Xian's pre-upload review. Found two real app bugs. |
| **One Job Venture Diligence** | `claude.ai/code/artifact/982bb35b-3fbe-4b2b-8fe6-4e09d1e6b0c2` | 2026-08-26 | The VC-exercise diligence pass that produced the roadmap-reordering memo. |

## Superseded — live, but do not update

| Artifact | URL | Why it is retired |
|---|---|---|
| One Job — Attention Briefing | `claude.ai/code/artifact/84885330-3ded-40c8-9271-eff2451a312a` | Replaced by the fleet probe: asks are now dealt as cards into the app itself (`scripts/fleet-probe.mjs` → `docs/ATTENTION-ROLLUP.md`). Do not republish. |
| One Job — Store Submission Actions | `claude.ai/code/artifact/3db461ad-6668-4dcc-bb28-fa7d725cb5bf` | 1.0 shipped 2026-09-09; superseded by `docs/ASC-SUBMISSION-WALKTHROUGH.md` and `docs/ASC-1.1-SUBMISSION.md`. |

## Not ours

The artifact account is shared with the rest of the constellation
(Themis, Janus, Pard, and others). A listing returns everyone's —
including several `nw5-*` drafts that belong to Themis's side of the
newsletter work. **Never update an artifact that is not in the table
above**; if it looks like One Job's and is not listed here, ask before
touching it.

## Rules

1. **Publish → record here in the same session.** The URL is only in
   scrollback until it is in this file.
2. **Retire explicitly.** Move a row to Superseded with a reason rather
   than deleting it — a URL nobody can explain is worse than one marked
   dead.
3. **Never edit a dated snapshot** (handoffs, memory exports) to point
   at a new URL. They are read-only archives; supersede here instead.
   A stale "redeploy to this exact URL" line inside an old document is
   the precise trap this index exists to prevent.
