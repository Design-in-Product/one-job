# One Job - Development Setup

A mobile-first task management application with swipe-to-interact interface and hierarchical task organization.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Python FastAPI + SQLAlchemy
- **Database**: SQLite (development) / PostgreSQL (production)
- **Testing**: pytest (backend), built-in test structure

## Quick Start

### 1. Backend Setup

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
cd backend
uvicorn main:app --reload --port 8000
```

The backend will create `onejob.db` SQLite file automatically.

### 2. Frontend Setup

```bash
# Install dependencies (if not done)
npm install

# Start frontend development server
npm run dev
```

Frontend runs on http://localhost:8080/

## Core Features Working

✅ **Task Management**
- Create, read, update, delete tasks
- Task completion (swipe right)
- Task deferral (swipe left - moves to bottom)

✅ **Substack System** 
- Create substacks within tasks
- Hierarchical task organization
- Backend persistence implemented

✅ **API Integration**
- Full REST API for tasks and substacks
- Real-time UI updates via API calls

## Testing

### Backend Tests
```bash
cd backend
source ../venv/bin/activate
python -m pytest test_main.py -v
```

### Manual Testing
- Backend API: http://127.0.0.1:8000/docs (Swagger UI)
- Frontend: http://localhost:8080/

## API Endpoints

### Tasks
- `GET /tasks` - List all tasks with substacks
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task (status, title, description, deferral)

### Substacks
- `POST /tasks/{id}/substacks` - Create substack
- `POST /substacks/{id}/tasks` - Add task to substack
- `PUT /substack-tasks/{id}` - Update substack task

## Project Status

**Ready for Integration Phase**: The core MVP functionality is complete and working. Next milestone is external system integration (Linear, Jira, etc.).

## Domain-Driven Design Notes

The codebase follows DDD principles with:
- Clear task/substack domain boundaries
- API-first design for external integrations
- Test-driven development structure in place
- Domain entities properly separated from infrastructure

## Current Database Schema

- `tasks` - Main tasks with status, sort_order, timestamps
- `substacks` - Task subdivisions linked to parent tasks
- `substack_tasks` - Individual tasks within substacks

Database automatically creates/migrates on backend startup.