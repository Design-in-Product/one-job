"""Verify migration results"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import settings

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

def verify_migration():
    db = SessionLocal()
    inspector = inspect(engine)

    print("=" * 80)
    print("MIGRATION VERIFICATION")
    print("=" * 80)

    # Check tables
    tables = inspector.get_table_names()
    print("\n[1] Tables in database:")
    for table in sorted(tables):
        print(f"  • {table}")

    # Check projects table
    print("\n[2] Projects table columns:")
    for col in inspector.get_columns('projects'):
        print(f"  • {col['name']}: {col['type']}")

    # Check tasks table columns
    print("\n[3] Tasks table columns (new ones):")
    task_columns = {col['name']: col['type'] for col in inspector.get_columns('tasks')}
    for col_name in ['project_id', 'parent_id', 'depth', 'path']:
        if col_name in task_columns:
            print(f"  ✓ {col_name}: {task_columns[col_name]}")
        else:
            print(f"  ✗ {col_name}: MISSING")

    # Check data
    print("\n[4] Projects data:")
    projects = db.execute(text("SELECT id, name, color FROM projects")).fetchall()
    for proj in projects:
        print(f"  • {proj[1]} (ID: {proj[0]}, Color: {proj[2]})")

    print("\n[5] Tasks data (sample):")
    tasks = db.execute(text("""
        SELECT id, title, project_id, parent_id, depth, path
        FROM tasks
        LIMIT 5
    """)).fetchall()

    for task in tasks:
        parent_info = f"parent={task[3][:8]}..." if task[3] else "root"
        print(f"  • {task[1][:40]}")
        print(f"    ID: {task[0]}")
        print(f"    Project: {task[2]}, {parent_info}, depth={task[4]}")

    print(f"\n[6] Task counts:")
    result = db.execute(text("SELECT COUNT(*) FROM tasks")).scalar()
    print(f"  • Total tasks: {result}")

    result = db.execute(text("SELECT COUNT(*) FROM tasks WHERE parent_id IS NULL")).scalar()
    print(f"  • Root tasks: {result}")

    result = db.execute(text("SELECT COUNT(*) FROM tasks WHERE parent_id IS NOT NULL")).scalar()
    print(f"  • Child tasks: {result}")

    print("\n" + "=" * 80)
    print("✓ VERIFICATION COMPLETE")
    print("=" * 80)

    db.close()

if __name__ == "__main__":
    verify_migration()
