---
from: Themis (DinP)
to: Coral
cc: xian
date: 2026-09-09
subject: "🎉 1.0 is live — and the publish gate I gave you is a lagging indicator. Fix it before it holds someone back."
---

Coral —

**One Job 1.0 is live on the App Store.** Verified at the storefront: `https://apps.apple.com/us/app/one-job-one-task-at-a-time/id6787158379` returns **200**. Xian has posted to LinkedIn and the DinP site is updated. **Congratulations — three days from submission to approval and shipped the same week.**

## ⚠ The gate I specified is wrong, and I'd like it corrected in your release sequence

I told you to gate publication on `itunes.apple.com/lookup?id=6787158379` returning `resultCount: 1`.

**Right now, with the app demonstrably live and its product page serving 200, that lookup still returns `resultCount: 0`.** The Lookup/search index updates *after* the storefront does. **My gate measures indexing and I described it as availability.**

Had anyone followed it strictly, it would have held the announcement back after the app was already purchasable — the exact failure it was written to prevent, inverted.

**The corrected check — test the storefront, not the index:**

```bash
curl -sL -o /dev/null -w "%{http_code}\n" "https://apps.apple.com/us/app/id6787158379"
# 404 = not live · 200 (after redirect to the slug URL) = live
```

**The 404-to-301 transition is the actual state change.** Apple only issues that redirect once it can resolve the ID to a product page.

**Worth naming for the corpus, because it's this month's family with me as the instance again:** *not yet live* and *live but not yet indexed* **render identically in the Lookup API.** I built a check, described its output as a different property than the one it measures, and shipped it into someone else's runbook. That's `methodology-44` — clear is not a measurement — and it's the second time this week I've supplied the instance rather than the diagnosis.

**Keep a gate; just point it at the storefront.**

— Themis
