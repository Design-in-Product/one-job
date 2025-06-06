# backend/main.py
#
# Change Log:
# ... (previous changes) ...
# 2025-06-05: Implemented explicit integer-based sort order for Main Stack.
#             - Added 'sort_order' column to DBTask model.
#             - Modified 'create_task' to manage sort_order for new tasks.
#             - Updated GET /tasks sorting to prioritize sort_order for active tasks.
# 2025-06-06  - Added inspect and func to SQLAlchemy Imports, added inspect and func

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

# SQLAlchemy Imports
# NOTE: Added Integer for sort_order
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, UUID, Integer, text, desc, asc, inspect, func
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# Pydantic Settings for environment variables
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel

# --- Configuration ---
class Settings(BaseSettings):
    DATABASE_URL: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# --- Database Setup ---
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# SQLAlchemy Model
class DBTask(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="todo", index=True) # "todo", "done", "deferred"
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    deferred_at = Column(DateTime(timezone=True), nullable=True) # Still useful for auditing/specific deferred sorting
    sort_order = Column(Integer, nullable=True) # <--- ADDED THIS LINE

    source = Column(String, nullable=True)
    external_id = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "deferred_at": self.deferred_at.isoformat() if self.deferred_at else None,
            "sort_order": self.sort_order, # <--- ADDED THIS LINE
            "source": self.source,
            "external_id": self.external_id,
        }

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- FastAPI App Setup ---
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initial Data (Optional - for first run only) ---
initial_tasks_data = [
    {"title": "Set up FastAPI Backend", "description": "Successfully run the basic FastAPI app.", "status": "done"},
    {"title": "Connect Frontend & Backend", "description": "Make React fetch data from FastAPI.", "status": "done"},
    {"title": "Integrate PostgreSQL", "description": "Get the database running and connected to FastAPI.", "status": "todo"},
    {"title": "Define Task API Endpoints", "description": "Create API routes for CRUD operations on tasks.", "status": "todo"},
    {"title": "Update Frontend to Use API", "description": "Modify React components to send/receive data via new API endpoints.", "status": "todo"},
]

def create_db_and_tables():
    # Base.metadata.drop_all(engine) # DANGER! Uncomment for a clean slate during dev ONLY IF you want to reset all data and tables.
    Base.metadata.create_all(engine) # Create tables if they don't exist

    db = SessionLocal()
    try:
        # Check if 'sort_order' column exists. This is a simple migration helper.
        # A more robust solution would use Alembic.
        inspector = inspect(db.bind)
        columns = inspector.get_columns('tasks')
        column_names = [col['name'] for col in columns]

        if 'sort_order' not in column_names:
            print("Adding 'sort_order' column to tasks table...")
            db.execute(text("ALTER TABLE tasks ADD COLUMN sort_order INTEGER NULL"))
            db.commit()
            print("'sort_order' column added.")

        if db.query(DBTask).count() == 0:
            print("Database is empty. Populating with initial tasks...")
            current_sort_order = 0
            for task_data in initial_tasks_data:
                # Assign sort_order only for 'todo' tasks initially
                if task_data["status"] == "todo":
                    current_sort_order += 1
                db_task = DBTask(
                    id=uuid.uuid4(),
                    title=task_data["title"],
                    description=task_data["description"],
                    status=task_data["status"],
                    created_at=datetime.now(timezone.utc),
                    completed_at=datetime.now(timezone.utc) if task_data["status"] == "done" else None,
                    deferred_at=None,
                    sort_order=current_sort_order if task_data["status"] == "todo" else None # Assign initial sort_order
                )
                db.add(db_task)
            db.commit()
            print("Initial tasks populated.")
        else:
            print("Database already contains tasks. Skipping initial population.")
            # For existing tasks that don't have sort_order yet, initialize them
            # This is a one-time migration for existing data
            if 'sort_order' in column_names: # Ensure column exists before trying to update
                tasks_without_sort_order = db.query(DBTask).filter(DBTask.status.in_(["todo", "deferred"]), DBTask.sort_order.is_(None)).order_by(asc(DBTask.created_at)).all()
                if tasks_without_sort_order:
                    print("Initializing sort_order for existing active tasks...")
                    # Find max existing sort_order for active tasks
                    # Use func.max and scalar() to safely get the max value, defaulting to None if no records
                    max_existing_sort_order = db.query(func.max(DBTask.sort_order)).filter(
                        DBTask.status.in_(["todo", "deferred"])
                    ).scalar() # Use scalar() to get just the value
    
                    # If no existing sort_order found, start from 0 for the next_sort_order calculation
                    # The next sort_order will be (current max or 0) + 1
                    next_sort_order = (max_existing_sort_order if max_existing_sort_order is not None else 0) + 1
    
                    for task in tasks_without_sort_order:
                        task.sort_order = next_sort_order
                        next_sort_order += 1
                        db.add(task)
                    db.commit()
                    print("Sort orders initialized.")

    except Exception as e:
        print(f"Error during initial database population or migration: {e}")
        db.rollback()
    finally:
        db.close()

# --- FastAPI Lifespan Events ---
@app.on_event("startup")
async def startup_event():
    print("FastAPI app startup: Creating database tables if they don't exist...")
    create_db_and_tables()
    print("Database initialization complete.")

# --- Pydantic Models for Request/Response ---
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    # We won't allow direct update of sort_order from frontend for now, it's backend-managed

class TaskResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    completed: bool
    status: str
    createdAt: datetime
    completedAt: Optional[datetime] = None
    deferredAt: Optional[datetime] = None
    sortOrder: Optional[int] = None # <--- ADDED THIS LINE
    source: Optional[str] = None
    externalId: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

    @classmethod
    def from_orm_model(cls, db_task: DBTask):
        return cls(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            completed=db_task.status == 'done',
            status=db_task.status,
            createdAt=db_task.created_at,
            completedAt=db_task.completed_at,
            deferredAt=db_task.deferred_at,
            sortOrder=db_task.sort_order, # <--- ADDED THIS LINE
            source=db_task.source,
            externalId=db_task.external_id,
        )


# --- API Endpoints ---

@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    """
    Retrieves all tasks from the database,
    ordered by sort_order for active tasks (todo/deferred)
    and by completed_at for done tasks.
    """
    # Fetch active tasks (todo and deferred) ordered by sort_order
    active_tasks = db.query(DBTask).filter(DBTask.status.in_(["todo", "deferred"])).order_by(asc(DBTask.sort_order)).all()

    # Fetch done tasks ordered by completed_at (newest first)
    done_tasks = db.query(DBTask).filter(DBTask.status == "done").order_by(desc(DBTask.completed_at)).all()

    # Combine active and done tasks. Frontend's TaskStack should only display active.
    # We can separate these into two lists in the response if the frontend needs both,
    # but for now, we'll return a single list and let the frontend filter.
    # The crucial part is that active tasks are returned in sort_order.
    all_tasks = active_tasks + done_tasks # Order here doesn't matter for frontend filtering, but consistent.
    return [TaskResponse.from_orm_model(task) for task in all_tasks]


@app.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """
    Creates a new task in the database, assigning it sort_order 1
    and shifting all other active tasks down.
    """
    # Shift existing active tasks down by 1
    db.query(DBTask).filter(DBTask.status.in_(["todo", "deferred"])).update(
        {DBTask.sort_order: DBTask.sort_order + 1},
        synchronize_session=False # Important for bulk updates
    )
    db.commit()

    # Create the new task with sort_order 1
    db_task = DBTask(
        id=uuid.uuid4(),
        title=task.title,
        description=task.description,
        status="todo",
        created_at=datetime.now(timezone.utc),
        sort_order=1, # New task goes to the top (sort_order 1)
        deferred_at=None,
        completed_at=None
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return TaskResponse.from_orm_model(db_task)

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Retrieves a single task by its ID.
    """
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.from_orm_model(db_task)

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: uuid.UUID, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """
    Updates an existing task's details or status.
    This logic will be significantly expanded for sort_order management.
    """
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

    # Handle status changes (This will be complex for sort_order management)
    if task_update.status is not None and task_update.status != original_status:
        db_task.status = task_update.status

        # If status changes FROM active (todo/deferred) TO done
        if task_update.status == "done":
            db_task.completed_at = datetime.now(timezone.utc)
            db_task.deferred_at = None
            # When a task is marked done, it leaves the sort_order sequence
            # All tasks below its original sort_order need to be decremented
            if original_sort_order is not None:
                db.query(DBTask).filter(
                    DBTask.status.in_(["todo", "deferred"]),
                    DBTask.sort_order > original_sort_order
                ).update(
                    {DBTask.sort_order: DBTask.sort_order - 1},
                    synchronize_session=False
                )
            db_task.sort_order = None # No sort_order for done tasks
        # If status changes FROM done TO active (todo/deferred) - re-adds to top
        elif original_status == "done" and task_update.status in ["todo", "deferred"]:
            db_task.completed_at = None
            # Shift all active tasks down by 1 to make space at the top
            db.query(DBTask).filter(DBTask.status.in_(["todo", "deferred"])).update(
                {DBTask.sort_order: DBTask.sort_order + 1},
                synchronize_session=False
            )
            db_task.sort_order = 1 # New task goes to the top
            if task_update.status == "deferred":
                db_task.deferred_at = datetime.now(timezone.utc)
            else:
                db_task.deferred_at = None
        # If status changes WITHIN active (e.g., todo to deferred, or deferred to todo)
        elif task_update.status == "deferred" and original_status == "todo":
            # Deferral: move to bottom of the active stack
            db_task.deferred_at = datetime.now(timezone.utc)
            db_task.completed_at = None # Ensure it's not marked completed

            # 1. Decrement sort_order of tasks that were below this task
            if original_sort_order is not None:
                db.query(DBTask).filter(
                    DBTask.status.in_(["todo", "deferred"]),
                    DBTask.sort_order > original_sort_order
                ).update(
                    {DBTask.sort_order: DBTask.sort_order - 1},
                    synchronize_session=False
                )
            # 2. Find the new maximum sort_order for active tasks
            max_order_result = db.query(DBTask.sort_order).filter(
                DBTask.status.in_(["todo", "deferred"])
            ).order_by(desc(DBTask.sort_order)).first()
            
            new_sort_order = 1 # Default if no other active tasks
            if max_order_result and max_order_result[0] is not None:
                new_sort_order = max_order_result[0] + 1
            
            db_task.sort_order = new_sort_order

        elif task_update.status == "todo" and original_status == "deferred":
            # Moving from deferred back to todo: put it at the top (sort_order 1)
            db_task.deferred_at = None
            db_task.completed_at = None

            # Shift all active tasks down by 1 to make space at the top
            db.query(DBTask).filter(DBTask.status.in_(["todo", "deferred"])).update(
                {DBTask.sort_order: DBTask.sort_order + 1},
                synchronize_session=False
            )
            db_task.sort_order = 1


    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return TaskResponse.from_orm_model(db_task)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the One Job FastAPI Backend (PostgreSQL enabled)!"}
