"""
Basic tests for the One Job API
Following TDD principles for domain-driven development
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app, get_db, Base

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_task():
    """Test creating a new task"""
    response = client.post(
        "/tasks",
        json={"title": "Test Task", "description": "A test task"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "A test task"
    assert data["status"] == "todo"
    assert data["completed"] == False
    assert data["sort_order"] == 1

def test_get_tasks():
    """Test retrieving tasks"""
    # Create a task first
    client.post(
        "/tasks",
        json={"title": "Another Task", "description": "Another test task"}
    )
    
    response = client.get("/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(task["title"] == "Another Task" for task in data)

def test_complete_task():
    """Test completing a task"""
    # Create a task
    create_response = client.post(
        "/tasks",
        json={"title": "Task to Complete", "description": "Will be completed"}
    )
    task_id = create_response.json()["id"]
    
    # Complete the task
    response = client.put(
        f"/tasks/{task_id}",
        json={"status": "done"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
    assert data["completed"] == True
    assert data["completed_at"] is not None

def test_defer_task():
    """Test deferring a task"""
    # Create a task
    create_response = client.post(
        "/tasks",
        json={"title": "Task to Defer", "description": "Will be deferred"}
    )
    task_id = create_response.json()["id"]
    
    # Defer the task
    response = client.put(
        f"/tasks/{task_id}",
        json={"is_deferral": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "todo"  # Still todo, but moved to bottom
    assert data["deferred_at"] is not None
    assert data["deferral_count"] == 1

if __name__ == "__main__":
    pytest.main([__file__])