# Implementation Plan: Unified Recursive Model with Projects

> **Decision**: Approach A (Unified Recursive) + Projects as Top-Level Containers
> **Date**: 2025-11-15
> **Status**: Implementation Plan - Ready to Execute

## Architecture Overview

### Conceptual Model

```
Project (Workspace/Container)
├── Root Stack (parent_id = NULL, status = 'todo')
│   ├── Task (can have children)
│   │   └── Child Stack (parent_id → Task)
│   │       └── Task (can have children)
│   │           └── (unlimited nesting...)
│   └── Task
└── Done Stack (status = 'done')
```

**Key Principle**: "Without projects, there's one default project. With projects, you switch between different root stacks."

## Database Schema

### New Unified Schema

```sql
-- Projects: Top-level containers
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),  -- hex color #RRGGBB
    icon VARCHAR(50),  -- emoji or icon name

    -- Integration configuration (per-project backends!)
    integration_type VARCHAR(50),  -- 'github', 'trello', 'asana', etc.
    integration_config JSONB,      -- API keys, board IDs, etc.

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE
);

-- Tasks: Unified recursive structure
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Status and completion
    completed BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'todo',  -- 'todo' | 'done'

    -- Recursive hierarchy (CORE FEATURE)
    parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,

    -- Optimization fields
    depth INTEGER DEFAULT 0,           -- for depth-limiting queries
    path TEXT,                         -- materialized path: '/uuid/uuid/uuid'
    sort_order INTEGER DEFAULT 0,      -- within siblings

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    deferred_at TIMESTAMP WITH TIME ZONE,

    -- Deferral tracking
    deferral_count INTEGER DEFAULT 0,

    -- External integration
    external_id VARCHAR(255),
    source VARCHAR(100),
    metadata JSONB,  -- preserve rich data from integrations

    -- Indexes for performance
    CONSTRAINT tasks_project_fk FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT tasks_parent_fk FOREIGN KEY (parent_id) REFERENCES tasks(id)
);

-- Indexes for efficient queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_project_parent ON tasks(project_id, parent_id);
CREATE INDEX idx_tasks_path ON tasks USING GIN (path gin_trgm_ops);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_sort_order ON tasks(sort_order);

-- Default project for migration
INSERT INTO projects (id, name, description, color)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'My Tasks',
    'Default project',
    '#f35343'
);
```

### Migration Strategy

**Phase 1: Add Projects Table**
```sql
-- Create projects table
-- Insert default project
-- Add project_id column to tasks (nullable initially)
ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects(id);
UPDATE tasks SET project_id = '00000000-0000-0000-0000-000000000001';
ALTER TABLE tasks ALTER COLUMN project_id SET NOT NULL;
```

**Phase 2: Unify Task Structures**
```sql
-- Add parent_id for recursion
ALTER TABLE tasks ADD COLUMN parent_id UUID REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN depth INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN path TEXT;

-- Migrate existing substacks → tasks with parent_id
-- (complex migration script needed)

-- Drop old substacks and substack_tasks tables
DROP TABLE substack_tasks;
DROP TABLE substacks;
```

## API Design

### Projects API

```python
# GET /projects
# Returns all projects for the user
[
    {
        "id": "uuid",
        "name": "Work",
        "color": "#4f46e5",
        "integration_type": "github",
        "task_count": 12,
        "completed_count": 45
    }
]

# POST /projects
# Create new project
{
    "name": "Personal",
    "color": "#f35343",
    "icon": "🏠"
}

# PUT /projects/{id}
# Update project

# DELETE /projects/{id}
# Archive project (soft delete)
```

### Tasks API (Enhanced for Recursion)

```python
# GET /projects/{project_id}/tasks
# Get root tasks for a project (parent_id IS NULL)
# Query params: ?status=todo|done

# GET /projects/{project_id}/tasks/{task_id}
# Get task with immediate children

# GET /projects/{project_id}/tasks/{task_id}/tree
# Get entire subtree (recursive)

# POST /projects/{project_id}/tasks
# Create root task
{
    "title": "New Task",
    "description": "Details"
}

# POST /projects/{project_id}/tasks/{parent_id}/children
# Create child task (substack)
{
    "title": "Subtask",
    "description": "Details"
}

# PUT /tasks/{id}
# Update task (title, description, status)

# PUT /tasks/{id}/move
# Move task to different parent or project
{
    "parent_id": "uuid",  # or null for root
    "project_id": "uuid"   # optional: move to different project
}

# DELETE /tasks/{id}
# Delete task (cascade deletes children)
```

### Search API

```python
# GET /search/tasks?q={query}&project_id={id}
# Global search across tasks
# If project_id omitted, search ALL projects

# Returns tasks with breadcrumb path
[
    {
        "id": "uuid",
        "title": "Found task",
        "project": {"id": "...", "name": "Work"},
        "breadcrumb": ["Parent Task", "Child Task", "This Task"]
    }
]
```

## Frontend Architecture

### State Management

```typescript
interface Project {
    id: string;
    name: string;
    color: string;
    icon?: string;
    integration_type?: string;
    task_count: number;
    completed_count: number;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    status: 'todo' | 'done';

    // Hierarchy
    parent_id?: string;
    project_id: string;
    depth: number;
    path: string;

    // Children (lazy-loaded)
    children?: Task[];
    has_children: boolean;

    // Metadata
    created_at: Date;
    completed_at?: Date;
    sort_order: number;
}

interface AppState {
    currentProject: Project | null;
    projects: Project[];

    // Stack navigation (push/pop for zoom)
    taskStack: Task[][];  // Array of task arrays (each level)
    currentDepth: number;

    // Current view
    currentTasks: Task[];  // Tasks at current depth
    breadcrumb: Task[];    // Path to current location
}
```

### Navigation Model (Zoom/Push-Pop)

```typescript
// Initial state: Root stack
taskStack = [
    [task1, task2, task3]  // Root tasks
];
currentDepth = 0;

// User clicks task1 → "zoom in" to children
taskStack = [
    [task1, task2, task3],     // Root tasks
    [task1.1, task1.2]         // Children of task1
];
currentDepth = 1;

// User clicks task1.1 → "zoom deeper"
taskStack = [
    [task1, task2, task3],     // Root
    [task1.1, task1.2],        // Children of task1
    [task1.1.1, task1.1.2]     // Children of task1.1
];
currentDepth = 2;

// User clicks "back" → "zoom out" (pop)
taskStack.pop();
currentDepth = 1;
```

### UI Components

```
<ProjectSwitcher>           // Top bar: switch between projects
<Breadcrumb>                // Show path: Project > Task1 > Task1.1
<CardDeck>                  // Display tasks at current depth
  <TaskCard>                // Individual task
    <ChildrenIndicator>     // Shows if task has children (zoom icon)
<NavigationControls>        // Back button, up to root
```

## Implementation Phases

### Phase 1: Database Migration (2-3 hours)
- [ ] Create projects table
- [ ] Add project_id to tasks
- [ ] Migrate existing tasks to default project
- [ ] Add parent_id, depth, path columns
- [ ] Write migration script for substacks → child tasks
- [ ] Test migration with existing data
- [ ] Drop old substacks tables

### Phase 2: Backend API Updates (4-5 hours)
- [ ] Update Pydantic models (Task, Project)
- [ ] Implement Projects CRUD endpoints
- [ ] Update Tasks endpoints for hierarchy
- [ ] Add recursive queries (get tree, get ancestors)
- [ ] Implement search API
- [ ] Update tests for new schema
- [ ] Add depth calculation logic

### Phase 3: Frontend State Management (3-4 hours)
- [ ] Create Project context/state
- [ ] Implement task stack (push/pop) state
- [ ] Update API client for new endpoints
- [ ] Add breadcrumb calculation
- [ ] Handle loading states for recursive fetches

### Phase 4: UI Components (5-6 hours)
- [ ] Build ProjectSwitcher component
- [ ] Build Breadcrumb component
- [ ] Update CardDeck for zoom navigation
- [ ] Add "zoom in" interaction (when task has children)
- [ ] Add "zoom out" / back button
- [ ] Update TaskDetails for creating children
- [ ] Add visual indicators (has children, depth)

### Phase 5: Search & Polish (2-3 hours)
- [ ] Implement global search
- [ ] Add keyboard shortcuts (Cmd+K for search, Backspace for zoom out)
- [ ] Add animations for zoom in/out
- [ ] Test unlimited nesting (create 10+ levels)
- [ ] Performance testing with large hierarchies
- [ ] Update documentation

**Total Estimated Time**: 16-21 hours

## Key Decisions Made

✅ **Approach A** - Unified recursive model (clean, simple)
✅ **Unlimited nesting** - No artificial depth limits
✅ **Zoom navigation** - Push/pop stack metaphor
✅ **Projects as containers** - One root stack per project
✅ **Per-project integrations** - Different backends per project
✅ **Global search** - Search across all projects
⏳ **Cross-project task moves** - Nice-to-have, roadmap item

## Technical Decisions

**Why unlimited nesting?**
- No technical reason to limit it
- Users self-limit based on UX complexity
- Database handles it fine with indexes
- Materialized path optimization keeps queries fast

**Why zoom model?**
- Natural mental model (drilling down)
- Keeps UI simple (one stack at a time)
- Easy keyboard navigation (back = zoom out)
- Aligns with "one task at a time" philosophy

**Why per-project integrations?**
- Flexibility for different workflows
- GitHub for code projects, Trello for planning, etc.
- Clean separation of concerns
- Each project can have different backends

## Migration Path from Current Schema

```sql
-- Current schema has 3 tables:
-- tasks, substacks, substack_tasks

-- Step 1: Create projects
CREATE TABLE projects (...);

-- Step 2: Create default project
INSERT INTO projects VALUES (...);

-- Step 3: Add new columns to tasks
ALTER TABLE tasks ADD COLUMN project_id UUID;
ALTER TABLE tasks ADD COLUMN parent_id UUID;

-- Step 4: Migrate data
-- All existing tasks → default project, parent_id = NULL
UPDATE tasks SET project_id = 'default-uuid', parent_id = NULL;

-- Step 5: Migrate substacks → child tasks
INSERT INTO tasks (id, title, description, completed, parent_id, project_id, ...)
SELECT
    st.id,
    st.title,
    st.description,
    st.completed,
    s.parent_task_id AS parent_id,  -- parent is the task that owns the substack
    t.project_id,  -- inherit project from parent
    ...
FROM substack_tasks st
JOIN substacks s ON st.substack_id = s.id
JOIN tasks t ON s.parent_task_id = t.id;

-- Step 6: Update paths and depths
-- (Run recursive function to calculate these)

-- Step 7: Drop old tables
DROP TABLE substack_tasks;
DROP TABLE substacks;
```

## Next Steps

**Ready to implement?** I can start with:
1. Database migration script
2. Update backend models and API
3. Test with existing data
4. Build frontend components

**Or would you prefer**:
- Review this plan first
- Start with a proof-of-concept
- Tackle in smaller chunks

Let me know and I'll get started! 🚀
