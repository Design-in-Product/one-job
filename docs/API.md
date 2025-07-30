# API Specification

Complete REST API reference for One Job application.

## 🌐 Base URL

- **Development**: `http://127.0.0.1:8000`
- **Production**: `https://your-domain.com/api`

## 📋 Interactive Documentation

- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

## 🔧 Authentication

Currently, the API does not require authentication. Future versions will implement JWT-based authentication.

## 📊 Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Optional description",
  "completed": false,
  "status": "todo",
  "created_at": "2023-12-01T10:00:00Z",
  "completed_at": null,
  "deferred_at": null,
  "deferral_count": 0,
  "sort_order": 1,
  "external_id": null,
  "source": null,
  "substacks": []
}
```

### Error Response
```json
{
  "error": "error_type",
  "detail": "Human-readable error message",
  "field_errors": {
    "field_name": ["Field-specific error messages"]
  }
}
```

## 🎯 Task Management API

### Create Task

Create a new task in the system.

**`POST /tasks`**

#### Request Body
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs and user guides"
}
```

#### Response `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs and user guides",
  "completed": false,
  "status": "todo",
  "created_at": "2023-12-01T10:00:00Z",
  "completed_at": null,
  "deferred_at": null,
  "deferral_count": 0,
  "sort_order": 1,
  "external_id": null,
  "source": null,
  "substacks": []
}
```

#### Validation Rules
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters

---

### Get All Tasks

Retrieve all tasks ordered by status and sort order.

**`GET /tasks`**

#### Response `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Active task 1",
    "completed": false,
    "status": "todo",
    "sort_order": 1,
    "substacks": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Frontend Work",
        "parent_task_id": "550e8400-e29b-41d4-a716-446655440000",
        "created_at": "2023-12-01T10:05:00Z",
        "tasks": [
          {
            "id": "770e8400-e29b-41d4-a716-446655440002",
            "title": "Update components",
            "completed": false,
            "sort_order": 1
          }
        ]
      }
    ]
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Completed task",
    "completed": true,
    "status": "done",
    "sort_order": null,
    "completed_at": "2023-12-01T09:30:00Z"
  }
]
```

#### Sorting Logic
- **Todo tasks**: Ordered by `sort_order` ascending
- **Done tasks**: Ordered by `completed_at` descending
- **Todo tasks appear first**, followed by done tasks

---

### Update Task

Update an existing task's properties or status.

**`PUT /tasks/{task_id}`**

#### Path Parameters
- `task_id`: UUID of the task to update

#### Request Body Options

##### Update Title/Description
```json
{
  "title": "Updated task title",
  "description": "Updated description"
}
```

##### Complete Task
```json
{
  "status": "done"
}
```

##### Defer Task
```json
{
  "is_deferral": true
}
```

#### Response `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "status": "done",
  "completed": true,
  "completed_at": "2023-12-01T10:15:00Z",
  "sort_order": null
}
```

#### Business Rules

##### Task Completion (`status: "done"`)
- Sets `completed: true`
- Sets `completed_at` to current timestamp
- Removes `sort_order` (set to `null`)
- Clears `deferred_at`
- Shifts other todo tasks up in sort order

##### Task Deferral (`is_deferral: true`)
- Only works on tasks with `status: "todo"`
- Sets `deferred_at` to current timestamp
- Increments `deferral_count`
- Moves task to end of sort order (highest number)
- Shifts other tasks up to fill the gap

#### Error Responses

##### `404 Not Found`
```json
{
  "error": "not_found",
  "detail": "Task not found"
}
```

##### `400 Bad Request`
```json
{
  "error": "validation_error", 
  "detail": "Cannot defer a non-todo task"
}
```

---

## 📚 Substack Management API

Substacks allow hierarchical organization of tasks within parent tasks.

### Create Substack

Create a new substack within a parent task.

**`POST /tasks/{task_id}/substacks`**

#### Path Parameters
- `task_id`: UUID of the parent task

#### Request Body
```json
{
  "name": "Frontend Development"
}
```

#### Response `201 Created`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Frontend Development", 
  "parent_task_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2023-12-01T10:05:00Z",
  "tasks": []
}
```

#### Validation Rules
- `name`: Required, 1-100 characters
- Parent task must exist

---

### Add Task to Substack

Add a new task within a specific substack.

**`POST /substacks/{substack_id}/tasks`**

#### Path Parameters
- `substack_id`: UUID of the substack

#### Request Body
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based auth to the application"
}
```

#### Response `201 Created`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "title": "Implement user authentication",
  "description": "Add JWT-based auth to the application",
  "completed": false,
  "created_at": "2023-12-01T10:10:00Z",
  "completed_at": null,
  "sort_order": 1
}
```

#### Automatic Sort Ordering
- New substack tasks are automatically assigned the next available `sort_order`
- Tasks within substacks are ordered independently from main tasks

---

### Update Substack Task

Update a task within a substack.

**`PUT /substack-tasks/{task_id}`**

#### Path Parameters
- `task_id`: UUID of the substack task

#### Request Body
```json
{
  "completed": true
}
```

#### Response `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "title": "Implement user authentication",
  "completed": true,
  "completed_at": "2023-12-01T11:00:00Z",
  "sort_order": 1
}
```

#### Supported Updates
- `completed`: Boolean to mark task as done/undone
- Future: `title`, `description` updates

---

## 🔍 Data Models

### Task Model

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Unique identifier | Primary key, auto-generated |
| `title` | String | Task title | Required, 1-200 chars |
| `description` | String | Optional details | Max 1000 chars |
| `completed` | Boolean | Completion status | Derived from status |
| `status` | String | Current state | `"todo"` or `"done"` |
| `created_at` | DateTime | Creation timestamp | Auto-generated |
| `completed_at` | DateTime | Completion timestamp | Set when status = "done" |
| `deferred_at` | DateTime | Last deferral timestamp | Set on deferral |
| `deferral_count` | Integer | Number of deferrals | Incremented on defer |
| `sort_order` | Integer | Position in todo list | 1-based, null for done |
| `external_id` | String | External system ID | For integrations |
| `source` | String | Source system name | e.g., "linear", "jira" |
| `substacks` | Array | Child substacks | Nested relationship |

### Substack Model

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Unique identifier | Primary key |
| `name` | String | Substack name | Required, 1-100 chars |
| `parent_task_id` | UUID | Parent task reference | Foreign key to tasks |
| `created_at` | DateTime | Creation timestamp | Auto-generated |
| `tasks` | Array | Substack tasks | Child tasks |

### SubstackTask Model

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Unique identifier | Primary key |
| `title` | String | Task title | Required, 1-200 chars |
| `description` | String | Optional details | Max 1000 chars |
| `completed` | Boolean | Completion status | Default false |
| `substack_id` | UUID | Parent substack | Foreign key |
| `created_at` | DateTime | Creation timestamp | Auto-generated |
| `completed_at` | DateTime | Completion timestamp | Set when completed |
| `sort_order` | Integer | Position in substack | Auto-assigned |

---

## 🎯 Usage Examples

### Complete Task Workflow

```bash
# 1. Create a task
curl -X POST http://127.0.0.1:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Build API docs", "description": "Complete REST API documentation"}'

# Response: {"id": "task-uuid", "title": "Build API docs", ...}

# 2. Create a substack
curl -X POST http://127.0.0.1:8000/tasks/task-uuid/substacks \
  -H "Content-Type: application/json" \
  -d '{"name": "Documentation Tasks"}'

# Response: {"id": "substack-uuid", "name": "Documentation Tasks", ...}

# 3. Add task to substack
curl -X POST http://127.0.0.1:8000/substacks/substack-uuid/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write API examples", "description": "Add usage examples"}'

# 4. Complete the substack task
curl -X PUT http://127.0.0.1:8000/substack-tasks/subtask-uuid \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 5. Defer the main task
curl -X PUT http://127.0.0.1:8000/tasks/task-uuid \
  -H "Content-Type: application/json" \
  -d '{"is_deferral": true}'

# 6. Complete the main task
curl -X PUT http://127.0.0.1:8000/tasks/task-uuid \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### Frontend Integration Example

```typescript
// React hook for task management
const useTaskAPI = () => {
  const API_BASE = 'http://127.0.0.1:8000'
  
  const createTask = async (taskData: TaskCreate) => {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    return response.json()
  }
  
  const getAllTasks = async () => {
    const response = await fetch(`${API_BASE}/tasks`)
    return response.json()
  }
  
  const completeTask = async (taskId: string) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' })
    })
    return response.json()
  }
  
  return { createTask, getAllTasks, completeTask }
}
```

---

## ⚠️ Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| `400` | `validation_error` | Request validation failed |
| `404` | `not_found` | Resource not found |
| `422` | `unprocessable_entity` | Invalid data format |
| `500` | `internal_server_error` | Server error |

### Common Error Scenarios

#### Invalid Task ID
```json
{
  "error": "not_found",
  "detail": "Task not found"
}
```

#### Validation Errors
```json
{
  "error": "validation_error",
  "detail": "Field validation failed",
  "field_errors": {
    "title": ["Field required"],
    "description": ["String too long"]
  }
}
```

#### Business Logic Errors
```json
{
  "error": "business_logic_error",
  "detail": "Cannot defer a non-todo task"
}
```

---

## 🚀 Rate Limiting

Currently no rate limiting is implemented. Future versions will include:

- **Standard requests**: 100 requests/minute per IP
- **Bulk operations**: 10 requests/minute per IP
- **Headers included**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## 🔄 Pagination

Currently all endpoints return complete datasets. Future versions will support pagination:

```
GET /tasks?page=1&limit=20&sort=created_at&order=desc
```

---

## 📈 API Versioning

Current API is version 1 (v1) with no explicit versioning in URLs. Future versions will use URL-based versioning:

- `v1`: `/tasks` (current)
- `v2`: `/v2/tasks` (future)

---

## 🔮 Future Endpoints

Planned API extensions:

### User Management
```
POST /auth/login
POST /auth/register
GET /auth/me
```

### Advanced Task Operations
```
GET /tasks/search?q=query
POST /tasks/bulk
PUT /tasks/bulk
```

### Integration APIs
```
POST /integrations/linear/import
POST /integrations/jira/sync
GET /integrations/status
```

### Analytics
```
GET /stats/tasks
GET /stats/productivity
```

This API specification provides a complete reference for integrating with the One Job application. For interactive testing, use the Swagger UI at `/docs` when running the development server.