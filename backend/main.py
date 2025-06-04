# backend/main.py
#
# Change Log:
# 2025-06-04: Integrated PostgreSQL with SQLAlchemy.
#             - Added database configuration via pydantic-settings.
#             - Defined SQLAlchemy Base and Task model.
#             - Implemented create_db_and_tables function to create schema on startup.
#             - Modified /tasks GET endpoint to fetch from DB.
#             - Added /tasks POST endpoint to create tasks in DB.
#             - Added /tasks/{task_id} GET endpoint to fetch a single task.
#             - Initial dummy data now inserted into DB on first run.

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

# SQLAlchemy Imports
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, UUID, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# Pydantic Settings for environment variables
from pydantic_settings import BaseSettings, SettingsConfigDict

# --- Configuration ---
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/db_name"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# --- Database Setup ---
# Use connect_args={"check_same_thread": False} for SQLite, not strictly necessary for PostgreSQL but harmless
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
    source = Column(String, nullable=True)
    external_id = Column(String, nullable=True)
    # substacks will be handled later, potentially as a separate table or through task relationships
    # For now, we'll keep the model flat to match current frontend expectations after transformation.

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
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

# Configure CORS (from previous step)
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
# This data will be inserted if the database is empty after creation.
initial_tasks_data = [
    {"title": "Set up FastAPI Backend", "description": "Successfully run the basic FastAPI app.", "status": "done"}, # Mark as done to show in completed
    {"title": "Connect Frontend & Backend", "description": "Make React fetch data from FastAPI.", "status": "done"}, # Mark as done to show in completed
    {"title": "Integrate PostgreSQL", "description": "Get the database running and connected to FastAPI.", "status": "todo"},
    {"title": "Define Task API Endpoints", "description": "Create API routes for CRUD operations on tasks.", "status": "todo"},
    {"title": "Update Frontend to Use API", "description": "Modify React components to send/receive data via new API endpoints.", "status": "todo"},
]

def create_db_and_tables():
    # Attempt to drop existing tables for fresh start if needed (DANGER in production!)
    # For development, this helps clear out old schema.
    # Base.metadata.drop_all(engine)
    
    Base.metadata.create_all(engine) # Create tables if they don't exist

    db = SessionLocal()
    try:
        # Check if tasks table is empty. Insert initial data if so.
        if db.query(DBTask).count() == 0:
            print("Database is empty. Populating with initial tasks...")
            for task_data in initial_tasks_data:
                db_task = DBTask(
                    id=uuid.uuid4(), # Generate UUID for new tasks
                    title=task_data["title"],
                    description=task_data["description"],
                    status=task_data["status"],
                    created_at=datetime.now(timezone.utc),
                    completed_at=datetime.now(timezone.utc) if task_data["status"] == "done" else None
                )
                db.add(db_task)
            db.commit()
            print("Initial tasks populated.")
        else:
            print("Database already contains tasks. Skipping initial population.")
    except Exception as e:
        print(f"Error during initial database population: {e}")
        db.rollback()
    finally:
        db.close()

# --- FastAPI Lifespan Events ---
# Run create_db_and_tables when the app starts
@app.on_event("startup")
async def startup_event():
    print("FastAPI app startup: Creating database tables if they don't exist...")
    create_db_and_tables()
    print("Database initialization complete.")

# --- Pydantic Models for Request/Response ---
# These define the data structure for API input/output validation
class TaskBase(BaseSettings):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass # No extra fields for creation for now

class TaskResponse(TaskBase):
    id: uuid.UUID
    completed: bool # Frontend expects 'completed' boolean
    createdAt: datetime # Frontend expects 'createdAt' Date object
    completedAt: Optional[datetime] = None # Frontend expects 'completedAt' Date object
    source: Optional[str] = None
    externalId: Optional[str] = None

    class Config:
        from_attributes = True # Was orm_mode = True in Pydantic V1

    # Custom mapping to convert DBTask to TaskResponse
    @classmethod
    def from_orm_model(cls, db_task: DBTask):
        return cls(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            completed=db_task.status == 'done',
            createdAt=db_task.created_at,
            completedAt=db_task.completed_at,
            source=db_task.source,
            externalId=db_task.external_id,
        )


# --- API Endpoints ---

@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    """
    Retrieves all tasks from the database, ordered by creation time.
    """
    tasks = db.query(DBTask).order_by(DBTask.created_at).all()
    # Convert DB models to Pydantic response models
    return [TaskResponse.from_orm_model(task) for task in tasks]

@app.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """
    Creates a new task in the database.
    """
    db_task = DBTask(
        id=uuid.uuid4(), # Generate UUID for new task
        title=task.title,
        description=task.description,
        status="todo", # New tasks are always 'todo' by default
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task) # Refresh to get auto-generated fields like default timestamps
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

@app.get("/")
async def read_root():
    return {"message": "Welcome to the One Job FastAPI Backend (PostgreSQL enabled)!"}
