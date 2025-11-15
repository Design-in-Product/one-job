"""
Demo Data Script - Hierarchical Task Navigation

Creates a sample task hierarchy to demonstrate the unified recursive model:
- Root tasks (depth 0)
- Child tasks (depth 1)
- Grandchild tasks (depth 2)
- Shows unlimited nesting capability

Run: python create_demo_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import DBTask, DBProject, settings
from datetime import datetime, timezone
import uuid

# Create engine
if settings.DATABASE_URL.startswith("sqlite"):
    from sqlalchemy.pool import StaticPool
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_demo_data():
    """Create hierarchical demo tasks"""
    db = SessionLocal()

    try:
        # Get or create default project
        project = db.query(DBProject).filter(
            DBProject.id == '00000000-0000-0000-0000-000000000001'
        ).first()

        if not project:
            print("❌ Default project not found. Run migration first!")
            return

        print("=" * 80)
        print("CREATING DEMO DATA - Hierarchical Tasks")
        print("=" * 80)

        # Clear existing demo tasks (optional - be careful in production!)
        # db.query(DBTask).delete()
        # db.commit()

        # ROOT TASK 1: Build One Job App
        print("\n[Root Task 1] Creating 'Build One Job App'...")
        root1 = DBTask(
            title="Build One Job App",
            description="Complete task management app with hierarchical navigation",
            status="todo",
            completed=False,
            project_id=project.id,
            parent_id=None,
            depth=0,
            sort_order=1
        )
        db.add(root1)
        db.flush()
        root1.path = f"/{root1.id}"
        print(f"  ✓ Created (ID: {root1.id})")

        # CHILD 1.1: Backend Development
        print("\n  [Child 1.1] Creating 'Backend Development'...")
        child1_1 = DBTask(
            title="Backend Development",
            description="Implement FastAPI backend with SQLAlchemy",
            status="todo",
            completed=False,
            project_id=project.id,
            parent_id=root1.id,
            depth=1,
            sort_order=1
        )
        db.add(child1_1)
        db.flush()
        child1_1.path = f"{root1.path}/{child1_1.id}"
        print(f"    ✓ Created (ID: {child1_1.id}, depth=1)")

        # GRANDCHILD 1.1.1: Database Schema
        print("\n    [Grandchild 1.1.1] Creating 'Database Schema'...")
        grandchild1_1_1 = DBTask(
            title="Database Schema Design",
            description="Design unified recursive task model with projects",
            status="done",
            completed=True,
            completed_at=datetime.now(timezone.utc),
            project_id=project.id,
            parent_id=child1_1.id,
            depth=2,
            sort_order=1
        )
        db.add(grandchild1_1_1)
        db.flush()
        grandchild1_1_1.path = f"{child1_1.path}/{grandchild1_1_1.id}"
        print(f"      ✓ Created (ID: {grandchild1_1_1.id}, depth=2, COMPLETED)")

        # GRANDCHILD 1.1.2: API Endpoints
        print("\n    [Grandchild 1.1.2] Creating 'API Endpoints'...")
        grandchild1_1_2 = DBTask(
            title="Implement REST API Endpoints",
            description="Projects CRUD, recursive task queries, hierarchy support",
            status="done",
            completed=True,
            completed_at=datetime.now(timezone.utc),
            project_id=project.id,
            parent_id=child1_1.id,
            depth=2,
            sort_order=2
        )
        db.add(grandchild1_1_2)
        db.flush()
        grandchild1_1_2.path = f"{child1_1.path}/{grandchild1_1_2.id}"
        print(f"      ✓ Created (ID: {grandchild1_1_2.id}, depth=2, COMPLETED)")

        # CHILD 1.2: Frontend Development
        print("\n  [Child 1.2] Creating 'Frontend Development'...")
        child1_2 = DBTask(
            title="Frontend Development",
            description="React UI with hierarchical navigation",
            status="todo",
            completed=False,
            project_id=project.id,
            parent_id=root1.id,
            depth=1,
            sort_order=2
        )
        db.add(child1_2)
        db.flush()
        child1_2.path = f"{root1.path}/{child1_2.id}"
        print(f"    ✓ Created (ID: {child1_2.id}, depth=1)")

        # GRANDCHILD 1.2.1: Component Library
        print("\n    [Grandchild 1.2.1] Creating 'Component Library'...")
        grandchild1_2_1 = DBTask(
            title="Build UI Component Library",
            description="Breadcrumb, ProjectSwitcher, CardDeck enhancements",
            status="done",
            completed=True,
            completed_at=datetime.now(timezone.utc),
            project_id=project.id,
            parent_id=child1_2.id,
            depth=2,
            sort_order=1
        )
        db.add(grandchild1_2_1)
        db.flush()
        grandchild1_2_1.path = f"{child1_2.path}/{grandchild1_2_1.id}"
        print(f"      ✓ Created (ID: {grandchild1_2_1.id}, depth=2, COMPLETED)")

        # GRANDCHILD 1.2.2: State Management
        print("\n    [Grandchild 1.2.2] Creating 'State Management'...")
        grandchild1_2_2 = DBTask(
            title="Implement ProjectContext",
            description="Stack-based navigation with push/pop for zoom metaphor",
            status="done",
            completed=True,
            completed_at=datetime.now(timezone.utc),
            project_id=project.id,
            parent_id=child1_2.id,
            depth=2,
            sort_order=2
        )
        db.add(grandchild1_2_2)
        db.flush()
        grandchild1_2_2.path = f"{child1_2.path}/{grandchild1_2_2.id}"
        print(f"      ✓ Created (ID: {grandchild1_2_2.id}, depth=2, COMPLETED)")

        # GRANDCHILD 1.2.3: Navigation Integration
        print("\n    [Grandchild 1.2.3] Creating 'Navigation Integration'...")
        grandchild1_2_3 = DBTask(
            title="Integrate Zoom Navigation",
            description="Connect CardDeck clicks to hierarchy API endpoints",
            status="todo",
            completed=False,
            project_id=project.id,
            parent_id=child1_2.id,
            depth=2,
            sort_order=3
        )
        db.add(grandchild1_2_3)
        db.flush()
        grandchild1_2_3.path = f"{child1_2.path}/{grandchild1_2_3.id}"
        print(f"      ✓ Created (ID: {grandchild1_2_3.id}, depth=2)")

        # ROOT TASK 2: Documentation
        print("\n[Root Task 2] Creating 'Write Documentation'...")
        root2 = DBTask(
            title="Write Documentation",
            description="Comprehensive docs for unified recursive model",
            status="todo",
            completed=False,
            project_id=project.id,
            parent_id=None,
            depth=0,
            sort_order=2
        )
        db.add(root2)
        db.flush()
        root2.path = f"/{root2.id}"
        print(f"  ✓ Created (ID: {root2.id})")

        # CHILD 2.1: API Documentation
        print("\n  [Child 2.1] Creating 'API Documentation'...")
        child2_1 = DBTask(
            title="API Documentation",
            description="Document all Projects and Tasks endpoints",
            status="todo",
            completed=False,
            project_id=project.id,
            parent_id=root2.id,
            depth=1,
            sort_order=1
        )
        db.add(child2_1)
        db.flush()
        child2_1.path = f"{root2.path}/{child2_1.id}"
        print(f"    ✓ Created (ID: {child2_1.id}, depth=1)")

        # ROOT TASK 3: Testing
        print("\n[Root Task 3] Creating 'Comprehensive Testing'...")
        root3 = DBTask(
            title="Comprehensive Testing",
            description="Test all features of hierarchical navigation",
            status="todo",
            completed=False,
            project_id=project.id,
            parent_id=None,
            depth=0,
            sort_order=3
        )
        db.add(root3)
        db.flush()
        root3.path = f"/{root3.id}"
        print(f"  ✓ Created (ID: {root3.id})")

        db.commit()

        print("\n" + "=" * 80)
        print("✓ DEMO DATA CREATED SUCCESSFULLY")
        print("=" * 80)
        print("\nHierarchy Structure:")
        print("📁 Build One Job App (root)")
        print("  📁 Backend Development (depth 1)")
        print("    ✅ Database Schema Design (depth 2, completed)")
        print("    ✅ Implement REST API Endpoints (depth 2, completed)")
        print("  📁 Frontend Development (depth 1)")
        print("    ✅ Build UI Component Library (depth 2, completed)")
        print("    ✅ Implement ProjectContext (depth 2, completed)")
        print("    📄 Integrate Zoom Navigation (depth 2, pending)")
        print("📁 Write Documentation (root)")
        print("  📄 API Documentation (depth 1, pending)")
        print("📄 Comprehensive Testing (root)")

        print("\n" + "=" * 80)
        print("To see this hierarchy in action:")
        print("1. Start backend: cd backend && uvicorn main:app --reload")
        print("2. Start frontend: npm run dev")
        print("3. Click 'Build One Job App' to zoom into its children")
        print("4. Click 'Backend Development' to see grandchildren")
        print("5. Use breadcrumb to navigate back up!")
        print("=" * 80)

    except Exception as e:
        db.rollback()
        print(f"\n✗ ERROR: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()
