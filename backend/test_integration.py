"""
Integration tests demonstrating full One Job functionality
Tests the complete workflow from task creation to substack management
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app, get_db, Base

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_integration.db"

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

@pytest.fixture(autouse=True)
def clean_db():
    """Clean database before each test"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_complete_workflow():
    """Test complete workflow: task creation -> substack creation -> task management"""
    
    # 1. Create a main task
    task_response = client.post(
        "/tasks",
        json={"title": "Build One Job App", "description": "Complete task management application"}
    )
    assert task_response.status_code == 201
    task_data = task_response.json()
    task_id = task_data["id"]
    assert task_data["title"] == "Build One Job App"
    assert task_data["status"] == "todo"
    assert task_data["substacks"] == []
    
    # 2. Create a substack for the main task
    substack_response = client.post(
        f"/tasks/{task_id}/substacks",
        json={"name": "Frontend Development"}
    )
    assert substack_response.status_code == 201
    substack_data = substack_response.json()
    substack_id = substack_data["id"]
    assert substack_data["name"] == "Frontend Development"
    assert substack_data["parent_task_id"] == task_id
    assert substack_data["tasks"] == []
    
    # 3. Add tasks to the substack
    subtask1_response = client.post(
        f"/substacks/{substack_id}/tasks",
        json={"title": "Set up React components", "description": "Create UI components"}
    )
    assert subtask1_response.status_code == 201
    subtask1 = subtask1_response.json()
    assert subtask1["title"] == "Set up React components"
    assert subtask1["completed"] == False
    
    subtask2_response = client.post(
        f"/substacks/{substack_id}/tasks",
        json={"title": "Implement API integration", "description": "Connect to backend"}
    )
    assert subtask2_response.status_code == 201
    subtask2 = subtask2_response.json()
    
    # 4. Verify task hierarchy by fetching the main task
    tasks_response = client.get("/tasks")
    assert tasks_response.status_code == 200
    tasks = tasks_response.json()
    
    main_task = next(task for task in tasks if task["id"] == task_id)
    assert len(main_task["substacks"]) == 1
    assert main_task["substacks"][0]["name"] == "Frontend Development"
    assert len(main_task["substacks"][0]["tasks"]) == 2
    
    # 5. Complete a subtask
    client.put(
        f"/substack-tasks/{subtask1['id']}",
        json={"completed": True}
    )
    
    # 6. Defer the main task
    defer_response = client.put(
        f"/tasks/{task_id}",
        json={"is_deferral": True}
    )
    assert defer_response.status_code == 200
    deferred_task = defer_response.json()
    assert deferred_task["deferral_count"] == 1
    assert deferred_task["deferred_at"] is not None
    
    # 7. Complete the main task
    complete_response = client.put(
        f"/tasks/{task_id}",
        json={"status": "done"}
    )
    assert complete_response.status_code == 200
    completed_task = complete_response.json()
    assert completed_task["status"] == "done"
    assert completed_task["completed"] == True
    assert completed_task["completed_at"] is not None

def test_task_ordering():
    """Test that task sorting works correctly"""
    
    # Create multiple tasks
    tasks = []
    for i in range(3):
        response = client.post(
            "/tasks",
            json={"title": f"Task {i+1}", "description": f"Task number {i+1}"}
        )
        tasks.append(response.json())
    
    # Verify they have ascending sort orders
    assert tasks[0]["sort_order"] == 1
    assert tasks[1]["sort_order"] == 2  
    assert tasks[2]["sort_order"] == 3
    
    # Defer the first task
    client.put(
        f"/tasks/{tasks[0]['id']}",
        json={"is_deferral": True}
    )
    
    # Check that it moved to the end
    updated_tasks = client.get("/tasks").json()
    todo_tasks = [t for t in updated_tasks if t["status"] == "todo"]
    
    # Find our deferred task
    deferred = next(t for t in todo_tasks if t["id"] == tasks[0]["id"])
    # The deferred task should have a higher sort_order (it was moved to the end)
    assert deferred["sort_order"] >= max(t["sort_order"] for t in todo_tasks if t["id"] != tasks[0]["id"])

if __name__ == "__main__":
    pytest.main([__file__, "-v"])