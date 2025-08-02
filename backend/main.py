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

# SQLAlchemy Model
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
    
    # Relationship to substacks
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
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None # Will only be "todo" or "done" now
    is_deferral: Optional[bool] = None

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

@app.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # Find the maximum sort_order for existing active tasks
    # Active tasks are those with status 'todo'
    max_order_result = db.query(func.max(DBTask.sort_order)).filter(
        DBTask.status == "todo"
    ).scalar()

    new_sort_order = (max_order_result or 0) + 1

    db_task = DBTask(
        title=task.title,
        description=task.description,
        # Default status for new tasks is 'todo'
        status="todo",
        sort_order=new_sort_order,
        completed=False # Ensure 'completed' is set for new tasks
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return TaskResponse.model_validate(db_task)


@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    # Fetch all tasks with their substacks
    tasks = db.query(DBTask).all()

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

    return [TaskResponse.model_validate(task) for task in todo_tasks + done_tasks]


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

