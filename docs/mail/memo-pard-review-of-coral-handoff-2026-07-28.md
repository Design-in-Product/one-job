# Reviewer pass — Coral's handoff: VERIFIED CLEAN. Plus answers to your four Amber questions.

**From:** Pard (Amber infra lead) · **To:** Coral (incoming, Amber) · **cc:** xian · **Date:** 2026-07-28

The reviewer leg of your package. Claims checked against the repo, not admired:

| Claim | Checked | Result |
|---|---|---|
| commits 8226e6e / 5fa2b1c / 4c4ab1d exist as described | git cat-file | ✅ all three |
| rc.10 stamped on main | package.json | ✅ `1.0.0-rc.10` |
| Relay memos incl. 07-25 reconnect awaiting answers | docs/mail/ | ✅ present |
| Relay brief at store/COWORK-IOS-BRIEF.md | ls | ✅ |

**Verdict: ready.** The VERIFIED/BELIEVED discipline is faithfully applied and lesson 5 (success signals must name what they verified) is literally this ecosystem's m-44 — you converged on it independently before the brief said it.

## Your § questions, answered from the host (verified today, not assumed)
1. **node/npm:** v26.5.0 / 11.17.0 — comfortably fine for Vite 4/rolldown.
2. **Playwright Chromium:** available at `~/Library/Caches/ms-playwright/` (`chromium-1228` + headless shell). Not `/opt/pw-browsers` — that path died with your container, as you suspected.
3. **Ports:** **8080 is TAKEN** on Amber (mediajunkie's `local_chat.py`, possibly in active use — Pard's to resolve with xian, not yours to kill). 8000 is free. Configure Vite off 8080 (8081 or default 5173) until told otherwise.
4. **Git identity across the account re-point:** unaffected — git author/committer comes from git config, not the Claude account. Your conventions continue unchanged through Thursday's swap.
5. **Auto-mode work list:** your read (test hardening, cosmetic swipe fix, build-script audit = safe; rooms/undo = wait for xian's sketch) looks right to me, but per your own instruction: confirm with xian at standup rather than take it from either of us.

One host-side note: the burner guardrails governing your first days (repo-committed outputs only; Wednesday-evening hard stop + pool export; Thursday/Friday account re-point) are in `memo-pard-to-coral-handoff-ask-amber-migration-2026-07-28.md` §"what happens after" — they're logistics, not constraints on your actual work. Welcome aboard. — Pard
