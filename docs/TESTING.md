# Testing Guide

Comprehensive testing strategy and examples for One Job application.

## 🎯 Testing Philosophy

One Job follows **Test-Driven Development (TDD)** principles with comprehensive coverage across all layers:

- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test component interactions and API endpoints
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Ensure system meets performance requirements

## 🏗️ Testing Architecture

### Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │ <- Browser automation (few)
                    │   (Playwright)  │
                    └─────────────────┘
                   ┌─────────────────────┐
                   │  Integration Tests  │ <- API + DB tests (some)
                   │     (pytest)        │
                   └─────────────────────┘
                 ┌───────────────────────────┐
                 │     Unit Tests            │ <- Component/function tests (many)
                 │  (pytest + React Testing) │
                 └───────────────────────────┘
```

### Test Categories

| Test Type | Purpose | Tools | Coverage |
|-----------|---------|-------|----------|
| **Unit Tests** | Test individual functions | pytest, Jest | 80%+ |
| **Integration Tests** | Test API endpoints + DB | pytest, TestClient | 90%+ |
| **Component Tests** | Test React components | React Testing Library | 70%+ |
| **E2E Tests** | Test complete workflows | Playwright | Critical paths |

---

## 🧪 Backend Testing

### Test Environment Setup

#### Test Configuration
```python
# backend/test_config.py
import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base

# Use in-memory SQLite for tests
SQLALCHEMY_TEST_URL = "sqlite:///:memory:"

engine_test = create_engine(
    SQLALCHEMY_TEST_URL, 
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine_test
)

def create_test_database():
    """Create test database tables"""
    Base.metadata.create_all(bind=engine_test)

def get_test_db():
    """Get test database session"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### Test Fixtures
```python
# backend/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db, Base

# Test database setup
SQLALCHEMY_TEST_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def test_client(test_db):
    """Create a test client with isolated database"""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_task():
    """Sample task data for tests"""
    return {
        "title": "Test Task",
        "description": "This is a test task"
    }

@pytest.fixture
def sample_tasks():
    """Multiple sample tasks"""
    return [
        {"title": "Task 1", "description": "First task"},
        {"title": "Task 2", "description": "Second task"},
        {"title": "Task 3", "description": "Third task"}
    ]
```

### Unit Tests

#### Model Tests
```python
# backend/test_models.py
import pytest
from datetime import datetime
from main import DBTask, DBSubstack, DBSubstackTask

class TestDBTask:
    def test_task_creation(self, test_db):
        """Test basic task creation"""
        task = DBTask(
            title="Test Task",
            description="Test description",
            status="todo"
        )
        test_db.add(task)
        test_db.commit()
        
        assert task.id is not None
        assert task.title == "Test Task"
        assert task.status == "todo"
        assert task.completed is False
        assert task.created_at is not None
    
    def test_task_completion(self, test_db):
        """Test task completion logic"""
        task = DBTask(title="Test Task", status="todo", sort_order=1)
        test_db.add(task)
        test_db.commit()
        
        # Complete task
        task.status = "done"
        task.completed = True
        task.completed_at = datetime.now()
        task.sort_order = None
        test_db.commit()
        
        assert task.completed is True
        assert task.completed_at is not None
        assert task.sort_order is None
    
    def test_task_deferral(self, test_db):
        """Test task deferral logic"""
        task = DBTask(title="Test Task", status="todo", sort_order=1)
        test_db.add(task)
        test_db.commit()
        
        # Defer task
        task.deferred_at = datetime.now()
        task.deferral_count = 1
        task.sort_order = 999  # Move to end
        test_db.commit()
        
        assert task.deferred_at is not None
        assert task.deferral_count == 1
        assert task.sort_order == 999

class TestDBSubstack:
    def test_substack_creation(self, test_db):
        """Test substack creation with parent task"""
        # Create parent task
        parent_task = DBTask(title="Parent Task")
        test_db.add(parent_task)
        test_db.commit()
        
        # Create substack
        substack = DBSubstack(
            name="Test Substack",
            parent_task_id=parent_task.id
        )
        test_db.add(substack)
        test_db.commit()
        
        assert substack.id is not None
        assert substack.name == "Test Substack"
        assert substack.parent_task_id == parent_task.id
    
    def test_substack_tasks_relationship(self, test_db):
        """Test substack-task relationship"""
        # Create parent task and substack
        parent_task = DBTask(title="Parent Task")
        test_db.add(parent_task)
        test_db.commit()
        
        substack = DBSubstack(name="Test Substack", parent_task_id=parent_task.id)
        test_db.add(substack)
        test_db.commit()
        
        # Add tasks to substack
        task1 = DBSubstackTask(title="Subtask 1", substack_id=substack.id)
        task2 = DBSubstackTask(title="Subtask 2", substack_id=substack.id)
        test_db.add_all([task1, task2])
        test_db.commit()
        
        # Test relationship
        test_db.refresh(substack)
        assert len(substack.tasks) == 2
        assert substack.tasks[0].title == "Subtask 1"
        assert substack.tasks[1].title == "Subtask 2"
```

#### Business Logic Tests
```python
# backend/test_business_logic.py
import pytest
from uuid import uuid4
from datetime import datetime

class TestTaskOrdering:
    def test_new_task_gets_next_sort_order(self, test_client):
        """Test that new tasks get assigned proper sort order"""
        # Create first task
        response1 = test_client.post("/tasks", json={"title": "Task 1"})
        task1 = response1.json()
        
        # Create second task
        response2 = test_client.post("/tasks", json={"title": "Task 2"})
        task2 = response2.json()
        
        assert task1["sort_order"] == 1
        assert task2["sort_order"] == 2
    
    def test_completed_task_removes_sort_order(self, test_client):
        """Test that completing a task removes sort order"""
        # Create task
        response = test_client.post("/tasks", json={"title": "Test Task"})
        task_id = response.json()["id"]
        
        # Complete task
        response = test_client.put(f"/tasks/{task_id}", json={"status": "done"})
        completed_task = response.json()
        
        assert completed_task["completed"] is True
        assert completed_task["sort_order"] is None
        assert completed_task["completed_at"] is not None
    
    def test_task_deferral_moves_to_end(self, test_client):
        """Test that deferring a task moves it to end of queue"""
        # Create multiple tasks
        task_ids = []
        for i in range(3):
            response = test_client.post("/tasks", json={"title": f"Task {i+1}"})
            task_ids.append(response.json()["id"])
        
        # Defer first task
        response = test_client.put(f"/tasks/{task_ids[0]}", json={"is_deferral": True})
        deferred_task = response.json()
        
        # Get all tasks to check ordering
        response = test_client.get("/tasks")
        tasks = response.json()
        todo_tasks = [t for t in tasks if t["status"] == "todo"]
        
        # Deferred task should be at the end
        assert todo_tasks[-1]["id"] == task_ids[0]
        assert deferred_task["deferral_count"] == 1
        assert deferred_task["deferred_at"] is not None

class TestSubstackLogic:
    def test_substack_task_ordering(self, test_client):
        """Test that substack tasks are properly ordered"""
        # Create parent task
        response = test_client.post("/tasks", json={"title": "Parent Task"})
        parent_id = response.json()["id"]
        
        # Create substack
        response = test_client.post(f"/tasks/{parent_id}/substacks", json={"name": "Test Substack"})
        substack_id = response.json()["id"]
        
        # Add multiple tasks to substack
        task_titles = ["Subtask 1", "Subtask 2", "Subtask 3"]
        for title in task_titles:
            test_client.post(f"/substacks/{substack_id}/tasks", json={"title": title})
        
        # Get tasks and verify ordering
        response = test_client.get("/tasks")
        tasks = response.json()
        parent_task = next(t for t in tasks if t["id"] == parent_id)
        substack_tasks = parent_task["substacks"][0]["tasks"]
        
        assert len(substack_tasks) == 3
        for i, task in enumerate(substack_tasks):
            assert task["title"] == task_titles[i]
            assert task["sort_order"] == i + 1
```

### Integration Tests

#### API Endpoint Tests
```python
# backend/test_api_integration.py
import pytest
from uuid import uuid4

class TestTaskAPI:
    def test_create_task_success(self, test_client):
        """Test successful task creation"""
        task_data = {
            "title": "New Task",
            "description": "Task description"
        }
        
        response = test_client.post("/tasks", json=task_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["description"] == task_data["description"]
        assert data["status"] == "todo"
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data
    
    def test_create_task_validation_error(self, test_client):
        """Test task creation with invalid data"""
        # Missing title
        response = test_client.post("/tasks", json={"description": "No title"})
        assert response.status_code == 422
        
        # Title too long
        long_title = "x" * 201
        response = test_client.post("/tasks", json={"title": long_title})
        assert response.status_code == 422
    
    def test_get_all_tasks(self, test_client, sample_tasks):
        """Test getting all tasks with proper ordering"""
        # Create tasks
        created_tasks = []
        for task_data in sample_tasks:
            response = test_client.post("/tasks", json=task_data)
            created_tasks.append(response.json())
        
        # Complete one task
        test_client.put(f"/tasks/{created_tasks[1]['id']}", json={"status": "done"})
        
        # Get all tasks
        response = test_client.get("/tasks")
        assert response.status_code == 200
        
        tasks = response.json()
        assert len(tasks) == 3
        
        # Check ordering: todo tasks first, then completed
        todo_tasks = [t for t in tasks if t["status"] == "todo"]
        done_tasks = [t for t in tasks if t["status"] == "done"]
        
        assert len(todo_tasks) == 2
        assert len(done_tasks) == 1
        assert todo_tasks[0]["sort_order"] < todo_tasks[1]["sort_order"]
    
    def test_update_task_success(self, test_client, sample_task):
        """Test successful task update"""
        # Create task
        response = test_client.post("/tasks", json=sample_task)
        task_id = response.json()["id"]
        
        # Update task
        update_data = {
            "title": "Updated Title",
            "description": "Updated description"
        }
        response = test_client.put(f"/tasks/{task_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["description"] == update_data["description"]
    
    def test_task_not_found(self, test_client):
        """Test updating non-existent task"""
        fake_id = str(uuid4())
        response = test_client.put(f"/tasks/{fake_id}", json={"title": "Updated"})
        assert response.status_code == 404

class TestSubstackAPI:
    def test_create_substack(self, test_client):
        """Test substack creation"""
        # Create parent task
        response = test_client.post("/tasks", json={"title": "Parent Task"})
        parent_id = response.json()["id"]
        
        # Create substack
        substack_data = {"name": "Development Tasks"}
        response = test_client.post(f"/tasks/{parent_id}/substacks", json=substack_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == substack_data["name"]
        assert data["parent_task_id"] == parent_id
        assert data["tasks"] == []
    
    def test_add_task_to_substack(self, test_client):
        """Test adding tasks to substack"""
        # Create parent task and substack
        response = test_client.post("/tasks", json={"title": "Parent Task"})
        parent_id = response.json()["id"]
        
        response = test_client.post(f"/tasks/{parent_id}/substacks", json={"name": "Dev Tasks"})
        substack_id = response.json()["id"]
        
        # Add task to substack
        task_data = {"title": "Implement feature", "description": "Feature description"}
        response = test_client.post(f"/substacks/{substack_id}/tasks", json=task_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["description"] == task_data["description"]
        assert data["completed"] is False
        assert data["sort_order"] == 1
    
    def test_complete_substack_task(self, test_client):
        """Test completing a substack task"""
        # Setup: Create parent task, substack, and substack task
        response = test_client.post("/tasks", json={"title": "Parent Task"})
        parent_id = response.json()["id"]
        
        response = test_client.post(f"/tasks/{parent_id}/substacks", json={"name": "Dev Tasks"})
        substack_id = response.json()["id"]
        
        response = test_client.post(f"/substacks/{substack_id}/tasks", json={"title": "Subtask"})
        subtask_id = response.json()["id"]
        
        # Complete the substack task
        response = test_client.put(f"/substack-tasks/{subtask_id}", json={"completed": True})
        
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True
        assert data["completed_at"] is not None
```

#### End-to-End Workflow Tests
```python
# backend/test_workflows.py
import pytest

class TestCompleteWorkflows:
    def test_full_task_lifecycle(self, test_client):
        """Test complete task lifecycle from creation to completion"""
        # 1. Create task
        task_data = {"title": "Complete Project", "description": "Finish the project"}
        response = test_client.post("/tasks", json=task_data)
        task_id = response.json()["id"]
        
        # 2. Create substack
        response = test_client.post(f"/tasks/{task_id}/substacks", json={"name": "Development"})
        substack_id = response.json()["id"]
        
        # 3. Add tasks to substack
        subtask_titles = ["Design UI", "Implement Backend", "Write Tests"]
        subtask_ids = []
        for title in subtask_titles:
            response = test_client.post(f"/substacks/{substack_id}/tasks", json={"title": title})
            subtask_ids.append(response.json()["id"])
        
        # 4. Complete subtasks one by one
        for subtask_id in subtask_ids:
            response = test_client.put(f"/substack-tasks/{subtask_id}", json={"completed": True})
            assert response.status_code == 200
        
        # 5. Verify all subtasks are completed
        response = test_client.get("/tasks")
        tasks = response.json()
        main_task = next(t for t in tasks if t["id"] == task_id)
        substack_tasks = main_task["substacks"][0]["tasks"]
        
        assert all(task["completed"] for task in substack_tasks)
        
        # 6. Complete main task
        response = test_client.put(f"/tasks/{task_id}", json={"status": "done"})
        assert response.status_code == 200
        
        completed_task = response.json()
        assert completed_task["completed"] is True
        assert completed_task["status"] == "done"
    
    def test_task_deferral_workflow(self, test_client):
        """Test task deferral workflow with multiple tasks"""
        # Create multiple tasks
        tasks = []
        for i in range(5):
            response = test_client.post("/tasks", json={"title": f"Task {i+1}"})
            tasks.append(response.json())
        
        # Defer the second task
        deferred_task_id = tasks[1]["id"]
        response = test_client.put(f"/tasks/{deferred_task_id}", json={"is_deferral": True})
        assert response.status_code == 200
        
        # Get updated task list
        response = test_client.get("/tasks")
        updated_tasks = response.json()
        todo_tasks = [t for t in updated_tasks if t["status"] == "todo"]
        
        # Verify ordering: deferred task should be at the end
        assert todo_tasks[-1]["id"] == deferred_task_id
        assert todo_tasks[-1]["deferral_count"] == 1
        assert todo_tasks[-1]["deferred_at"] is not None
        
        # Verify other tasks moved up
        for i, task in enumerate(todo_tasks[:-1]):
            expected_order = i + 1
            assert task["sort_order"] == expected_order
    
    def test_mixed_operations_workflow(self, test_client):
        """Test mixed operations: create, defer, complete, create more"""
        # Phase 1: Create initial tasks
        initial_tasks = []
        for i in range(3):
            response = test_client.post("/tasks", json={"title": f"Initial Task {i+1}"})
            initial_tasks.append(response.json())
        
        # Phase 2: Defer first task
        test_client.put(f"/tasks/{initial_tasks[0]['id']}", json={"is_deferral": True})
        
        # Phase 3: Complete second task
        test_client.put(f"/tasks/{initial_tasks[1]['id']}", json={"status": "done"})
        
        # Phase 4: Create new task
        response = test_client.post("/tasks", json={"title": "New Task"})
        new_task = response.json()
        
        # Phase 5: Verify final state
        response = test_client.get("/tasks")
        all_tasks = response.json()
        
        todo_tasks = [t for t in all_tasks if t["status"] == "todo"]
        done_tasks = [t for t in all_tasks if t["status"] == "done"]
        
        # Should have 3 todo tasks (initial[2], deferred initial[0], new task)
        # and 1 done task (initial[1])
        assert len(todo_tasks) == 3
        assert len(done_tasks) == 1
        
        # Verify ordering
        assert todo_tasks[0]["id"] == initial_tasks[2]["id"]  # Third task (order 1)
        assert todo_tasks[1]["id"] == new_task["id"]          # New task (order 2)  
        assert todo_tasks[2]["id"] == initial_tasks[0]["id"]  # Deferred task (order 3)
```

---

## ⚛️ Frontend Testing

### Component Tests

#### Setup React Testing Library
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### Test Configuration
```javascript
// src/setupTests.js
import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock fetch
global.fetch = jest.fn()
```

#### Component Test Examples
```typescript
// src/__tests__/TaskCard.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '@/components/TaskCard'
import { Task } from '@/types/task'

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  status: 'todo',
  createdAt: new Date('2023-01-01'),
  completedAt: null,
  deferredAt: null,
  deferralCount: 0,
  sortOrder: 1,
  substacks: []
}

describe('TaskCard', () => {
  const mockOnSwipeRight = jest.fn()
  const mockOnSwipeLeft = jest.fn()
  const mockOnEdit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders task information correctly', () => {
    render(
      <TaskCard 
        task={mockTask}
        onSwipeRight={mockOnSwipeRight}
        onSwipeLeft={mockOnSwipeLeft}
        onEdit={mockOnEdit}
      />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('calls onSwipeRight when swiped right', async () => {
    render(
      <TaskCard 
        task={mockTask}
        onSwipeRight={mockOnSwipeRight}
        onSwipeLeft={mockOnSwipeLeft}
        onEdit={mockOnEdit}
      />
    )

    const card = screen.getByTestId('task-card')
    
    // Simulate swipe right gesture
    fireEvent.touchStart(card, { touches: [{ clientX: 0, clientY: 0 }] })
    fireEvent.touchMove(card, { touches: [{ clientX: 100, clientY: 0 }] })
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 100, clientY: 0 }] })

    await waitFor(() => {
      expect(mockOnSwipeRight).toHaveBeenCalledWith('1')
    })
  })

  it('calls onSwipeLeft when swiped left', async () => {
    render(
      <TaskCard 
        task={mockTask}
        onSwipeRight={mockOnSwipeRight}
        onSwipeLeft={mockOnSwipeLeft}
        onEdit={mockOnEdit}
      />
    )

    const card = screen.getByTestId('task-card')
    
    // Simulate swipe left gesture
    fireEvent.touchStart(card, { touches: [{ clientX: 100, clientY: 0 }] })
    fireEvent.touchMove(card, { touches: [{ clientX: 0, clientY: 0 }] })
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 0, clientY: 0 }] })

    await waitFor(() => {
      expect(mockOnSwipeLeft).toHaveBeenCalledWith('1')
    })
  })

  it('shows completed state correctly', () => {
    const completedTask = { ...mockTask, completed: true, status: 'done' as const }
    
    render(
      <TaskCard 
        task={completedTask}
        onSwipeRight={mockOnSwipeRight}
        onSwipeLeft={mockOnSwipeLeft}
        onEdit={mockOnEdit}
      />
    )

    expect(screen.getByTestId('task-card')).toHaveClass('completed')
  })

  it('displays deferral count when task has been deferred', () => {
    const deferredTask = { 
      ...mockTask, 
      deferralCount: 2,
      deferredAt: new Date('2023-01-02')
    }
    
    render(
      <TaskCard 
        task={deferredTask}
        onSwipeRight={mockOnSwipeRight}
        onSwipeLeft={mockOnSwipeLeft}
        onEdit={mockOnEdit}
      />
    )

    expect(screen.getByText('Deferred 2 times')).toBeInTheDocument()
  })
})
```

#### Hook Tests
```typescript
// src/__tests__/useTaskManagement.test.ts
import { renderHook, act } from '@testing-library/react'
import { useTaskManagement } from '@/hooks/useTaskManagement'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useTaskManagement', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('initializes with empty tasks array', () => {
    const { result } = renderHook(() => useTaskManagement())
    
    expect(result.current.tasks).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('fetches tasks on mount', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '2', title: 'Task 2', status: 'done' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks
    })

    const { result } = renderHook(() => useTaskManagement())

    await act(async () => {
      await result.current.refreshTasks()
    })

    expect(result.current.tasks).toHaveLength(2)
    expect(result.current.tasks[0].title).toBe('Task 1')
  })

  it('adds new task correctly', async () => {
    const newTask = { title: 'New Task', description: 'Description' }
    const createdTask = { id: '3', ...newTask, status: 'todo', completed: false }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => createdTask
    })

    const { result } = renderHook(() => useTaskManagement())

    await act(async () => {
      await result.current.addTask(newTask)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useTaskManagement())

    await act(async () => {
      await result.current.refreshTasks()
    })

    expect(result.current.error).toBe('Failed to fetch tasks')
  })
})
```

### Integration Tests

#### Full Component Integration
```typescript
// src/__tests__/TaskStack.integration.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskStack } from '@/components/TaskStack'
import { Task } from '@/types/task'

// Mock API
const mockFetch = jest.fn()
global.fetch = mockFetch

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'First Task',
    description: 'First description',
    completed: false,
    status: 'todo',
    createdAt: new Date(),
    sortOrder: 1,
    substacks: []
  },
  {
    id: '2',
    title: 'Second Task',
    description: 'Second description',
    completed: false,
    status: 'todo',
    createdAt: new Date(),
    sortOrder: 2,
    substacks: []
  }
]

describe('TaskStack Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('completes a task when swiped right', async () => {
    // Mock successful task completion
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockTasks[0], completed: true, status: 'done' })
    })

    render(<TaskStack initialTasks={mockTasks} />)

    const firstCard = screen.getByText('First Task').closest('[data-testid="task-card"]')
    
    // Simulate swipe right
    fireEvent.touchStart(firstCard, { touches: [{ clientX: 0, clientY: 0 }] })
    fireEvent.touchMove(firstCard, { touches: [{ clientX: 150, clientY: 0 }] })
    fireEvent.touchEnd(firstCard, { changedTouches: [{ clientX: 150, clientY: 0 }] })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tasks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' })
      })
    })

    // Should show next task
    await waitFor(() => {
      expect(screen.getByText('Second Task')).toBeInTheDocument()
    })
  })

  it('defers a task when swiped left', async () => {
    // Mock successful task deferral
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        ...mockTasks[0], 
        deferralCount: 1, 
        deferredAt: new Date().toISOString(),
        sortOrder: 999
      })
    })

    render(<TaskStack initialTasks={mockTasks} />)

    const firstCard = screen.getByText('First Task').closest('[data-testid="task-card"]')
    
    // Simulate swipe left
    fireEvent.touchStart(firstCard, { touches: [{ clientX: 150, clientY: 0 }] })
    fireEvent.touchMove(firstCard, { touches: [{ clientX: 0, clientY: 0 }] })
    fireEvent.touchEnd(firstCard, { changedTouches: [{ clientX: 0, clientY: 0 }] })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tasks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deferral: true })
      })
    })
  })
})
```

---

## 🎭 End-to-End Testing

### Playwright Setup

#### Install Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      port: 8080,
    },
    {
      command: 'cd backend && uvicorn main:app --port 8000',
      port: 8000,
    }
  ],
})
```

### E2E Test Examples

#### Basic Task Operations
```typescript
// e2e/task-operations.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Task Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('creates a new task', async ({ page }) => {
    // Click add task button
    await page.click('[data-testid="add-task-button"]')
    
    // Fill task form
    await page.fill('[data-testid="task-title-input"]', 'New E2E Task')
    await page.fill('[data-testid="task-description-input"]', 'Task created by E2E test')
    
    // Submit form
    await page.click('[data-testid="save-task-button"]')
    
    // Verify task appears in stack
    await expect(page.locator('[data-testid="task-card"]')).toContainText('New E2E Task')
  })

  test('completes a task by swiping right', async ({ page }) => {
    // Create a task first
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title-input"]', 'Task to Complete')
    await page.click('[data-testid="save-task-button"]')
    
    // Swipe right on the task card
    const taskCard = page.locator('[data-testid="task-card"]')
    await taskCard.dragTo(page.locator('body'), { 
      sourcePosition: { x: 50, y: 50 },
      targetPosition: { x: 300, y: 50 }
    })
    
    // Verify task is completed (should show next task or empty state)
    await expect(page.locator('[data-testid="task-card"]')).not.toContainText('Task to Complete')
  })

  test('defers a task by swiping left', async ({ page }) => {
    // Create multiple tasks
    const tasks = ['Task 1', 'Task 2', 'Task 3']
    for (const taskTitle of tasks) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title-input"]', taskTitle)
      await page.click('[data-testid="save-task-button"]')
    }
    
    // Swipe left on first task
    const taskCard = page.locator('[data-testid="task-card"]')
    await expect(taskCard).toContainText('Task 1')
    
    await taskCard.dragTo(page.locator('body'), { 
      sourcePosition: { x: 300, y: 50 },
      targetPosition: { x: 50, y: 50 }
    })
    
    // Should now show Task 2
    await expect(taskCard).toContainText('Task 2')
  })
})
```

#### Substack Operations
```typescript
// e2e/substack-operations.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Substack Operations', () => {
  test('creates and manages substacks', async ({ page }) => {
    await page.goto('/')
    
    // Create main task
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title-input"]', 'Project Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Open task details
    await page.click('[data-testid="task-card"]')
    
    // Create substack
    await page.click('[data-testid="add-substack-button"]')
    await page.fill('[data-testid="substack-name-input"]', 'Development Tasks')
    await page.click('[data-testid="save-substack-button"]')
    
    // Add task to substack
    await page.click('[data-testid="add-substack-task-button"]')
    await page.fill('[data-testid="substack-task-title-input"]', 'Implement feature')
    await page.click('[data-testid="save-substack-task-button"]')
    
    // Verify substack task appears
    await expect(page.locator('[data-testid="substack-task"]')).toContainText('Implement feature')
  })

  test('completes substack tasks', async ({ page }) => {
    await page.goto('/')
    
    // Setup: Create task with substack and subtask
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title-input"]', 'Main Task')
    await page.click('[data-testid="save-task-button"]')
    await page.click('[data-testid="task-card"]')
    await page.click('[data-testid="add-substack-button"]')
    await page.fill('[data-testid="substack-name-input"]', 'Subtasks')
    await page.click('[data-testid="save-substack-button"]')
    await page.click('[data-testid="add-substack-task-button"]')
    await page.fill('[data-testid="substack-task-title-input"]', 'Subtask to complete')
    await page.click('[data-testid="save-substack-task-button"]')
    
    // Complete the substack task
    await page.click('[data-testid="substack-task-checkbox"]')
    
    // Verify task is marked as completed
    await expect(page.locator('[data-testid="substack-task"]')).toHaveClass(/completed/)
  })
})
```

#### Mobile-Specific Tests
```typescript
// e2e/mobile-gestures.spec.ts
import { test, expect, devices } from '@playwright/test'

test.describe('Mobile Gestures', () => {
  test.use({ ...devices['iPhone 12'] })

  test('touch gestures work on mobile', async ({ page }) => {
    await page.goto('/')
    
    // Create a task
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title-input"]', 'Mobile Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Test touch swipe
    const taskCard = page.locator('[data-testid="task-card"]')
    
    // Simulate touch swipe right
    await taskCard.touchstart()
    await page.touchMove({ x: 100, y: 100 }, { x: 300, y: 100 })
    await page.touchEnd()
    
    // Task should be completed
    await expect(taskCard).not.toContainText('Mobile Task')
  })

  test('responsive design works correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check mobile-specific elements are visible
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="task-stack"]')).toBeVisible()
    
    // Check desktop elements are hidden
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible()
  })
})
```

---

## 📊 Performance Testing

### Load Testing with Artillery

#### Install Artillery
```bash
npm install --save-dev artillery
```

#### Load Test Configuration
```yaml
# performance/load-test.yml
config:
  target: 'http://127.0.0.1:8000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  environments:
    production:
      target: 'https://your-domain.com'

scenarios:
  - name: "Task Operations"
    weight: 70
    flow:
      - post:
          url: "/tasks"
          json:
            title: "Load Test Task {{ $randomString() }}"
            description: "Generated by load test"
      - think: 2
      - get:
          url: "/tasks"
      - think: 1
      - put:
          url: "/tasks/{{ id }}"
          json:
            status: "done"
            
  - name: "Substack Operations"
    weight: 30
    flow:
      - post:
          url: "/tasks"
          json:
            title: "Parent Task {{ $randomString() }}"
      - post:
          url: "/tasks/{{ parentId }}/substacks"
          json:
            name: "Test Substack"
      - post:
          url: "/substacks/{{ substackId }}/tasks"
          json:
            title: "Subtask {{ $randomString() }}"
```

#### Run Performance Tests
```bash
# Run load test
npx artillery run performance/load-test.yml

# Generate HTML report
npx artillery run --output report.json performance/load-test.yml
npx artillery report report.json
```

### Frontend Performance Tests

#### Lighthouse Testing
```javascript
// performance/lighthouse.test.js
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = { logLevel: 'info', output: 'html', port: chrome.port }
  
  const runnerResult = await lighthouse('http://localhost:8080', options)
  
  // Performance assertions
  const lhr = runnerResult.lhr
  expect(lhr.categories.performance.score).toBeGreaterThan(0.8)
  expect(lhr.categories.accessibility.score).toBeGreaterThan(0.9)
  expect(lhr.categories['best-practices'].score).toBeGreaterThan(0.8)
  
  await chrome.kill()
}
```

---

## 🤖 Test Automation

### GitHub Actions CI/CD

#### Test Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        python -m pytest -v --cov=main --cov-report=xml
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: backend/coverage.xml

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Start services
      run: |
        cd backend && python -m uvicorn main:app --port 8000 &
        npm run dev &
        sleep 10
    
    - name: Run E2E tests
      run: npx playwright test
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

### Pre-commit Hooks

#### Setup Pre-commit
```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
```

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
        files: backend/.*\.py$

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        files: backend/.*\.py$

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.35.0
    hooks:
      - id: eslint
        files: src/.*\.[jt]sx?$
        additional_dependencies:
          - eslint@8.35.0
          - '@typescript-eslint/parser@5.54.0'
```

```bash
# Install hooks
pre-commit install
```

---

## 📈 Test Coverage & Reporting

### Coverage Reports

#### Backend Coverage
```bash
# Generate coverage report
cd backend
python -m pytest --cov=main --cov-report=html --cov-report=term

# View HTML report
open htmlcov/index.html
```

#### Frontend Coverage
```bash
# Generate coverage report
npm test -- --coverage --watchAll=false

# View HTML report
open coverage/lcov-report/index.html
```

### Quality Gates

#### Minimum Coverage Requirements
```json
// package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

```ini
# backend/.coveragerc
[run]
source = .
omit = 
    */venv/*
    */tests/*
    */conftest.py

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError

fail_under = 80
```

---

This comprehensive testing guide ensures robust quality assurance across all layers of the One Job application, from individual functions to complete user workflows.