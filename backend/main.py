# backend/main.py
#
# Change Log:
# ... (previous changes) ...
# 2025-06-11: Refactored Task model for 2 states (todo/done) and deferral as action + metadata.
#             - Removed 'deferred' as a status.
#             - Added 'deferral_count' to DBTask.
#             - Updated TaskUpdate Pydantic model with 'is_deferral' flag.
# 2025-06-11: FIX: Restored 'completed' column in DBTask model and TaskResponse.
#             - This resolves the 'UndefinedColumn' error from PostgreSQL.


from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

# SQLAlchemy Imports
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Integer, text, desc, asc, inspect, func
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
import sqlalchemy.types as types
from sqlalchemy.orm import sessionmaker, Session, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from sqlalchemy.orm import declarative_base

# Pydantic Settings for environment variables
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel, ConfigDict

# --- Configuration ---
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./onejob.db"  # Default to SQLite

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# --- Database Setup ---
# Handle SQLite vs PostgreSQL differences
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite needs check_same_thread=False for FastAPI
    from sqlalchemy.pool import StaticPool
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Custom UUID type that works with both SQLite and PostgreSQL
class UUID(types.TypeDecorator):
    """Platform-independent UUID type"""
    impl = types.String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgreSQLUUID(as_uuid=True))
        else:
            return dialect.type_descriptor(types.String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            else:
                return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid.UUID):
                return value
            else:
                return uuid.UUID(value)

# SQLAlchemy Models

# Project Model (NEW for unified recursive architecture)
class DBProject(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)  # hex color #RRGGBB
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # emoji or icon name

    # Integration configuration (per-project backends!)
    integration_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # 'github', 'trello', 'asana'
    integration_config: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # JSON string

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    archived: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationship to tasks
    tasks = relationship("DBTask", back_populates="project", cascade="all, delete-orphan")


class DBTask(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # RE-ADDED: 'completed' column. The database expects this.
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    status: Mapped[str] = mapped_column(String, default="todo") # 'todo' or 'done'
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deferred_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    deferral_count: Mapped[int] = mapped_column(Integer, default=0)

    sort_order: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # Used for active tasks
    external_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String, nullable=True) # e.g., "linear", "jira"

    # NEW: Recursive hierarchy fields
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(), ForeignKey("tasks.id"), nullable=True)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(), ForeignKey("projects.id"))
    depth: Mapped[int] = mapped_column(Integer, default=0)
    path: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # materialized path: '/uuid/uuid/uuid'

    # Relationships
    project = relationship("DBProject", back_populates="tasks")
    parent = relationship("DBTask", remote_side=[id], back_populates="children")
    children = relationship("DBTask", back_populates="parent", cascade="all, delete-orphan")

    # OLD: Relationship to substacks (keep for backward compatibility during transition)
    substacks = relationship("DBSubstack", back_populates="parent_task", cascade="all, delete-orphan")


class DBSubstack(Base):
    __tablename__ = "substacks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, index=True)
    parent_task_id: Mapped[uuid.UUID] = mapped_column(UUID(), ForeignKey("tasks.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    parent_task = relationship("DBTask", back_populates="substacks")
    tasks = relationship("DBSubstackTask", back_populates="substack", cascade="all, delete-orphan")


class DBSubstackTask(Base):
    __tablename__ = "substack_tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    substack_id: Mapped[uuid.UUID] = mapped_column(UUID(), ForeignKey("substacks.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationship
    substack = relationship("DBSubstack", back_populates="tasks")


# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models for request/response

# Project models (NEW)
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class ProjectCreate(ProjectBase):
    integration_type: Optional[str] = None
    integration_config: Optional[str] = None  # JSON string

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    integration_type: Optional[str] = None
    integration_config: Optional[str] = None
    archived: Optional[bool] = None

    model_config = ConfigDict(extra='ignore')

class ProjectResponse(ProjectBase):
    id: uuid.UUID
    integration_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    archived: bool
    task_count: int = 0  # Computed field
    completed_count: int = 0  # Computed field

    model_config = ConfigDict(from_attributes=True)


# Task models
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    parent_id: Optional[uuid.UUID] = None  # NEW: Support creating child tasks
    project_id: Optional[uuid.UUID] = None  # NEW: Specify project (defaults to current)

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None # Will only be "todo" or "done" now
    is_deferral: Optional[bool] = None
    parent_id: Optional[uuid.UUID] = None  # NEW: Move task to different parent
    project_id: Optional[uuid.UUID] = None  # NEW: Move task to different project

    model_config = ConfigDict(extra='ignore')


# Substack-related Pydantic models  
class SubstackTaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class SubstackTaskCreate(SubstackTaskBase):
    pass

class SubstackTaskResponse(SubstackTaskBase):
    id: uuid.UUID
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    sort_order: int
    
    model_config = ConfigDict(from_attributes=True)

class SubstackBase(BaseModel):
    name: str

class SubstackCreate(SubstackBase):
    pass

class SubstackResponse(SubstackBase):
    id: uuid.UUID
    parent_task_id: uuid.UUID
    created_at: datetime
    tasks: List['SubstackTaskResponse'] = []
    
    model_config = ConfigDict(from_attributes=True)


class TaskResponse(TaskBase):
    id: uuid.UUID
    completed: bool # RE-ADDED: This field is expected by the frontend based on the error.
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    deferred_at: Optional[datetime] = None
    deferral_count: int
    sort_order: Optional[int] = None
    external_id: Optional[str] = None
    source: Optional[str] = None

    # NEW: Recursive hierarchy fields
    parent_id: Optional[uuid.UUID] = None
    project_id: uuid.UUID
    depth: int = 0
    path: Optional[str] = None
    has_children: bool = False  # Computed field
    children: List['TaskResponse'] = []  # Lazy-loaded child tasks
    breadcrumb_path: List[str] = []  # For search results: parent task titles

    # OLD: Keep substacks for backward compatibility during transition
    substacks: List['SubstackResponse'] = []

    model_config = ConfigDict(from_attributes=True)


# --- API Endpoints ---
app = FastAPI()

# CORS configuration to allow frontend to communicate with backend
origins = [
    "http://localhost:8080",  # Frontend URL
    "http://127.0.0.1:8080",  # Alternative frontend URL
    "http://localhost:5173",  # Vite default port
    "https://onejob.co",      # Production domain
    "https://www.onejob.co",  # Production www domain
    "https://design-in-product.github.io",  # GitHub Pages domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
Base.metadata.create_all(bind=engine)


# ===== PROJECTS API (NEW) =====

@app.get("/projects", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects with task counts"""
    projects = db.query(DBProject).filter(DBProject.archived == False).all()

    result = []
    for project in projects:
        # Count tasks in this project
        task_count = db.query(func.count(DBTask.id)).filter(
            DBTask.project_id == project.id,
            DBTask.status == "todo"
        ).scalar()

        completed_count = db.query(func.count(DBTask.id)).filter(
            DBTask.project_id == project.id,
            DBTask.status == "done"
        ).scalar()

        project_response = ProjectResponse.model_validate(project)
        project_response.task_count = task_count
        project_response.completed_count = completed_count
        result.append(project_response)

    return result


@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a single project by ID"""
    project = db.query(DBProject).filter(DBProject.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    # Count tasks
    task_count = db.query(func.count(DBTask.id)).filter(
        DBTask.project_id == project.id,
        DBTask.status == "todo"
    ).scalar()

    completed_count = db.query(func.count(DBTask.id)).filter(
        DBTask.project_id == project.id,
        DBTask.status == "done"
    ).scalar()

    project_response = ProjectResponse.model_validate(project)
    project_response.task_count = task_count
    project_response.completed_count = completed_count
    return project_response


@app.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    db_project = DBProject(
        name=project.name,
        description=project.description,
        color=project.color,
        icon=project.icon,
        integration_type=project.integration_type,
        integration_config=project.integration_config
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    project_response = ProjectResponse.model_validate(db_project)
    project_response.task_count = 0
    project_response.completed_count = 0
    return project_response


@app.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update a project"""
    db_project = db.query(DBProject).filter(DBProject.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update fields
    if project_update.name is not None:
        db_project.name = project_update.name
    if project_update.description is not None:
        db_project.description = project_update.description
    if project_update.color is not None:
        db_project.color = project_update.color
    if project_update.icon is not None:
        db_project.icon = project_update.icon
    if project_update.integration_type is not None:
        db_project.integration_type = project_update.integration_type
    if project_update.integration_config is not None:
        db_project.integration_config = project_update.integration_config
    if project_update.archived is not None:
        db_project.archived = project_update.archived

    db_project.updated_at = datetime.now(timezone.utc)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Count tasks
    task_count = db.query(func.count(DBTask.id)).filter(
        DBTask.project_id == project_id,
        DBTask.status == "todo"
    ).scalar()

    completed_count = db.query(func.count(DBTask.id)).filter(
        DBTask.project_id == project_id,
        DBTask.status == "done"
    ).scalar()

    project_response = ProjectResponse.model_validate(db_project)
    project_response.task_count = task_count
    project_response.completed_count = completed_count
    return project_response


@app.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    """Archive a project (soft delete)"""
    db_project = db.query(DBProject).filter(DBProject.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    db_project.archived = True
    db_project.updated_at = datetime.now(timezone.utc)

    db.add(db_project)
    db.commit()


# ===== TASKS API (Enhanced for hierarchy) =====

@app.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task (root or child)"""

    # Determine project_id (use provided or default)
    project_id = task.project_id
    if project_id is None:
        # Get default project
        default_project = db.query(DBProject).filter(
            DBProject.id == '00000000-0000-0000-0000-000000000001'
        ).first()
        if default_project is None:
            raise HTTPException(status_code=400, detail="No default project found")
        project_id = default_project.id

    # Calculate depth and path
    depth = 0
    parent_path = ""
    if task.parent_id is not None:
        # Verify parent exists
        parent_task = db.query(DBTask).filter(DBTask.id == task.parent_id).first()
        if parent_task is None:
            raise HTTPException(status_code=404, detail="Parent task not found")

        depth = parent_task.depth + 1
        parent_path = parent_task.path or f"/{parent_task.id}"

    # Find the maximum sort_order for existing active tasks at same level
    # Active tasks are those with status 'todo'
    max_order_result = db.query(func.max(DBTask.sort_order)).filter(
        DBTask.status == "todo",
        DBTask.parent_id == task.parent_id,
        DBTask.project_id == project_id
    ).scalar()

    new_sort_order = (max_order_result or 0) + 1

    # Create task
    db_task = DBTask(
        title=task.title,
        description=task.description,
        status="todo",
        sort_order=new_sort_order,
        completed=False,
        parent_id=task.parent_id,
        project_id=project_id,
        depth=depth
    )

    db.add(db_task)
    db.flush()  # Get the ID

    # Set path
    db_task.path = f"{parent_path}/{db_task.id}"

    db.commit()
    db.refresh(db_task)

    # Check if has children
    has_children = db.query(func.count(DBTask.id)).filter(
        DBTask.parent_id == db_task.id
    ).scalar() > 0

    response = TaskResponse.model_validate(db_task)
    response.has_children = has_children
    return response


@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(
    db: Session = Depends(get_db),
    project_id: Optional[uuid.UUID] = None,
    parent_id: Optional[uuid.UUID] = None,
    include_children: bool = False
):
    """
    Get tasks, optionally filtered by project and/or parent.
    - If project_id is provided, only tasks from that project
    - If parent_id is provided, only children of that task
    - If parent_id is None (default), only root tasks (parent_id IS NULL)
    - If include_children is True, recursively load all children
    """

    # Build query
    query = db.query(DBTask)

    if project_id is not None:
        query = query.filter(DBTask.project_id == project_id)

    # Filter by parent
    if parent_id is not None:
        query = query.filter(DBTask.parent_id == parent_id)
    else:
        # Default: only root tasks
        query = query.filter(DBTask.parent_id.is_(None))

    tasks = query.all()

    # Separate tasks by status
    todo_tasks = []
    done_tasks = []

    for task in tasks:
        if task.status == "todo":
            todo_tasks.append(task)
        elif task.status == "done":
            done_tasks.append(task)

    # Sort todo tasks by sort_order (ascending)
    todo_tasks.sort(key=lambda t: t.sort_order if t.sort_order is not None else float('inf'))

    # Sort done tasks by completed_at in descending order (most recent first)
    done_tasks.sort(key=lambda t: (t.completed_at is not None, t.completed_at), reverse=True)

    # Convert to responses
    result = []
    for task in todo_tasks + done_tasks:
        response = TaskResponse.model_validate(task)

        # Check if has children
        has_children = db.query(func.count(DBTask.id)).filter(
            DBTask.parent_id == task.id
        ).scalar() > 0
        response.has_children = has_children

        # Optionally load children recursively
        if include_children and has_children:
            children = db.query(DBTask).filter(DBTask.parent_id == task.id).all()
            response.children = [TaskResponse.model_validate(child) for child in children]

        result.append(response)

    return result


@app.get("/projects/{project_id}/tasks", response_model=List[TaskResponse])
async def get_project_tasks(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    parent_id: Optional[uuid.UUID] = None
):
    """Get tasks for a specific project"""
    return await get_tasks(db=db, project_id=project_id, parent_id=parent_id)


@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: uuid.UUID, db: Session = Depends(get_db), include_children: bool = False):
    """Get a single task by ID"""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    response = TaskResponse.model_validate(task)

    # Check if has children
    has_children = db.query(func.count(DBTask.id)).filter(
        DBTask.parent_id == task.id
    ).scalar() > 0
    response.has_children = has_children

    # Optionally load children
    if include_children and has_children:
        children = db.query(DBTask).filter(DBTask.parent_id == task.id).all()
        response.children = [TaskResponse.model_validate(child) for child in children]

    return response


@app.get("/tasks/{task_id}/children", response_model=List[TaskResponse])
async def get_task_children(task_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get immediate children of a task"""
    # Verify parent exists
    parent_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if parent_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Get children
    children = db.query(DBTask).filter(DBTask.parent_id == task_id).all()

    result = []
    for child in children:
        response = TaskResponse.model_validate(child)

        # Check if child has children
        has_children = db.query(func.count(DBTask.id)).filter(
            DBTask.parent_id == child.id
        ).scalar() > 0
        response.has_children = has_children

        result.append(response)

    return result


@app.get("/search", response_model=List[TaskResponse])
async def search_tasks(
    q: str,
    project_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db)
):
    """
    Global search across all tasks in hierarchies.

    Searches title and description fields (case-insensitive).
    Returns tasks with breadcrumb information showing location in hierarchy.

    Query params:
    - q: Search query string (required)
    - project_id: Optional project filter
    """
    if not q or len(q.strip()) < 1:
        raise HTTPException(status_code=400, detail="Search query must be at least 1 character")

    # Build base query
    query = db.query(DBTask)

    # Filter by project if specified
    if project_id:
        query = query.filter(DBTask.project_id == project_id)

    # Case-insensitive search across title and description
    search_pattern = f"%{q}%"
    query = query.filter(
        (DBTask.title.ilike(search_pattern)) |
        (DBTask.description.ilike(search_pattern))
    )

    # Order by relevance (title matches first, then by depth for hierarchy context)
    # Title matches are more relevant than description matches
    results = query.order_by(
        DBTask.title.ilike(search_pattern).desc(),
        DBTask.depth.asc(),
        DBTask.created_at.desc()
    ).all()

    # Convert to response format with breadcrumb paths
    response_tasks = []
    for task in results:
        # Build breadcrumb path by traversing up the hierarchy
        breadcrumb_path = []
        current = task
        while current.parent_id:
            parent = db.query(DBTask).filter(DBTask.id == current.parent_id).first()
            if parent:
                breadcrumb_path.insert(0, parent.title)
                current = parent
            else:
                break

        # Convert to response
        response = TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            status=task.status,
            created_at=task.created_at,
            completed_at=task.completed_at,
            deferred_at=task.deferred_at,
            deferral_count=task.deferral_count,
            sort_order=task.sort_order,
            external_id=task.external_id,
            source=task.source,
            parent_id=task.parent_id,
            project_id=task.project_id,
            depth=task.depth,
            path=task.path,
            has_children=len(task.children) > 0,
            breadcrumb_path=breadcrumb_path  # Add breadcrumb for search results
        )

        response_tasks.append(response)

    return response_tasks


@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
):
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    original_status = db_task.status
    original_sort_order = db_task.sort_order

    # Apply title/description updates directly
    if task_update.title is not None:
        db_task.title = task_update.title
    if task_update.description is not None:
        db_task.description = task_update.description

    # --- NEW DEFERRAL LOGIC ---
    if task_update.is_deferral:
        # A task can only be deferred if it's currently 'todo'
        if db_task.status == "todo":
            db_task.deferred_at = datetime.now(timezone.utc)
            db_task.deferral_count += 1

            # 1. Shift tasks that were below the original_sort_order UP by 1
            #    This only affects tasks that are currently 'todo'
            if original_sort_order is not None:
                db.query(DBTask).filter(
                    DBTask.status == "todo",
                    DBTask.sort_order > original_sort_order
                ).update(
                    {DBTask.sort_order: DBTask.sort_order - 1},
                    synchronize_session=False
                )

            # 2. Find the maximum sort_order among all 'todo' tasks *after* the shift
            max_order_result = db.query(func.max(DBTask.sort_order)).filter(
                DBTask.status == "todo"
            ).scalar()

            new_sort_order = (max_order_result or 0) + 1

            # 3. Assign the new maximum sort_order to the *currently deferring task*
            db_task.sort_order = new_sort_order
        else:
            raise HTTPException(status_code=400, detail="Cannot defer a non-todo task.")
        
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return TaskResponse.model_validate(db_task)


    # --- STATUS CHANGE LOGIC (todo <-> done) ---
    if task_update.status is not None and task_update.status != original_status:
        db_task.status = task_update.status

        # Update the redundant 'completed' field for frontend compatibility
        if db_task.status == "done":
            db_task.completed = True
        elif db_task.status == "todo":
            db_task.completed = False

        # If status changes FROM 'todo' TO 'done'
        if task_update.status == "done" and original_status == "todo":
            db_task.completed_at = datetime.now(timezone.utc)
            db_task.deferred_at = None
            
            if original_sort_order is not None:
                db.query(DBTask).filter(
                    DBTask.status == "todo",
                    DBTask.sort_order > original_sort_order
                ).update(
                    {DBTask.sort_order: DBTask.sort_order - 1},
                    synchronize_session=False
                )
            db_task.sort_order = None # No sort_order for done tasks

        # If status changes FROM 'done' TO 'todo' (re-activate)
        elif task_update.status == "todo" and original_status == "done":
            db_task.completed_at = None
            db_task.deferred_at = None 
            
            db.query(DBTask).filter(DBTask.status == "todo").update(
                {DBTask.sort_order: DBTask.sort_order + 1},
                synchronize_session=False
            )
            db_task.sort_order = 1 


    # Commit changes that happened outside the is_deferral block
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return TaskResponse.model_validate(db_task)


# --- Substack API Endpoints ---

@app.post("/tasks/{task_id}/substacks", response_model=SubstackResponse, status_code=status.HTTP_201_CREATED)
async def create_substack(task_id: uuid.UUID, substack: SubstackCreate, db: Session = Depends(get_db)):
    # Check if parent task exists
    parent_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if parent_task is None:
        raise HTTPException(status_code=404, detail="Parent task not found")
    
    db_substack = DBSubstack(
        name=substack.name,
        parent_task_id=task_id
    )
    db.add(db_substack)
    db.commit()
    db.refresh(db_substack)
    return SubstackResponse.model_validate(db_substack)


@app.post("/substacks/{substack_id}/tasks", response_model=SubstackTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_substack_task(substack_id: uuid.UUID, task: SubstackTaskCreate, db: Session = Depends(get_db)):
    # Check if substack exists
    substack = db.query(DBSubstack).filter(DBSubstack.id == substack_id).first()
    if substack is None:
        raise HTTPException(status_code=404, detail="Substack not found")
    
    # Find the maximum sort_order for existing tasks in this substack
    max_order_result = db.query(func.max(DBSubstackTask.sort_order)).filter(
        DBSubstackTask.substack_id == substack_id
    ).scalar()
    
    new_sort_order = (max_order_result or 0) + 1
    
    db_task = DBSubstackTask(
        title=task.title,
        description=task.description,
        substack_id=substack_id,
        sort_order=new_sort_order
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return SubstackTaskResponse.model_validate(db_task)


@app.put("/substack-tasks/{task_id}", response_model=SubstackTaskResponse)
async def update_substack_task(task_id: uuid.UUID, task_update: dict, db: Session = Depends(get_db)):
    db_task = db.query(DBSubstackTask).filter(DBSubstackTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Substack task not found")
    
    if "completed" in task_update:
        db_task.completed = task_update["completed"]
        if task_update["completed"]:
            db_task.completed_at = datetime.now(timezone.utc)
        else:
            db_task.completed_at = None
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return SubstackTaskResponse.model_validate(db_task)

