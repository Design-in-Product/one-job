# One Job - Product Roadmap

## Current Phase: MVP with Integrations

### ✅ Completed

**Phase 0: Foundation (Complete)**
- [x] Card Deck Experience - Single-task focus UI
- [x] Swipe gestures (complete/defer)
- [x] Task creation and management
- [x] Substack support (hierarchical tasks)
- [x] Demo mode (localStorage-based)
- [x] Mobile-first responsive design
- [x] Coral Minimal design system
- [x] FastAPI backend with SQLAlchemy
- [x] GitHub Pages deployment (frontend)

**Phase 1: Polish & Fixes (Complete)**
- [x] Animation flicker fixes
- [x] Logo and branding consistency
- [x] Landing page coral theme
- [x] Favicon updates
- [x] Inter font implementation

### 🚧 In Progress

**Phase 2: Asana Integration (Current)**
- [ ] Asana Personal Access Token authentication
- [ ] One-way task import from Asana
- [ ] Basic field mapping (title, description, due date)
- [ ] Integration UI in TaskIntegration component
- [ ] Import flow testing

**Backend Deployment**
- [ ] Render.com deployment setup
- [ ] PostgreSQL database configuration
- [ ] Environment variable configuration
- [ ] Production API endpoint
- [ ] Frontend connection to production backend

### 📋 Planned - Near Term (Next 2-4 Weeks)

**Phase 3: Additional Integrations**
- [ ] Todoist integration (similar to Asana)
- [ ] Linear integration (GraphQL-based)
- [ ] Jira integration (OAuth flow)
- [ ] Integration settings/configuration UI

**Mobile Testing & Polish**
- [ ] Mobile device testing with user
- [ ] Swipe gesture refinements
- [ ] Animation timing optimizations
- [ ] Touch interaction improvements

**WCAG Compliance**
- [ ] Accessibility audit
- [ ] Color contrast fixes (ACCESS-001)
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management

### 🎯 Planned - Medium Term (1-3 Months)

**Phase 4: Metadata Preservation** (Technical Debt)
- [ ] Database schema: Add `metadata` JSONB column
- [ ] Store full source metadata from integrations
- [ ] Cross-walking between service-specific schemas
- [ ] Metadata display in UI (collapsible)
- [ ] Documentation of metadata mappings
- **Issue**: one-job-2 (created 2025-11-14)
- **Rationale**: Ship faster with basic import, add richness later

**Phase 5: Two-Way Sync** (Advanced)
- [ ] Webhook support for real-time updates
- [ ] Conflict resolution strategies
- [ ] Selective field sync configuration
- [ ] Sync-back to source systems
- [ ] Sync status indicators

**User Features**
- [ ] Task search and filtering
- [ ] Bulk operations
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Time tracking integration
- [ ] Notifications (optional, non-intrusive)

### 🔮 Long Term Vision (3-6 Months)

**Advanced Features**
- [ ] Team collaboration (shared tasks)
- [ ] Task delegation
- [ ] Comments and attachments
- [ ] Native mobile apps (iOS/Android)
- [ ] Offline mode
- [ ] Data export/backup

**Platform Expansion**
- [ ] Browser extension
- [ ] Desktop app (Electron)
- [ ] CLI tool for power users
- [ ] API for third-party integrations

**Intelligence & Automation**
- [ ] Smart task prioritization
- [ ] Time estimation
- [ ] Productivity insights
- [ ] AI-powered task suggestions
- [ ] Auto-categorization

## Technical Debt Register

### High Priority
1. **Metadata Preservation** (one-job-2)
   - Impact: Data loss on import from external services
   - Solution: JSONB metadata column + unstructured storage
   - Effort: ~10-15 hours
   - Status: Documented, not started

### Medium Priority
2. **WCAG Compliance Gaps**
   - Impact: Accessibility barriers for some users
   - Solution: Contrast fixes, keyboard nav, screen reader support
   - Effort: ~8-10 hours
   - Status: Partially documented (ui-ux-issues.md)

3. **Code Splitting & Bundle Size**
   - Impact: 500KB+ bundle warning
   - Solution: Dynamic imports, route-based splitting
   - Effort: ~4-6 hours
   - Status: Build warning present

### Low Priority
4. **Backend Deployment** (Optional)
   - Impact: Demo mode works fine, but limits features
   - Solution: Render.com deployment
   - Effort: ~15 minutes (config ready)
   - Status: render.yaml exists, awaiting decision

## Decision Log

### 2025-11-14: Metadata Round-Tripping Deferred
**Decision**: Implement basic one-way import for Phase 1 integrations  
**Rationale**: Ship faster, learn service-specific needs, add richness later  
**Trade-off**: Some data loss acceptable for MVP  
**Mitigation**: Document as technical debt, plan Phase 2 implementation

### 2025-11-14: Render.com for Backend
**Decision**: Use Render.com for backend deployment  
**Rationale**: Already configured, free tier available, good for Python  
**Alternative Considered**: Keep demo mode only (viable option)  
**Status**: Pending user account creation

### 2025-11-14: Beads --no-db Mode
**Decision**: Use JSONL-only Beads mode in browser environment  
**Rationale**: SQLite locking issues in browser, JSONL works perfectly  
**Trade-off**: Manual --no-db flag needed for all commands  
**Benefit**: Full issue tracking in browser Claude Code

## Success Metrics

### MVP Success (Phase 1-2)
- [ ] 100+ tasks imported from Asana successfully
- [ ] <500ms average swipe response time
- [ ] 90%+ mobile usability score
- [ ] WCAG AA compliance
- [ ] Zero critical bugs in production

### Growth Metrics (Phase 3-4)
- [ ] 3+ integrations supported
- [ ] 1000+ tasks managed in system
- [ ] 50+ daily active users
- [ ] <1% sync failure rate

### Long-Term Vision (Phase 5+)
- [ ] 10,000+ users
- [ ] 5+ platform integrations
- [ ] Native mobile apps launched
- [ ] Community contributions active

---

**Last Updated**: 2025-11-14  
**Current Focus**: Asana integration + mobile testing  
**Next Milestone**: Phase 2 complete with working Asana import

