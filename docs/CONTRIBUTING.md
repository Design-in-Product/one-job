# Contributing to One Job

Thank you for your interest in contributing to One Job! This guide will help you get started with contributing to the project.

## 🎯 Ways to Contribute

- **🐛 Bug Reports**: Report issues and bugs
- **💡 Feature Requests**: Suggest new features and improvements
- **📝 Code Contributions**: Submit bug fixes and new features
- **📚 Documentation**: Improve documentation and examples
- **🧪 Testing**: Add tests and improve test coverage
- **🎨 Design**: UI/UX improvements and design suggestions

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js 16+** for frontend development
- **Python 3.9+** for backend development  
- **Git** for version control
- **Code editor** (VS Code recommended)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/one-job.git
   cd one-job
   ```

2. **Set Up Development Environment**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Set up Python backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   # Create backend environment file
   cp backend/.env.example backend/.env
   # Edit with your local settings
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   source ../venv/bin/activate
   uvicorn main:app --reload --port 8000
   
   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Verify Setup**
   - Frontend: http://localhost:8080
   - API Docs: http://127.0.0.1:8000/docs
   - Run tests: `npm test` and `cd backend && pytest`

---

## 📋 Contribution Process

### 1. Choose an Issue

- Check [existing issues](https://github.com/one-job/issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to claim it
- For new features, create an issue first to discuss

### 2. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description

# Example branch names:
# feature/task-priorities
# fix/substack-ordering-bug
# docs/api-examples
```

### 3. Make Changes

Follow our [development guidelines](#development-guidelines) and ensure:
- ✅ Code follows style guidelines
- ✅ Tests are added/updated
- ✅ Documentation is updated
- ✅ All tests pass

### 4. Test Your Changes

```bash
# Run all tests
npm test                    # Frontend tests
cd backend && pytest -v    # Backend tests

# Test the application manually
# Verify your changes work as expected
```

### 5. Commit Changes

Follow our [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add task priority system

- Add priority field to Task model
- Implement priority-based sorting
- Add priority selection in task form
- Update API documentation

Closes #123"
```

### 6. Submit Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# Fill out the PR template completely
```

---

## 📝 Development Guidelines

### Code Style

#### Backend (Python)
```python
# Use type hints
async def create_task(task_data: TaskCreate, db: Session) -> TaskResponse:
    """Create a new task with validation."""
    pass

# Follow PEP 8
class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository
    
    async def create_task(self, data: TaskCreate) -> Task:
        # Validate input
        if not data.title.strip():
            raise ValidationError("Title cannot be empty")
        
        # Business logic
        return await self.repository.create(data)

# Use descriptive variable names
max_sort_order = await self.get_max_sort_order()
new_task_order = (max_sort_order or 0) + 1
```

#### Frontend (TypeScript/React)
```typescript
// Use proper TypeScript types
interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onDefer: (taskId: string) => void
}

// Component structure
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDefer
}) => {
  // Hooks at the top
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Event handlers
  const handleSwipeRight = useCallback(() => {
    onComplete(task.id)
  }, [task.id, onComplete])
  
  // Render
  return (
    <motion.div className="task-card">
      {/* JSX content */}
    </motion.div>
  )
}

// Use meaningful names
const activeTasks = tasks.filter(task => task.status === 'todo')
const completedTaskCount = tasks.filter(task => task.completed).length
```

### File Organization

```
one-job/
├── backend/
│   ├── main.py              # API endpoints and app setup
│   ├── models/              # Database models (future)
│   ├── services/            # Business logic (future)
│   ├── repositories/        # Data access (future)
│   └── tests/              # Test files
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── lib/               # Utility functions
│   └── __tests__/         # Component tests
└── docs/                  # Documentation
```

### Testing Requirements

All contributions must include appropriate tests:

#### Backend Tests
```python
# Unit tests for business logic
def test_task_deferral_updates_count():
    task = Task(id=uuid4(), title="Test", deferral_count=0)
    result = task_service.defer_task(task.id)
    assert result.deferral_count == 1

# Integration tests for API endpoints
def test_create_task_endpoint(test_client):
    response = test_client.post("/tasks", json={"title": "New Task"})
    assert response.status_code == 201
    assert response.json()["title"] == "New Task"
```

#### Frontend Tests
```typescript
// Component tests
test('TaskCard displays task information', () => {
  render(<TaskCard task={mockTask} onComplete={jest.fn()} onDefer={jest.fn()} />)
  expect(screen.getByText(mockTask.title)).toBeInTheDocument()
})

// Hook tests  
test('useTaskManagement adds tasks correctly', async () => {
  const { result } = renderHook(() => useTaskManagement())
  await act(async () => {
    await result.current.addTask({ title: 'New Task' })
  })
  expect(result.current.tasks).toHaveLength(1)
})
```

---

## 📐 Architecture Guidelines

### Domain-Driven Design

Follow DDD principles when adding features:

```python
# Domain models (entities)
class Task:
    def __init__(self, title: str, description: str = None):
        self.id = uuid4()
        self.title = title
        self.description = description
        self.status = TaskStatus.TODO
        self.created_at = datetime.now()
    
    def complete(self) -> None:
        """Complete the task following business rules."""
        if self.status != TaskStatus.TODO:
            raise BusinessRuleViolation("Can only complete todo tasks")
        
        self.status = TaskStatus.DONE
        self.completed_at = datetime.now()
        self.sort_order = None

# Service layer (business logic)
class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository
    
    async def defer_task(self, task_id: UUID) -> Task:
        """Defer a task following business rules."""
        task = await self.repository.get_by_id(task_id)
        
        if task.status != TaskStatus.TODO:
            raise BusinessRuleViolation("Can only defer todo tasks")
        
        # Move to end of queue
        max_order = await self.repository.get_max_sort_order()
        task.sort_order = (max_order or 0) + 1
        task.deferral_count += 1
        task.deferred_at = datetime.now()
        
        return await self.repository.update(task)
```

### API Design Principles

When adding new endpoints:

```python
# RESTful resource design
@app.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task."""
    pass

@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    """Get all tasks ordered by status and sort order."""
    pass

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: UUID, task: TaskUpdate, db: Session = Depends(get_db)):
    """Update an existing task."""
    pass

# Nested resources
@app.post("/tasks/{task_id}/substacks", response_model=SubstackResponse, status_code=201)
async def create_substack(task_id: UUID, substack: SubstackCreate, db: Session = Depends(get_db)):
    """Create a substack within a task."""
    pass
```

### Component Design Patterns

Use established React patterns:

```typescript
// Compound components
const TaskStack = ({ tasks, onTaskAction }) => {
  return (
    <TaskStack.Container>
      {tasks.map(task => (
        <TaskStack.Card key={task.id} task={task} onAction={onTaskAction} />
      ))}
    </TaskStack.Container>
  )
}

TaskStack.Container = ({ children }) => (
  <div className="task-stack">{children}</div>
)

TaskStack.Card = ({ task, onAction }) => (
  <TaskCard task={task} onSwipeRight={() => onAction(task.id, 'complete')} />
)

// Custom hooks for reusable logic
const useTaskOperations = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  
  const completeTask = useCallback(async (taskId: string) => {
    // API call and state update logic
  }, [])
  
  const deferTask = useCallback(async (taskId: string) => {
    // API call and state update logic
  }, [])
  
  return { tasks, completeTask, deferTask }
}
```

---

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Reproduce the bug** in latest version
3. **Check if it's a known issue** in documentation

### Bug Report Template

```markdown
**Bug Description**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 108]
- Node.js: [e.g. 18.12.0]
- Python: [e.g. 3.9.15]

**Additional Context**
Any other context about the problem.

**Possible Solution**
If you have ideas on how to fix it.
```

### Example Bug Report

```markdown
**Bug Description**
Task deferral count not incrementing when swiping left multiple times on the same task.

**To Reproduce**
1. Create a new task
2. Swipe left to defer the task
3. When the task reappears, swipe left again
4. Check task details - deferral count shows 1 instead of 2

**Expected Behavior**
Deferral count should increment each time a task is deferred.

**Actual Behavior**
Deferral count stays at 1 regardless of how many times the task is deferred.

**Environment**
- OS: macOS 13.0
- Browser: Chrome 108
- Frontend: http://localhost:8080
- Backend: http://127.0.0.1:8000

**Additional Context**
This might be related to the sort order logic not properly updating the deferral count in the database.

**Possible Solution**
Check the task update endpoint to ensure deferral_count is being incremented in the database, not just in memory.
```

---

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** and roadmap
2. **Consider if it fits** the project vision
3. **Think about implementation** complexity

### Feature Request Template

```markdown
**Feature Summary**
Brief description of the feature.

**Problem Statement**
What problem does this solve? Who benefits?

**Proposed Solution**
Detailed description of how you envision the feature working.

**Alternative Solutions**
Other ways this could be implemented.

**Use Cases**
Specific scenarios where this would be useful.

**Implementation Notes**
Technical considerations or suggestions.

**Priority**
How important is this feature? (High/Medium/Low)
```

### Example Feature Request

```markdown
**Feature Summary**
Add task priority levels (High, Medium, Low) with visual indicators and sorting.

**Problem Statement**
Users need to prioritize tasks but currently have no way to indicate which tasks are more important. This leads to inefficient task management when multiple urgent tasks exist.

**Proposed Solution**
- Add priority field to Task model (High/Medium/Low/None)
- Show priority with color-coded indicators on task cards
- Sort tasks by priority within each status group
- Add priority selection in task creation/edit forms

**Alternative Solutions**
- Use tags instead of dedicated priority field
- Implement drag-and-drop manual ordering
- Add due dates with automatic priority calculation

**Use Cases**
- Project manager needs to identify critical tasks
- Developer wants to focus on high-priority bugs first
- Team lead organizing sprint backlog by importance

**Implementation Notes**
- Backend: Add priority enum and update sorting logic
- Frontend: Add priority picker component and visual indicators
- Database: Migration to add priority column with default NULL

**Priority**
Medium - Would improve workflow but not blocking current usage.
```

---

## ✅ Pull Request Guidelines

### PR Title Format

Use conventional commit format:
- `feat: add task priority system`
- `fix: resolve substack ordering bug`
- `docs: update API documentation`
- `test: add integration tests for substacks`
- `refactor: extract task service layer`

### PR Description Template

```markdown
## Summary
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test coverage improvement

## Changes Made
- List of specific changes
- Use bullet points
- Be specific about what was modified

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Screenshots (if applicable)
Add screenshots of UI changes.

## Breaking Changes
List any breaking changes and migration steps.

## Related Issues
Closes #123
Related to #456

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where needed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No conflicts with target branch
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing by reviewer
4. **Approval**: Maintainer approval before merge

### Review Criteria

Reviewers will check:
- ✅ **Functionality**: Changes work as intended
- ✅ **Code Quality**: Clean, readable, well-structured code
- ✅ **Testing**: Adequate test coverage
- ✅ **Documentation**: Updated where necessary
- ✅ **Performance**: No significant performance regression
- ✅ **Security**: No security vulnerabilities introduced
- ✅ **Compatibility**: Works across supported platforms

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
feat(tasks): add priority system with visual indicators

- Add priority enum (High, Medium, Low, None)
- Update Task model with priority field
- Implement priority-based sorting in task list
- Add priority selector in task form
- Display priority with color-coded badges

Closes #123

# Bug fix
fix(substacks): resolve ordering issue when adding new tasks

Task sort order was not being calculated correctly when adding
tasks to substacks, causing new tasks to appear in wrong position.

- Fix sort order calculation in SubstackService
- Add test coverage for task ordering
- Update integration test to verify correct behavior

Fixes #456

# Documentation
docs(api): add examples for substack endpoints

- Add request/response examples for all substack operations
- Include error response examples
- Update API documentation table of contents

# Refactoring
refactor(backend): extract business logic into service layer

- Create TaskService for task operations
- Create SubstackService for substack operations
- Update endpoints to use service layer
- Add dependency injection for services
- Maintain backward compatibility

No functional changes - internal refactoring only.
```

---

## 🏷️ Issue Labels

We use labels to categorize and prioritize issues:

### Type Labels
- `bug` - Something isn't working
- `feature` - New feature or enhancement
- `documentation` - Documentation improvements
- `question` - Questions about usage or implementation

### Priority Labels
- `priority: high` - Critical issues needing immediate attention
- `priority: medium` - Important issues for next release
- `priority: low` - Nice-to-have improvements

### Difficulty Labels
- `good first issue` - Easy issues for newcomers
- `help wanted` - Issues where community help is appreciated
- `complex` - Issues requiring significant effort or expertise

### Component Labels
- `backend` - Backend/API related issues
- `frontend` - Frontend/UI related issues
- `database` - Database schema or query issues
- `testing` - Testing infrastructure or coverage
- `deployment` - Deployment or infrastructure issues

---

## 🎖️ Recognition

### Contributors

All contributors are recognized in:
- GitHub contributors list
- Project README acknowledgments
- Release notes for significant contributions

### Contribution Types

We value all types of contributions:
- 🐛 **Bug Reporters** - Help identify and fix issues
- 💻 **Code Contributors** - Implement features and fixes
- 📝 **Documentation Writers** - Improve project documentation
- 🧪 **Testers** - Add test coverage and find edge cases
- 🎨 **Designers** - Improve UI/UX and user experience
- 💡 **Idea Contributors** - Suggest features and improvements
- 🌍 **Community Builders** - Help others and answer questions

---

## 📞 Getting Help

### Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Email**: [maintainer@example.com] for private matters

### Resources

- [Architecture Guide](ARCHITECTURE.md) - System design and patterns
- [API Documentation](API.md) - Complete API reference
- [Developer Guide](DEVELOPMENT.md) - Extension and development patterns
- [Testing Guide](TESTING.md) - Testing strategies and examples

---

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Project maintainers are responsible for clarifying standards and will take appropriate action in response to unacceptable behavior. Contact [maintainer@example.com] to report violations.

---

## 🎉 Thank You!

Thank you for considering contributing to One Job! Your contributions help make this project better for everyone. Whether you're fixing bugs, adding features, improving documentation, or helping other users, every contribution is valuable and appreciated.

Happy coding! 🚀