# One Job UI/UX Issues Tracking

> **Re-triaged 2026-07-01** after the Card Deck Experience mechanics rebuild.
> "Obsolete" = the tabbed UI element the issue referred to no longer exists.

| Issue ID | Screenshot | Date | Priority | Category | Issue Description | Status | Notes |
|----------|------------|------|----------|----------|-------------------|--------|-------|
| ICON-001 | 2025-08-05-06_50_55 | 2025-08-05 | Medium | Branding | Favicon still shows Lovable logo instead of OneJob logo | Resolved 2026-07-01 | favicon.svg single-sourced in public/, linked from app + landing, deployed by workflow |
| THEME-001 | 2025-08-05-06_50_55 | 2025-08-05 | High | Design | Coral theme not implemented on landing page | Resolved 2026-07-01 | Landing palette now #f35343→#E73C7E, matching the app |
| LOGO-001 | 2025-08-05-06_50_55 | 2025-08-05 | High | Branding | OneJob logo missing from landing page | Resolved 2026-07-01 | Card-back medallion logo added to hero |
| TYPO-001 | 2025-08-05-06_50_55 | 2025-08-05 | High | Typography | "The Problem" section has broken word spacing around bold text | Resolved 2026-07-01 | flex <li> split text runs into flex items, collapsing whitespace; copy now wrapped in a span |
| TYPO-002 | 2025-08-05-06_50_55 | 2025-08-05 | Medium | Typography | Inter font not applied to landing page | Resolved 2026-07-01 | Inter loaded and set as the Tailwind sans stack |
| DEMO-001 | 2025-08-05-07_02_24 | 2025-08-05 | Critical | UX | Demo mode banner not dismissible and unusable on mobile | Resolved 2025-08 | Banner collapses instead of disappearing (commit 1802342) |
| DEMO-002 | 2025-08-05-07_02_24 | 2025-08-05 | Medium | Design | Demo mode banner not using coral theme colors | Resolved 2025-08 | Switched to blue banner deliberately (commit 977d653, documented in design system) |
| ACCESS-001 | 2025-08-05-07_02_24 | 2025-08-05 | High | Accessibility | Inactive tab contrast too low for WCAG compliance | Obsolete | Tabs removed by Card Deck pivot |
| LOGO-002 | 2025-08-05-07_02_24 | 2025-08-05 | High | Branding | OneJob logo missing from app header | Obsolete | Card Deck spec removes header chrome; logo lives on the card back |
| ADD-BTN-001 | 2025-08-05-07_02_24 | 2025-08-05 | Critical | UX | "Add New Task" button cut off at bottom of screen | Resolved 2026-07-01 | Add Task now a modal from the arc menu; empty-state form sits inside the card outline |
| ANIM-001 | 2025-08-05-07_02_24 | 2025-08-05 | Medium | Animation | Flash/flicker when swiping left (defer action) | Resolved 2026-07-01 | SwipeableCard rebuild: cards track the finger and fling off-screen (verified via Playwright) |
| TYPO-003 | 2025-08-05-07_02_24 | 2025-08-05 | Medium | Typography | Need to verify Inter font applied throughout app | Open | Inter is loaded and set as --font-family-primary; needs a visual pass on real device |

## Screenshot Analysis: 2025-08-05-06_50_55.png

### My Independent Review:

**Visual/Layout Issues:**
1. **Typography hierarchy**: "One Job" title could be larger/more prominent
2. **Button contrast**: "Try Live Demo" button vs "View Code" - demo button should be more prominent
3. **Section spacing**: Some sections feel cramped, especially "Why One Job?" icons
4. **Mobile responsiveness**: Hard to assess from desktop view, but sections might be too dense for mobile
5. **Color consistency**: Mix of purple, orange, green colors - could be more cohesive with coral theme
6. **Footer alignment**: "Made with ❤️" footer text seems misaligned or awkward

**Content/UX Issues:**
1. **CTA clarity**: Two buttons at top might confuse users about primary action
2. **Feature icons**: Some icons in "Why One Job?" section are small/hard to see
3. **FAQ section**: Questions might be too detailed for landing page
4. **Project Status**: "MVP Complete" vs "Coming Soon" creates confusion about what's available

**Technical Issues:**
1. **Favicon**: Already noted - still Lovable logo
2. **Image quality**: Some icons appear pixelated or low-res
3. **Loading**: Can't assess from screenshot, but page might be heavy

Waiting for your independent review before we compare notes and finalize the list.