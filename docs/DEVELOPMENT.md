# Developer Guide

This guide helps developers understand how to extend, modify, and contribute to One Job.

## 🎯 Getting Started

### Development Environment Setup

#### 1. Prerequisites
```bash
# Required
node >= 16.0.0
python >= 3.9.0
git

# Recommended
vscode (with extensions)
```

#### 2. Clone and Setup
```bash
git clone <repository-url>
cd one-job

# Backend setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
npm install
```

#### 3. Environment Configuration
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit database URL if needed
```

#### 4. Start Development
```bash
# Terminal 1 - Backend
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
npm run dev
```

### Development Tools

#### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance", 
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json"
  ]
}
```

#### Code Formatting
```json
// .vscode/settings.json
{
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

---

## 🏗️ Architecture Overview

### Project Structure
```
one-job/
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints and app setup
│   ├── test_main.py        # Unit tests
│   ├── test_integration.py # Integration tests
│   └── .env                # Environment configuration
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Route components
│   ├── types/             # TypeScript definitions
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── docs/                  # Documentation
├── public/                # Static assets
└── README.md             # Project overview
```

### Key Design Patterns

#### Backend Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Dependency Injection**: Testable components
- **Domain Events**: Decoupled communication

#### Frontend Patterns
- **Custom Hooks**: Reusable state logic
- **Compound Components**: Flexible UI composition
- **Render Props**: Behavior sharing
- **Container/Presenter**: Separation of concerns

---

## 🔌 Extension Points

### 1. Adding New Task Fields

#### Backend Changes
```python
# Add to main.py DBTask model
class DBTask(Base):
    # ... existing fields ...
    priority: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(String, nullable=True)

# Update Pydantic models
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = None  # "high", "medium", "low"
    tags: Optional[str] = None      # JSON string of tags

class TaskResponse(TaskBase):
    # ... existing fields ...
    priority: Optional[str] = None
    tags: Optional[str] = None
```

#### Frontend Changes
```typescript
// Update types/task.ts
export interface Task {
  // ... existing fields ...
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
}

// Update TaskForm.tsx
const TaskForm = () => {
  const [priority, setPriority] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  
  const handleSubmit = async (data) => {
    const taskData = {
      ...data,
      priority,
      tags: tags.join(',')
    }
    await onAddTask(taskData)
  }
}
```

#### Database Migration
```python
# Create migration script
def upgrade_add_task_fields():
    """Add priority and tags to tasks table"""
    op.add_column('tasks', sa.Column('priority', sa.String(), nullable=True))
    op.add_column('tasks', sa.Column('tags', sa.String(), nullable=True))
```

### 2. Creating Custom Task Views

#### New Component Structure
```typescript
// src/components/CustomTaskView.tsx
import React from 'react'
import { Task } from '@/types/task'

interface CustomTaskViewProps {
  tasks: Task[]
  onTaskAction: (taskId: string, action: string) => void
  viewMode: 'kanban' | 'list' | 'calendar'
}

export const CustomTaskView: React.FC<CustomTaskViewProps> = ({
  tasks,
  onTaskAction,
  viewMode
}) => {
  const renderKanbanView = () => (
    <div className="flex gap-4">
      <TaskColumn title="Todo" tasks={todoTasks} />
      <TaskColumn title="In Progress" tasks={inProgressTasks} />
      <TaskColumn title="Done" tasks={doneTasks} />
    </div>
  )
  
  const renderListView = () => (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskListItem key={task.id} task={task} onAction={onTaskAction} />
      ))}
    </div>
  )
  
  switch (viewMode) {
    case 'kanban': return renderKanbanView()
    case 'list': return renderListView()
    default: return renderListView()
  }
}
```

#### Integration with Main App
```typescript
// Update pages/Index.tsx
import { CustomTaskView } from '@/components/CustomTaskView'

const Index = () => {
  const [viewMode, setViewMode] = useState<'stack' | 'kanban' | 'list'>('stack')
  
  const renderTaskView = () => {
    switch (viewMode) {
      case 'stack':
        return <TaskStack tasks={activeTasks} />
      case 'kanban':
      case 'list':
        return <CustomTaskView 
          tasks={tasks} 
          viewMode={viewMode}
          onTaskAction={handleTaskAction}
        />
    }
  }
  
  return (
    <div>
      <ViewModeSelector currentMode={viewMode} onChange={setViewMode} />
      {renderTaskView()}
    </div>
  )
}
```

### 3. Adding External Integrations

#### Integration Service Pattern
```python
# backend/integrations/base.py
from abc import ABC, abstractmethod
from typing import List, Optional

class ExternalIntegration(ABC):
    """Base class for external system integrations"""
    
    @abstractmethod
    async def authenticate(self, credentials: dict) -> bool:
        """Authenticate with external system"""
        pass
    
    @abstractmethod
    async def import_tasks(self) -> List[ExternalTask]:
        """Import tasks from external system"""
        pass
    
    @abstractmethod  
    async def export_task(self, task: Task) -> Optional[str]:
        """Export task to external system, return external ID"""
        pass
    
    @abstractmethod
    async def sync_task(self, task: Task, external_id: str) -> bool:
        """Sync task changes with external system"""
        pass

# backend/integrations/linear.py
class LinearIntegration(ExternalIntegration):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = LinearClient(api_key)
    
    async def authenticate(self, credentials: dict) -> bool:
        try:
            await self.client.me()
            return True
        except Exception:
            return False
    
    async def import_tasks(self) -> List[ExternalTask]:
        issues = await self.client.get_issues()
        return [
            ExternalTask(
                title=issue.title,
                description=issue.description,
                external_id=issue.id,
                source="linear",
                priority=self._map_priority(issue.priority)
            )
            for issue in issues
        ]
```

#### Integration API Endpoints
```python
# Add to main.py
@app.post("/integrations/{integration_type}/import")
async def import_from_integration(
    integration_type: str,
    credentials: dict,
    db: Session = Depends(get_db)
):
    integration = get_integration(integration_type, credentials)
    
    if not await integration.authenticate(credentials):
        raise HTTPException(401, "Authentication failed")
    
    external_tasks = await integration.import_tasks()
    
    imported_tasks = []
    for ext_task in external_tasks:
        db_task = DBTask(
            title=ext_task.title,
            description=ext_task.description,
            external_id=ext_task.external_id,
            source=ext_task.source
        )
        db.add(db_task)
        imported_tasks.append(db_task)
    
    db.commit()
    return {"imported": len(imported_tasks)}
```

### 4. Custom Business Rules

#### Rule Engine Pattern
```python
# backend/rules/engine.py
class BusinessRule(ABC):
    @abstractmethod
    def applies_to(self, task: Task, operation: str) -> bool:
        """Check if rule applies to this task/operation"""
        pass
    
    @abstractmethod
    def execute(self, task: Task, operation: str) -> Task:
        """Execute the business rule"""
        pass

class AutoCompleteSubtasksRule(BusinessRule):
    """Auto-complete parent task when all substacks are done"""
    
    def applies_to(self, task: Task, operation: str) -> bool:
        return (operation == "complete_substack_task" and 
                task.substacks and 
                len(task.substacks) > 0)
    
    def execute(self, task: Task, operation: str) -> Task:
        all_subtasks_done = all(
            all(st.completed for st in substack.tasks)
            for substack in task.substacks
        )
        
        if all_subtasks_done:
            task.status = "done"
            task.completed = True
            task.completed_at = datetime.now()
        
        return task

# Rule engine integration
class RuleEngine:
    def __init__(self, rules: List[BusinessRule]):
        self.rules = rules
    
    def apply_rules(self, task: Task, operation: str) -> Task:
        for rule in self.rules:
            if rule.applies_to(task, operation):
                task = rule.execute(task, operation)
        return task
```

### 5. Custom Animations and Gestures

#### Gesture Hook Pattern
```typescript
// src/hooks/useCustomGestures.ts
import { useSwipeable } from 'react-swipeable'

export const useCustomGestures = (options: GestureOptions) => {
  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (eventData.deltaX < -100) {
        options.onSwipeLeft?.()
      }
    },
    
    onSwipedRight: (eventData) => {
      if (eventData.deltaX > 100) {
        options.onSwipeRight?.()
      }
    },
    
    onSwipedUp: (eventData) => {
      if (eventData.deltaY < -50) {
        options.onSwipeUp?.()
      }
    },
    
    onTap: (eventData) => {
      if (eventData.event.detail === 2) { // Double tap
        options.onDoubleTap?.()
      }
    }
  })
  
  return handlers
}

// Usage in component
const TaskCard = ({ task, onComplete, onDefer, onEdit }) => {
  const gestureHandlers = useCustomGestures({
    onSwipeLeft: () => onDefer(task.id),
    onSwipeRight: () => onComplete(task.id),
    onSwipeUp: () => onEdit(task.id),
    onDoubleTap: () => onEdit(task.id)
  })
  
  return (
    <motion.div
      {...gestureHandlers}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Task content */}
    </motion.div>
  )
}
```

---

## 🧪 Testing Extensions

### Backend Testing Patterns

#### Service Layer Tests
```python
# test_task_service.py
import pytest
from unittest.mock import Mock
from services.task_service import TaskService

class TestTaskService:
    @pytest.fixture
    def mock_repo(self):
        return Mock()
    
    @pytest.fixture
    def task_service(self, mock_repo):
        return TaskService(mock_repo)
    
    async def test_create_task_assigns_sort_order(self, task_service, mock_repo):
        # Given
        mock_repo.get_max_sort_order.return_value = 5
        task_data = TaskCreate(title="Test Task")
        
        # When
        await task_service.create_task(task_data)
        
        # Then
        mock_repo.create.assert_called_once()
        created_task = mock_repo.create.call_args[0][0]
        assert created_task.sort_order == 6
```

#### Integration Tests
```python
# test_integration_complete.py
async def test_complete_task_workflow_with_substacks(test_client):
    # Create parent task
    response = test_client.post("/tasks", json={"title": "Parent Task"})
    parent_id = response.json()["id"]
    
    # Create substack
    response = test_client.post(f"/tasks/{parent_id}/substacks", 
                               json={"name": "Development"})
    substack_id = response.json()["id"]
    
    # Add tasks to substack
    for i in range(3):
        test_client.post(f"/substacks/{substack_id}/tasks",
                        json={"title": f"Subtask {i+1}"})
    
    # Complete all subtasks
    subtasks = test_client.get("/tasks").json()[0]["substacks"][0]["tasks"]
    for subtask in subtasks:
        test_client.put(f"/substack-tasks/{subtask['id']}", 
                       json={"completed": True})
    
    # Verify parent task auto-completion (if rule enabled)
    updated_parent = test_client.get("/tasks").json()[0]
    # Add assertions based on your business rules
```

### Frontend Testing Patterns

#### Component Testing
```typescript
// __tests__/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '@/components/TaskCard'

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    status: 'todo'
  }
  
  it('calls onSwipeRight when swiped right', () => {
    const onSwipeRight = jest.fn()
    render(<TaskCard task={mockTask} onSwipeRight={onSwipeRight} />)
    
    const card = screen.getByTestId('task-card')
    fireEvent.swipeRight(card)
    
    expect(onSwipeRight).toHaveBeenCalledWith('1')
  })
  
  it('displays task content correctly', () => {
    render(<TaskCard task={mockTask} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })
})
```

#### Hook Testing
```typescript
// __tests__/useTaskManagement.test.ts
import { renderHook, act } from '@testing-library/react-hooks'
import { useTaskManagement } from '@/hooks/useTaskManagement'

describe('useTaskManagement', () => {
  it('adds task and updates state', async () => {
    const { result } = renderHook(() => useTaskManagement())
    
    await act(async () => {
      await result.current.addTask({
        title: 'New Task',
        description: 'Task description'
      })
    })
    
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('New Task')
  })
})
```

---

## 🚀 Performance Optimization

### Backend Optimization

#### Database Query Optimization
```python
# Eager loading relationships
def get_tasks_with_substacks(db: Session) -> List[DBTask]:
    return (
        db.query(DBTask)
        .options(joinedload(DBTask.substacks).joinedload(DBSubstack.tasks))
        .all()
    )

# Batch operations
async def bulk_update_tasks(task_updates: List[TaskUpdate], db: Session):
    for update in task_updates:
        db.query(DBTask).filter(DBTask.id == update.id).update(update.dict())
    db.commit()
```

#### Caching Strategy
```python
from functools import lru_cache
import redis

# Memory caching
@lru_cache(maxsize=128)
def get_task_count_by_status(status: str) -> int:
    # Expensive calculation
    pass

# Redis caching
class TaskCache:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def get_tasks(self, user_id: str) -> Optional[List[Task]]:
        cached = await self.redis.get(f"tasks:{user_id}")
        if cached:
            return json.loads(cached)
        return None
    
    async def set_tasks(self, user_id: str, tasks: List[Task]):
        await self.redis.setex(
            f"tasks:{user_id}", 
            300,  # 5 minutes
            json.dumps([task.dict() for task in tasks])
        )
```

### Frontend Optimization

#### Component Memoization
```typescript
// Expensive component memoization
const TaskCard = React.memo(({ task, onSwipeRight, onSwipeLeft }) => {
  return (
    <div className="task-card">
      {/* Task content */}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.title === nextProps.task.title
})

// Hook memoization
const useTaskCalculations = (tasks: Task[]) => {
  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => isOverdue(t)).length
    }
  }, [tasks])
  
  return taskStats
}
```

#### Virtual Scrolling (for large lists)
```typescript
import { FixedSizeList as List } from 'react-window'

const VirtualTaskList = ({ tasks }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  )
  
  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={100}
      itemData={tasks}
    >
      {Row}
    </List>
  )
}
```

---

## 🔧 Development Workflows

### Feature Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/task-priorities
   ```

2. **Backend Development**
   ```bash
   # Add database changes
   # Update models and endpoints
   # Write tests
   python -m pytest -v
   ```

3. **Frontend Development**
   ```bash
   # Update types and components
   # Add UI elements
   # Write component tests
   npm test
   ```

4. **Integration Testing**
   ```bash
   # Test full workflow
   # Manual testing in browser
   # API testing with Postman/curl
   ```

5. **Code Review & Merge**
   ```bash
   git push origin feature/task-priorities
   # Create pull request
   # Address review feedback
   git checkout main && git merge feature/task-priorities
   ```

### Debugging Strategies

#### Backend Debugging
```python
# Add logging
import logging
logger = logging.getLogger(__name__)

async def defer_task(task_id: UUID):
    logger.info(f"Starting deferral for task {task_id}")
    try:
        result = await task_service.defer_task(task_id)
        logger.info(f"Task {task_id} deferred successfully")
        return result
    except Exception as e:
        logger.error(f"Failed to defer task {task_id}: {str(e)}")
        raise

# Use debugger
import pdb; pdb.set_trace()  # Add breakpoint
```

#### Frontend Debugging
```typescript
// React DevTools
const TaskStack = ({ tasks }) => {
  useEffect(() => {
    console.log('Tasks updated:', tasks)
  }, [tasks])
  
  // Debug renders
  console.log('TaskStack render:', { taskCount: tasks.length })
  
  return <div>{/* Component JSX */}</div>
}

// Performance profiling
import { Profiler } from 'react'

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Component performance:', { id, phase, actualDuration })
}

<Profiler id="TaskStack" onRender={onRenderCallback}>
  <TaskStack tasks={tasks} />
</Profiler>
```

---

## 📚 Code Style Guidelines

### Backend Style (Python)

```python
# Use type hints
async def create_task(task_data: TaskCreate, db: Session) -> TaskResponse:
    """Create a new task with proper validation."""
    pass

# Error handling
try:
    result = await risky_operation()
except SpecificError as e:
    logger.error(f"Operation failed: {e}")
    raise HTTPException(400, f"Failed: {e}")

# Naming conventions
class TaskService:  # PascalCase for classes
    def create_task(self):  # snake_case for methods
        MAX_RETRIES = 3  # UPPER_CASE for constants
```

### Frontend Style (TypeScript)

```typescript
// Use proper TypeScript types
interface TaskCardProps {
  task: Task
  onSwipeRight: (id: string) => void
  onSwipeLeft: (id: string) => void
}

// Component naming and structure
export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onSwipeRight, 
  onSwipeLeft 
}) => {
  // Hooks at the top
  const [isVisible, setIsVisible] = useState(true)
  
  // Event handlers
  const handleSwipeRight = useCallback(() => {
    onSwipeRight(task.id)
  }, [task.id, onSwipeRight])
  
  // Render
  return (
    <div className="task-card">
      {/* JSX content */}
    </div>
  )
}
```

---

## 🎯 Common Extension Patterns

### Adding New API Endpoints

1. **Define Pydantic Models**
2. **Create Database Models** 
3. **Add API Endpoints**
4. **Write Tests**
5. **Update Frontend Types**
6. **Add Frontend Integration**

### Creating New UI Components

1. **Define Component Interface**
2. **Implement with TypeScript**
3. **Add Styling with Tailwind**
4. **Write Component Tests**
5. **Create Storybook Stories**
6. **Integrate with App**

This guide provides the foundation for extending One Job. For specific questions, refer to the codebase examples or open an issue in the repository.