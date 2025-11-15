# Nested Stacks and Project Organization - Design Analysis

> **Status**: Design Discussion Document
> **Created**: 2025-11-15
> **Purpose**: Gap analysis between current implementation and future vision

## 📊 Current State Analysis

### What's Implemented ✅

**Current Hierarchy** (1 level of nesting):
```
Task (DBTask)
└── Substack (DBSubstack)
    └── SubstackTask (DBSubstackTask)
```

**Database Schema**:
```sql
-- Main tasks
tasks: id, title, description, status, ...

-- Substacks (named containers within tasks)
substacks: id, name, parent_task_id → tasks.id

-- Tasks within substacks
substack_tasks: id, title, description, substack_id → substacks.id
```

**Key Characteristics**:
- ✅ Single level of task breakdown
- ✅ Main tasks can have multiple named substacks
- ✅ Each substack contains its own tasks
- ✅ Navigation between parent task and substack views
- ✅ Independent completion tracking per level
- ❌ **No nesting beyond 2 levels** (can't have substacks within substacks)
- ❌ **No project/workspace concept** (all tasks in one flat space)

### What's Documented 📝

**From REQUIREMENTS.md (FR2: Hierarchical Organization)**:
```
FR2.1.1 - Users SHALL be able to create named substacks within any task
FR2.2.1 - Users SHALL be able to add tasks to substacks
FR2.3.1 - Users SHALL be able to navigate into substack views
```

**From ARCHITECTURE.md (Domain Model)**:
```
Substack Domain
├── Substack Entity (id, name, parent_task_id)
├── SubstackTask Entities (tasks within substacks)
├── Hierarchical Operations (create, navigate, manage)
└── Parent-Child Relationships
```

**What's NOT Documented**:
- ❌ Nested substacks (substacks within substacks)
- ❌ Project/workspace organization
- ❌ Cross-project task movement
- ❌ Project-level views and filtering
- ❌ Arbitrary depth hierarchies

---

## 🎯 Vision: Nested Stacks & Projects

### Concept 1: Recursive Nested Stacks

**Proposed Hierarchy** (infinite nesting):
```
Task
└── Substack
    └── SubstackTask (which IS a Task)
        └── Substack (nested)
            └── SubstackTask
                └── Substack (deeper nesting)
                    └── ... (unlimited depth)
```

**Key Design Questions**:

1. **Is SubstackTask the same entity as Task?**
   - Option A: Unify into single `Task` entity with `parent_id` (recursive)
   - Option B: Keep separate but add `substacks` to `SubstackTask`
   - Option C: Create polymorphic `TaskNode` concept

2. **How deep should nesting go?**
   - Option A: Unlimited depth (true recursive structure)
   - Option B: Limit to 3-5 levels for UX/performance
   - Option C: Soft limit with warnings

3. **Navigation UX**:
   - Breadcrumb trail showing full path?
   - Collapse/expand tree view?
   - Card deck at each level?
   - Zoom-in/zoom-out metaphor?

### Concept 2: Project-Based Organization

**Proposed Structure**:
```
Workspace
├── Project 1 (e.g., "Work")
│   ├── Task A
│   │   └── Substacks...
│   └── Task B
├── Project 2 (e.g., "Personal")
│   ├── Task C
│   └── Task D
└── Project 3 (e.g., "Side Hustle")
    └── Tasks...
```

**Key Design Questions**:

1. **What is a Project?**
   - Option A: Simple tag/category on tasks
   - Option B: Separate entity with own properties (name, color, icon)
   - Option C: Full workspace concept with sharing/permissions

2. **Task-Project Relationship**:
   - Option A: Task belongs to ONE project (foreign key)
   - Option B: Task can be in MULTIPLE projects (many-to-many)
   - Option C: Hierarchical - projects can contain projects

3. **Cross-Project Operations**:
   - Can tasks move between projects?
   - Can substacks reference tasks from other projects?
   - Global search across all projects?

4. **UI/UX for Projects**:
   - Project switcher in header?
   - Sidebar with project list?
   - Card deck shows one project at a time?
   - "All tasks" view across projects?

---

## 🏗️ Proposed Architectural Approaches

### Approach A: Unified Recursive Task Model

**Database Schema**:
```sql
-- Single unified task table with recursion
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,

    -- Hierarchy
    parent_id UUID REFERENCES tasks(id),  -- NULL = root task
    depth INTEGER DEFAULT 0,              -- For performance queries
    path TEXT,                            -- Materialized path: "/uuid/uuid/uuid"

    -- Project
    project_id UUID REFERENCES projects(id),

    -- Task-specific fields
    status VARCHAR DEFAULT 'todo',
    sort_order INTEGER,
    created_at TIMESTAMP,
    ...
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    color VARCHAR,
    icon VARCHAR,
    created_at TIMESTAMP
);
```

**Pros**:
- ✅ Simple, elegant model
- ✅ Unlimited nesting depth
- ✅ Easy to query full trees with recursive CTEs
- ✅ Single source of truth

**Cons**:
- ❌ Breaking change from current schema
- ❌ Migration complexity
- ❌ Different semantics (what was "Substack" becomes just a task)

### Approach B: Enhanced Current Model

**Database Schema** (evolutionary):
```sql
-- Keep current tasks table
CREATE TABLE tasks (...existing fields...);

-- Enhance substacks to support nesting
CREATE TABLE substacks (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    parent_task_id UUID REFERENCES tasks(id),
    parent_substack_id UUID REFERENCES substacks(id),  -- NEW: for nesting
    depth INTEGER DEFAULT 1,
    created_at TIMESTAMP
);

-- Substack tasks can now have their own substacks
CREATE TABLE substack_tasks (
    id UUID PRIMARY KEY,
    ...existing fields...,
    -- No changes needed; substacks already reference tasks
);

-- New: Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    color VARCHAR,
    created_at TIMESTAMP
);

-- Add project_id to tasks
ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects(id);
```

**Pros**:
- ✅ Incremental evolution
- ✅ Backwards compatible with existing data
- ✅ Keeps "Substack" as meaningful concept
- ✅ Easier migration path

**Cons**:
- ❌ More complex model with 3 entities
- ❌ Harder to query deep hierarchies
- ❌ Conceptual complexity (Task vs SubstackTask)

### Approach C: Hybrid - Container-Based Model

**Conceptual Model**:
```
Container (Project, Substack, Folder...)
└── TaskNode (can be Task or Container)
    ├── Task (leaf node)
    └── Container (branch node)
        └── TaskNode (recursive)
```

**Database Schema**:
```sql
-- Polymorphic node table
CREATE TABLE task_nodes (
    id UUID PRIMARY KEY,
    type VARCHAR NOT NULL,  -- 'task', 'container', 'project'
    parent_id UUID REFERENCES task_nodes(id),
    depth INTEGER,
    path TEXT
);

-- Task-specific attributes
CREATE TABLE task_attributes (
    node_id UUID PRIMARY KEY REFERENCES task_nodes(id),
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR,
    completed BOOLEAN,
    ...
);

-- Container-specific attributes
CREATE TABLE container_attributes (
    node_id UUID PRIMARY KEY REFERENCES task_nodes(id),
    name VARCHAR NOT NULL,
    container_type VARCHAR,  -- 'project', 'substack', 'folder'
    color VARCHAR,
    ...
);
```

**Pros**:
- ✅ Maximum flexibility
- ✅ Supports any hierarchy
- ✅ Clean separation of concerns
- ✅ Easy to add new node types

**Cons**:
- ❌ Most complex approach
- ❌ Requires complete rewrite
- ❌ Harder to understand and maintain

---

## 🔍 Comparison Matrix

| Feature | Current | Approach A<br/>(Unified) | Approach B<br/>(Enhanced) | Approach C<br/>(Hybrid) |
|---------|---------|--------------------------|---------------------------|-------------------------|
| **Nesting Depth** | 2 levels | Unlimited | Unlimited | Unlimited |
| **Projects** | ❌ None | ✅ Native | ✅ Added | ✅ Native |
| **Migration Effort** | N/A | 🔴 High | 🟡 Medium | 🔴 Very High |
| **Query Complexity** | ✅ Simple | 🟡 Medium | 🔴 High | 🔴 High |
| **Conceptual Clarity** | ✅ Clear | ✅ Very Clear | 🟡 Medium | 🔴 Complex |
| **Backwards Compatible** | N/A | ❌ No | ✅ Yes | ❌ No |
| **Future Extensibility** | 🔴 Limited | 🟡 Good | 🟡 Good | ✅ Excellent |

---

## 💡 Recommendations

### Recommended Approach: **B - Enhanced Current Model**

**Rationale**:
1. **Incremental Evolution**: Can be implemented in phases
2. **Low Risk**: Backwards compatible with existing MVP
3. **User Familiarity**: Keeps "Substack" concept users already understand
4. **Practical Balance**: Supports nested stacks AND projects without complete rewrite

### Implementation Phases

#### Phase 1: Add Projects (No Nesting Changes)
```sql
-- Add project support to current schema
CREATE TABLE projects (...);
ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects(id);

-- UI: Project switcher, task filtering by project
```

**Deliverables**:
- Project creation and management
- Filter tasks by project
- Move tasks between projects
- Project-level views

**Effort**: ~15-20 hours

#### Phase 2: Enable Nested Substacks
```sql
-- Allow substacks to contain substacks
ALTER TABLE substacks ADD COLUMN parent_substack_id UUID REFERENCES substacks(id);
ALTER TABLE substacks ADD COLUMN depth INTEGER DEFAULT 1;

-- Substack tasks can now spawn new substacks
-- (This works through existing parent_task_id on substacks table)
```

**Deliverables**:
- Substacks can contain substacks (recursive)
- Breadcrumb navigation for deep hierarchies
- Collapse/expand tree view (optional)
- Depth limits and warnings

**Effort**: ~20-25 hours

#### Phase 3: Advanced Features
- Cross-project task references
- Project templates
- Project-level analytics
- Shared projects (multi-user)

**Effort**: ~40+ hours

---

## 🤔 Open Questions for Discussion

### Nested Stacks Questions

1. **Naming Convention**: If substacks can nest, are they still "substacks"? Or should we rename to "Folders", "Groups", "Collections"?

2. **UI Metaphor**: How do users navigate deep hierarchies?
   - Breadcrumbs?
   - Tree view sidebar?
   - Zoom in/out on card deck?
   - Search-based navigation?

3. **Depth Limits**: Should there be a maximum depth?
   - Performance considerations
   - UX complexity
   - Mobile screen real estate

4. **Task Identity**: When you create a substack task, is it:
   - A different type of entity (current model)?
   - The same as a main task (unified model)?
   - A task that "lives inside" a container?

### Project Questions

1. **Scope**: What is a project?
   - Just a tag/filter?
   - A workspace with own settings?
   - A billable client (for time tracking)?

2. **Task-Project Relationship**:
   - Can a task be in multiple projects? (e.g., "Update docs" relevant to multiple projects)
   - Or strict single-project ownership?

3. **Cross-Project Features**:
   - Global search across projects?
   - Dashboard showing all projects?
   - Move tasks between projects?

4. **Project Hierarchy**:
   - Can projects contain projects?
   - Or flat list only?

5. **Visual Identity**:
   - Projects have colors?
   - Icons?
   - Custom themes per project?

---

## 📝 Next Steps

### For Collaborative Discussion Tomorrow

1. **Validate Vision**: Confirm understanding of nested stacks and projects
2. **Choose Approach**: Decide on architectural direction (recommend Approach B)
3. **Prioritize Features**: Which comes first - projects or nested stacks?
4. **Define Scope**: What's MVP vs. nice-to-have?
5. **Create User Stories**: How would users interact with these features?
6. **Design UI/UX**: Sketch out navigation and interaction patterns
7. **Plan Migration**: If existing data needs to migrate, how?

### Immediate Actions Available

- [ ] Create proof-of-concept for Approach B schema changes
- [ ] Design UI mockups for project switcher
- [ ] Prototype breadcrumb navigation for deep hierarchies
- [ ] Write migration script for adding `project_id` to tasks
- [ ] Create test data with deep nesting scenarios

---

## 📚 References

**Current Implementation**:
- `/home/user/one-job/backend/main.py` - Database models (lines 91-143)
- `/home/user/one-job/docs/REQUIREMENTS.md` - FR2: Hierarchical Organization
- `/home/user/one-job/docs/ARCHITECTURE.md` - Domain model and patterns

**Design Patterns**:
- Composite Pattern: For recursive hierarchies
- Materialized Path: For efficient tree queries
- Adjacency List: Current implementation pattern

**Database Techniques**:
- Recursive CTEs: PostgreSQL tree queries
- Closure Tables: Alternative hierarchy storage
- Path Enumeration: Fast ancestor/descendant queries

---

*This document will be updated based on tomorrow's collaborative discussion to reflect final architectural decisions.*
