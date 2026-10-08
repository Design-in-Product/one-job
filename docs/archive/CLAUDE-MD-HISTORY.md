# CLAUDE.md history — superseded sections

Moved verbatim out of `CLAUDE.md` on 2026-10-08 under the network
living-doc convention (rule 8: superseded wording goes in a changelog or
archive, never the primary doc). The live rules these sections carried
were restated in CLAUDE.md § "Standing code gotchas".

## PREVIOUS SESSION STATUS (2026-07-01)

### Card Deck Experience: mechanics rebuilt and verified

The presentation-layer defects that stalled the 2025-08 pivot are fixed:

- **True 3D flip**: `FlipCard` is a single two-sided rotator (perspective +
  backface-visibility). The four flip variations are transition presets on one
  rotation — no more parallel animation systems.
- **Finger-tracking drag**: `SwipeableCard` uses Framer Motion `drag="x"`;
  the old `TaskCard` had corrupted transform strings (pasted KaTeX HTML) so
  cards never followed the finger, and its swipe-out keyframes were never
  emitted by Tailwind (inline `animation:` doesn't trigger keyframe emission).
- **Unified geometry**: every face shares `CARD_GEOMETRY` from FlipCard.tsx;
  the card back is a designed playing-card back (`CardBack`).
- **Add Task** is reachable from the arc menu (modal TaskForm).
- **Dev server fix**: vite `host: "::"` was IPv6-only — the cause of the
  2025-08-06 "server unreachable" blocker. Now `host: true`.
- **Watch out**: containers styled `max-w-md mx-auto` inside a flex column
  have no intrinsic width once children are `w-full` — keep the explicit
  `w-full` on the app shell in Index.tsx.

Verification now includes driving the app with Playwright
(`chromium` + mobile viewport) — screenshots beat guessing for gesture work.

### Production pipeline state

- `npm run build` also syncs demo.html's hashed bundle references
  (scripts/sync-demo-assets.mjs) — never hand-edit them again.
- `app/` build output and `backend/venv` / `*.db` / `.env` are untracked.
- Pages deploy reads `VITE_API_URL` from a repo Actions variable; unset ⇒
  demo mode. Set it after the Render backend deploy to go live.
- render.yaml links DATABASE_URL via `fromDatabase`; backend normalizes
  `postgres://` → `postgresql://` for SQLAlchemy 2.

## PREVIOUS SESSION STATUS (2025-08-02)

### Recent Breakthroughs Achieved

**✅ Demo Page Debugging Mastery**
- **Problem**: Instructions panel dismissal not working
- **Wrong Path**: Assumed DOM timing or event listener issues  
- **Systematic Discovery**: Console monitoring revealed React app removing elements
- **Solution**: Auto-monitoring and recreation of removed elements
- **Time**: 15 minutes using monitoring vs. potential hours of guesswork
- **Pattern**: Monitor first, diagnose from real data, fix root cause

**✅ Date Formatting Resilience**
- Fixed Completed tab crashes with graceful error handling
- Added try-catch blocks around date formatting operations
- Fallback to "Completed recently" for invalid dates

**✅ GitHub Pages Deployment Pipeline**
- Asset path corrections for demo.html 
- Proper build artifact deployment structure
- Demo now loads correctly at onejob.co

### Current Development Phase

**🎯 ACCEPTANCE TESTING PHASE**
- Demo fully functional for comprehensive QA testing
- Instructions panel dismissal working properly
- Ready for user acceptance testing feedback
- Next: Backend deployment to Render.com for full integration

### Lessons Learned This Session

1. **Never Skip Systematic Verification** - Even for "simple" UI bugs
2. **React DOM Interference** - External elements can be removed by React
3. **Monitoring Beats Guessing** - Console logging reveals actual problems
4. **Deploy Debug Versions** - Test real behavior in live environment
5. **Document Breakthroughs** - Capture methodology for future sessions

### Immediate Next Steps

1. Confirm demo acceptance testing complete
2. Deploy backend to Render.com  
3. Update frontend to use production API
4. Test full end-to-end functionality
5. Plan integration roadmap (Asana, Todoist, etc.)
