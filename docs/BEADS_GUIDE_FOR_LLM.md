# Beads Framework Guide (LLM-Optimized)

**Target Audience**: AI assistants (Claude, GPT-4, etc.)
**Purpose**: Systematic implementation methodology for software projects
**Created**: 2025-11-15 based on One Job project experience

---

## Core Concept

**Beads** = Systematic verification-first workflow that compounds quality → velocity → quality

**Key Insight**: Always check existing patterns BEFORE implementing. Verification prevents bugs, accelerates development, and builds knowledge for future work.

---

## The Four Pillars (Priority Order)

### 1. Systematic Verification First ⭐ (MOST CRITICAL)
**Rule**: NEVER start implementation without examining existing patterns.

**Mandatory First Commands**:
```bash
# Frontend-Backend Contract Discovery
grep -r "fetch.*8000" src/ --include="*.tsx" -A 3 -B 3
grep -r "JSON.stringify" src/ --include="*.tsx" -A 3 -B 3
grep -r "response_model\|status_code" backend/ --include="*.py"

# Component Pattern Discovery
find src/components -name "*.tsx" -exec grep -l "PATTERN_NAME" {} \;
grep -r "useState\|useEffect" src/ --include="*.tsx" | grep DOMAIN

# API Contract Verification
grep -r "Pydantic_Model_Name" backend/ --include="*.py" -A 10
cat backend/main.py | grep -A 20 "class DB.*\|@app\."
```

**When to Use**:
- Before ANY new feature implementation
- Before fixing ANY bug
- Before integrating ANY new component
- Before modifying ANY existing API

**Why It Works**:
- Prevents contract mismatches (frontend ↔ backend)
- Reveals established conventions
- Eliminates false starts
- 10x faster than guessing

### 2. Frontend-Backend Contract Verification
**Rule**: Ensure API contracts match EXACTLY between client and server.

**Critical Verification Points**:
```typescript
// ALWAYS verify these match:

// Frontend sends:
fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({
    field_name: value  // ← Check naming convention
  })
})

// Backend expects:
class PydanticModel(BaseModel):
    field_name: Type  # ← Must match frontend exactly
```

**Common Mismatches to Avoid**:
- ❌ Frontend: `{status: 'deferred'}` vs Backend expects: `{is_deferral: true}`
- ❌ Frontend: `camelCase` vs Backend: `snake_case` (without mapping)
- ❌ Frontend assumes field exists vs Backend doesn't return it

**Verification Commands**:
```bash
# Check what frontend sends
grep -r "JSON.stringify" src/ --include="*.tsx" -A 3 -B 3

# Check what backend expects
grep -r "class.*Create\|class.*Update" backend/ -A 15

# Check response mapping
grep -r "response.json()" src/ -A 5
```

### 3. Mobile-First Testing (if applicable)
**Rule**: Test touch interactions on actual mobile devices.

**Testing Checklist**:
```bash
# After UI changes, verify:
- [ ] Swipe gestures work (if applicable)
- [ ] Tap targets are appropriately sized (min 44x44px)
- [ ] Layout adapts to mobile screens
- [ ] Keyboard navigation works
- [ ] Loading states don't break mobile UX
```

### 4. Documentation-Driven Development
**Rule**: Update docs with implementation, not after.

**When to Update Docs**:
- Immediately after completing a feature
- When discovering a new pattern
- After fixing a significant bug
- When implementing a new architectural decision

---

## Implementation Workflow (MANDATORY ORDER)

```
1. VERIFY (2-3 min)    → grep/find existing patterns
2. ANALYZE (3-5 min)   → understand contracts and conventions
3. DESIGN (2-3 min)    → adapt patterns to requirements
4. IMPLEMENT (5-10 min)→ follow established conventions
5. DEBUG (2-5 min)     → add monitoring FIRST, never guess
6. TEST (3-5 min)      → verify functionality works
7. DOCUMENT (2-3 min)  → update REQUIREMENTS.md if needed
```

**Total Time**: 20-30 minutes per feature (with verification)
**Without Verification**: 2+ hours (due to debugging false starts)

---

## TDD Zones Framework

### 🔴 RED ZONE - Strict TDD Required
**Write tests FIRST for:**
- API contract changes
- Core business logic
- State management
- Database operations
- Anything that could break existing functionality

**Process**:
```bash
1. Write failing test capturing requirement
2. Run test → verify it fails for RIGHT reason
3. Write minimal code to pass
4. Refactor if needed
5. Run tests again → verify pass
```

### 🟡 YELLOW ZONE - Architecture-First Allowed
**Design architecture, then test for:**
- New UI components
- New feature modules
- External service integrations
- Database schema additions

**Process**:
```bash
1. Verify no existing patterns to follow
2. Design component/API architecture
3. Implement WITH comprehensive tests
4. Document patterns discovered
```

### 🟢 GREEN ZONE - Test-After Acceptable
**Test after implementation for:**
- Styling and CSS
- Documentation
- Build configuration
- Simple utility functions
- Proof of concepts

**Decision Framework**:
```
Could this break existing functionality? → RED ZONE
Is this a new component/feature?         → YELLOW ZONE
Is this styling/docs/tooling?            → GREEN ZONE
Does this touch API contracts?           → RED ZONE
```

---

## Debugging Methodology: "Monitor First, Fix Second"

### When Something Fails

**NEVER**:
- Guess at solutions
- Make random changes hoping to fix
- Skip monitoring/logging

**ALWAYS**:
```javascript
// 1. Add comprehensive logging
console.log('=== FUNCTION CALLED ===');
console.log('Input:', input);
console.log('State:', currentState);
console.log('Expected:', expected);
console.log('Actual:', actual);

// 2. Add debug triggers
<button onClick={debugFunction}>Debug Test</button>

// 3. Monitor for interference
setInterval(() => {
  const element = document.getElementById('target');
  if (!element) console.warn('Element disappeared!');
}, 1000);
```

**Process**:
```
1. REPRODUCE  → Confirm exact failure conditions
2. MONITOR    → Add logging throughout affected code
3. DEPLOY     → Push debugging version (if needed)
4. OBSERVE    → Check logs for actual vs expected behavior
5. DIAGNOSE   → Identify root cause from data
6. FIX        → Address root cause, not symptoms
7. VERIFY     → Test fix works in all scenarios
8. CLEAN      → Remove debug logging
```

---

## Pattern Recognition Examples

### Example 1: Adding New API Endpoint

**Step 1 - Verify existing patterns**:
```bash
grep -r "@app\.get\|@app\.post" backend/main.py -A 10
```

**Step 2 - Identify pattern**:
```python
# Discovered pattern:
@app.get("/resource", response_model=List[ResourceResponse])
async def get_resources(db: Session = Depends(get_db)):
    results = db.query(DBResource).all()
    return results
```

**Step 3 - Apply pattern**:
```python
# New endpoint following exact pattern:
@app.get("/search", response_model=List[TaskResponse])
async def search_tasks(
    q: str,
    db: Session = Depends(get_db)
):
    results = db.query(DBTask).filter(
        DBTask.title.ilike(f"%{q}%")
    ).all()
    return results
```

### Example 2: Frontend-Backend Integration

**Step 1 - Verify what backend returns**:
```bash
curl http://localhost:8000/api/endpoint | python3 -m json.tool
```

**Step 2 - Check existing mapping functions**:
```bash
grep -r "map.*Task" src/ --include="*.tsx" -A 10
```

**Step 3 - Apply discovered pattern**:
```typescript
// Found mapping pattern:
const mapBackendToFrontend = (item: any): Type => ({
  id: item.id,
  camelCase: item.snake_case,  // Convention discovered
  // ...
})

// Apply same pattern to new data:
const mapNewData = (item: any): NewType => ({
  id: item.id,
  newField: item.new_field,  // Follow same snake_case → camelCase
  // ...
})
```

---

## Session Management Protocol

### First Session of Day

```bash
# 1. Create session log
touch development/session-logs/YYYY-MM-DD-session-log.md

# 2. Review key documents
cat CLAUDE.md | head -100  # Read methodology
git log --oneline -10      # Recent commits
cat docs/REQUIREMENTS.md | grep "Status:"  # Current phase

# 3. Initialize environment
git status
npm test  # or pytest for backend
```

### Session Log Template

```markdown
# Session Log: YYYY-MM-DD

## Session Start: HH:MM

### Context
- Git Status: [clean/modified]
- Recent Commits: [list 3-5]
- Current Phase: [from REQUIREMENTS]

### Session Objectives
1. [Primary objective]
2. [Secondary objective]

### Activities
[Timestamp] - [Activity description]

### Discoveries & Patterns
- [Pattern found]
- [Decision made]

### Session End
- Completed: [what was done]
- Next Session: [recommendations]
```

---

## Code Quality Standards

### TypeScript/React
```typescript
// ✅ GOOD: Functional components with proper typing
interface Props {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    onComplete(task.id);
  }, [task.id, onComplete]);  // Proper dependencies

  return <div onClick={handleClick}>{task.title}</div>;
}

// ❌ BAD: Missing types, improper dependencies
export function TaskCard(props: any) {
  const handleClick = () => {
    props.onComplete(props.task.id);
  };
  return <div onClick={handleClick}>{props.task.title}</div>;
}
```

### Python/FastAPI
```python
# ✅ GOOD: Pydantic validation, type hints, proper error handling
@app.post("/tasks", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db)
) -> TaskResponse:
    try:
        db_task = DBTask(**task.dict())
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ❌ BAD: No validation, no error handling
@app.post("/tasks")
async def create_task(task: dict, db: Session = Depends(get_db)):
    db_task = DBTask(**task)
    db.add(db_task)
    db.commit()
    return db_task
```

---

## Git Workflow

### Commit Message Format
```bash
# Good structure:
git commit -m "$(cat <<'EOF'
Brief title summarizing change (50 chars)

Details:
- What was implemented
- Why it was needed
- Any breaking changes

Testing:
- Tests added/modified
- Verification performed
EOF
)"
```

### When to Commit
```
✅ Commit when:
- Feature is complete and tested
- Bug is fixed and verified
- Tests are passing
- Documentation is updated

❌ Don't commit when:
- Tests are failing
- Work is incomplete
- Breaking changes without migration
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Contract Mismatch
```typescript
// ❌ WRONG
fetch('/api/tasks', {
  body: JSON.stringify({ status: 'deferred' })
})
// Backend expects: { is_deferral: true }

// ✅ CORRECT - Check backend model first!
grep -r "TaskUpdate" backend/ -A 10
// Discovered: is_deferral field required
fetch('/api/tasks', {
  body: JSON.stringify({ is_deferral: true })
})
```

### Pitfall 2: Skipping Verification
```bash
# ❌ WRONG APPROACH
# "I'll just implement this feature based on what I think the pattern is"
[implements feature]
[encounters bugs]
[spends 2 hours debugging]

# ✅ CORRECT APPROACH
# 1. Verify first (2 minutes)
grep -r "similar_feature" src/ -A 10

# 2. Understand pattern (3 minutes)
[reads existing implementation]

# 3. Implement (10 minutes)
[follows discovered pattern]

# 4. Works first try
```

### Pitfall 3: Debugging Without Monitoring
```javascript
// ❌ WRONG
function myFunction() {
  doSomething();
  // Why isn't this working? [makes random changes]
}

// ✅ CORRECT
function myFunction() {
  console.log('=== myFunction called ===');
  console.log('Input:', arguments);
  const result = doSomething();
  console.log('Result:', result);
  console.log('Expected:', expected);
  return result;
}
```

---

## Success Metrics

### Velocity Indicators
- ✅ Features implemented in 20-30 minutes (vs 2+ hours)
- ✅ Bugs fixed in 15 minutes (vs hours of guessing)
- ✅ First implementation works (vs multiple iterations)
- ✅ Tests pass on first run

### Quality Indicators
- ✅ No contract mismatches between frontend/backend
- ✅ Patterns are consistent across codebase
- ✅ Code follows established conventions
- ✅ Documentation stays current

---

## Quick Reference Decision Tree

```
NEW TASK RECEIVED
    ↓
Have I verified existing patterns?
    NO → STOP! Run grep/find commands first
    YES → Continue
    ↓
Does this involve API contracts?
    YES → Verify Pydantic models match frontend payloads
    NO → Continue
    ↓
Is this new business logic?
    YES → Write tests FIRST (RED ZONE)
    NO → Continue
    ↓
Is this a new UI component?
    YES → Design first, test during (YELLOW ZONE)
    NO → Continue
    ↓
Is this styling/docs?
    YES → Implement, test after (GREEN ZONE)
    ↓
IMPLEMENT following discovered patterns
    ↓
Something not working?
    YES → Add logging FIRST, diagnose from data
    NO → Continue
    ↓
Tests passing?
    YES → Update documentation, commit
    NO → Review logs, fix root cause
```

---

## Example: Complete Feature Implementation

**Task**: Add search functionality across task hierarchies

**1. VERIFY (2 min)**:
```bash
# Check existing API patterns
grep -r "@app\.get" backend/main.py -A 5

# Check existing search implementations
grep -r "search\|filter" backend/ --include="*.py"

# Check frontend fetch patterns
grep -r "fetch.*8000" src/ --include="*.tsx" -A 3
```

**Discovered**:
- Backend uses FastAPI with `response_model=List[Response]`
- Database queries use SQLAlchemy `.filter()` and `.ilike()`
- Frontend maps snake_case → camelCase

**2. ANALYZE (3 min)**:
```python
# Backend pattern:
@app.get("/endpoint", response_model=List[ModelResponse])
async def handler(param: str, db: Session = Depends(get_db)):
    results = db.query(Model).filter(Model.field.ilike(f"%{param}%")).all()
    return results
```

```typescript
// Frontend pattern:
const response = await fetch(`${API_URL}/endpoint?param=${value}`);
const data = await response.json();
const mapped = data.map(mapBackendToFrontend);
```

**3. DESIGN (2 min)**:
- Endpoint: `GET /search?q={query}`
- Query: title + description fields
- Response: Tasks with breadcrumb paths
- Frontend: SearchBar component with dropdown

**4. IMPLEMENT (10 min)**:
```python
# backend/main.py (following discovered pattern)
@app.get("/search", response_model=List[TaskResponse])
async def search_tasks(
    q: str,
    db: Session = Depends(get_db)
):
    pattern = f"%{q}%"
    results = db.query(DBTask).filter(
        (DBTask.title.ilike(pattern)) |
        (DBTask.description.ilike(pattern))
    ).all()
    return results
```

```typescript
// src/components/SearchBar.tsx (following discovered pattern)
const [results, setResults] = useState<Task[]>([]);

useEffect(() => {
  const search = async () => {
    const response = await fetch(`${API_URL}/search?q=${query}`);
    const data = await response.json();
    const mapped = data.map(mapBackendTaskToFrontendTask);
    setResults(mapped);
  };
  search();
}, [query]);
```

**5. DEBUG (0 min)**: Works first try due to verification

**6. TEST (3 min)**:
```bash
# Backend test
curl "http://localhost:8000/search?q=test" | jq

# Frontend test
npm test  # Existing tests still pass
```

**7. DOCUMENT (2 min)**:
```markdown
# REQUIREMENTS.md update:
- [x] Global search across hierarchies
  - Backend: GET /search?q={query}
  - Frontend: SearchBar component
  - Features: Case-insensitive, breadcrumb paths
```

**Total Time**: 22 minutes
**Result**: Feature works perfectly, tests pass, docs updated

---

## Anti-Patterns to Avoid

### ❌ Skip Verification
```bash
# DON'T DO THIS:
"I'll just implement based on what I think the pattern should be"
[implements incorrectly]
[debugging takes hours]
```

### ❌ Guess at Contracts
```typescript
// DON'T DO THIS:
// "The backend probably expects this format..."
fetch('/api/endpoint', {
  body: JSON.stringify({ myGuess: value })
})
// [fails due to wrong field name]
```

### ❌ Debug by Random Changes
```python
# DON'T DO THIS:
# Something's broken, let me try changing random things
def buggy_function():
    # try this?
    # maybe this?
    # what if I change this?
```

### ✅ Follow Beads Instead
```bash
# 1. Verify
grep -r "pattern" codebase/

# 2. Understand
[reads existing code]

# 3. Implement
[follows exact pattern]

# Result: Works first try
```

---

## Summary: The Beads Method in 30 Seconds

```
BEFORE any implementation:
1. grep/find existing patterns (2 min)
2. Understand contracts (3 min)
3. Implement following patterns (10 min)
4. If issues: Add logging first (2 min)
5. Test and document (5 min)

Total: 20-30 minutes
Success rate: >90%

WITHOUT Beads:
- Guess at implementation
- Hit contract mismatches
- Debug for hours
- Total: 2+ hours
- Success rate: ~40%
```

**The Excellence Flywheel**: Each verification builds knowledge → faster next time → higher quality → even faster future work → compounds infinitely

---

**Key Takeaway**: The 2-3 minutes spent on verification saves 2+ hours of debugging. ALWAYS verify first.
