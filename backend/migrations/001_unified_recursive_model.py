"""
Migration: Unified Recursive Model with Projects

This migration transforms the current 3-table structure (tasks, substacks, substack_tasks)
into a unified recursive model with projects as top-level containers.

Schema Changes:
1. Create projects table
2. Add parent_id, project_id, depth, path to tasks table
3. Migrate substacks → child tasks with parent_id
4. Drop old substacks and substack_tasks tables

Author: Claude Code
Date: 2025-11-15
"""

from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Integer, text, ForeignKey, inspect
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
import sqlalchemy.types as types
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from datetime import datetime, timezone
import uuid
import os
from typing import Optional

# Import the custom UUID type from main.py
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import UUID, settings

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

def check_column_exists(table_name: str, column_name: str, inspector) -> bool:
    """Check if a column exists in a table"""
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def check_table_exists(table_name: str, inspector) -> bool:
    """Check if a table exists"""
    return table_name in inspector.get_table_names()

def migrate_up():
    """Apply migration: Add projects and unified recursive structure"""

    db = SessionLocal()
    inspector = inspect(engine)

    try:
        print("=" * 80)
        print("MIGRATION: Unified Recursive Model")
        print("=" * 80)

        # Step 1: Create projects table
        print("\n[1/7] Creating projects table...")
        if not check_table_exists('projects', inspector):
            db.execute(text("""
                CREATE TABLE projects (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    color VARCHAR(7),
                    icon VARCHAR(50),
                    integration_type VARCHAR(50),
                    integration_config TEXT,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP,
                    archived BOOLEAN DEFAULT 0
                )
            """))
            print("✓ Projects table created")
        else:
            print("⊙ Projects table already exists")

        # Step 2: Insert default project
        print("\n[2/7] Creating default project...")
        default_project_id = '00000000-0000-0000-0000-000000000001'
        existing_project = db.execute(
            text("SELECT id FROM projects WHERE id = :id"),
            {"id": default_project_id}
        ).fetchone()

        if not existing_project:
            db.execute(text("""
                INSERT INTO projects (id, name, description, color, created_at, updated_at, archived)
                VALUES (:id, :name, :description, :color, :created_at, :updated_at, :archived)
            """), {
                "id": default_project_id,
                "name": "My Tasks",
                "description": "Default project",
                "color": "#f35343",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "archived": False
            })
            print(f"✓ Default project created with ID: {default_project_id}")
        else:
            print("⊙ Default project already exists")

        # Step 3: Add new columns to tasks table
        print("\n[3/7] Adding new columns to tasks table...")
        columns_to_add = [
            ("project_id", "VARCHAR(36)"),
            ("parent_id", "VARCHAR(36)"),
            ("depth", "INTEGER DEFAULT 0"),
            ("path", "TEXT")
        ]

        for col_name, col_type in columns_to_add:
            if not check_column_exists('tasks', col_name, inspector):
                db.execute(text(f"ALTER TABLE tasks ADD COLUMN {col_name} {col_type}"))
                print(f"  ✓ Added column: {col_name}")
            else:
                print(f"  ⊙ Column already exists: {col_name}")

        # Refresh inspector after adding columns
        inspector = inspect(engine)

        # Step 4: Assign all existing tasks to default project
        print("\n[4/7] Assigning existing tasks to default project...")
        result = db.execute(text("""
            UPDATE tasks
            SET project_id = :project_id,
                parent_id = NULL,
                depth = 0,
                path = '/' || id
            WHERE project_id IS NULL
        """), {"project_id": default_project_id})
        print(f"✓ Updated {result.rowcount} tasks with default project")

        # Step 5: Migrate substacks to child tasks
        print("\n[5/7] Migrating substacks to child tasks...")

        if check_table_exists('substacks', inspector) and check_table_exists('substack_tasks', inspector):
            # Get all substack tasks with their parent information
            substack_data = db.execute(text("""
                SELECT
                    st.id,
                    st.title,
                    st.description,
                    st.completed,
                    st.created_at,
                    st.completed_at,
                    st.sort_order,
                    s.parent_task_id,
                    t.project_id
                FROM substack_tasks st
                JOIN substacks s ON st.substack_id = s.id
                JOIN tasks t ON s.parent_task_id = t.id
            """)).fetchall()

            migrated_count = 0
            for row in substack_data:
                # Check if this substack task already exists in tasks table
                existing = db.execute(
                    text("SELECT id FROM tasks WHERE id = :id"),
                    {"id": str(row[0])}
                ).fetchone()

                if not existing:
                    # Insert substack task as a child task
                    db.execute(text("""
                        INSERT INTO tasks (
                            id, title, description, completed, status,
                            created_at, completed_at, sort_order,
                            parent_id, project_id, depth, path,
                            deferred_at, deferral_count, external_id, source
                        ) VALUES (
                            :id, :title, :description, :completed, :status,
                            :created_at, :completed_at, :sort_order,
                            :parent_id, :project_id, :depth, :path,
                            NULL, 0, NULL, NULL
                        )
                    """), {
                        "id": str(row[0]),
                        "title": row[1],
                        "description": row[2],
                        "completed": row[3],
                        "status": "done" if row[3] else "todo",
                        "created_at": row[4],
                        "completed_at": row[5],
                        "sort_order": row[6],
                        "parent_id": str(row[7]),
                        "project_id": str(row[8]),
                        "depth": 1,
                        "path": f"/{row[7]}/{row[0]}"
                    })
                    migrated_count += 1

            print(f"✓ Migrated {migrated_count} substack tasks to child tasks")
        else:
            print("⊙ Substacks tables don't exist - skipping migration")

        # Step 6: Make project_id NOT NULL
        print("\n[6/7] Setting project_id constraint...")
        # Note: SQLite doesn't support ALTER COLUMN, so we skip this for SQLite
        if not settings.DATABASE_URL.startswith("sqlite"):
            db.execute(text("ALTER TABLE tasks ALTER COLUMN project_id SET NOT NULL"))
            print("✓ Set project_id to NOT NULL")
        else:
            print("⊙ Skipping NOT NULL constraint (SQLite limitation)")

        # Step 7: Drop old tables (commented out for safety - uncomment when ready)
        print("\n[7/7] Cleaning up old tables...")
        print("⚠ Keeping old tables for safety. To drop them, uncomment the DROP TABLE commands.")
        # Uncomment these lines when you're confident the migration worked:
        # if check_table_exists('substack_tasks', inspector):
        #     db.execute(text("DROP TABLE substack_tasks"))
        #     print("✓ Dropped substack_tasks table")
        # if check_table_exists('substacks', inspector):
        #     db.execute(text("DROP TABLE substacks"))
        #     print("✓ Dropped substacks table")

        db.commit()
        print("\n" + "=" * 80)
        print("✓ MIGRATION COMPLETE")
        print("=" * 80)

    except Exception as e:
        db.rollback()
        print(f"\n✗ MIGRATION FAILED: {e}")
        raise
    finally:
        db.close()


def migrate_down():
    """Rollback migration: Restore original 3-table structure"""

    db = SessionLocal()
    inspector = inspect(engine)

    try:
        print("=" * 80)
        print("ROLLBACK: Unified Recursive Model")
        print("=" * 80)

        # Step 1: Recreate substacks table
        print("\n[1/4] Recreating substacks table...")
        if not check_table_exists('substacks', inspector):
            db.execute(text("""
                CREATE TABLE substacks (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    parent_task_id VARCHAR(36) NOT NULL,
                    created_at TIMESTAMP,
                    FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
                )
            """))
            print("✓ Substacks table created")

        # Step 2: Recreate substack_tasks table
        print("\n[2/4] Recreating substack_tasks table...")
        if not check_table_exists('substack_tasks', inspector):
            db.execute(text("""
                CREATE TABLE substack_tasks (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    completed BOOLEAN DEFAULT 0,
                    substack_id VARCHAR(36) NOT NULL,
                    created_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    sort_order INTEGER DEFAULT 0,
                    FOREIGN KEY (substack_id) REFERENCES substacks(id)
                )
            """))
            print("✓ Substack_tasks table created")

        # Step 3: Migrate child tasks back to substacks
        print("\n[3/4] Migrating child tasks back to substacks...")
        # This is complex and requires creating substacks from parent relationships
        # For now, we'll just warn the user
        print("⚠ WARNING: Rollback of child tasks to substacks not fully implemented")
        print("  You may need to manually restore from backup")

        # Step 4: Remove added columns from tasks
        print("\n[4/4] Removing added columns from tasks...")
        # Note: SQLite doesn't support DROP COLUMN easily
        if not settings.DATABASE_URL.startswith("sqlite"):
            for col in ['parent_id', 'project_id', 'depth', 'path']:
                if check_column_exists('tasks', col, inspector):
                    db.execute(text(f"ALTER TABLE tasks DROP COLUMN {col}"))
                    print(f"  ✓ Removed column: {col}")
        else:
            print("⊙ Skipping column removal (SQLite limitation)")

        # Drop projects table
        if check_table_exists('projects', inspector):
            db.execute(text("DROP TABLE projects"))
            print("✓ Dropped projects table")

        db.commit()
        print("\n" + "=" * 80)
        print("✓ ROLLBACK COMPLETE")
        print("=" * 80)

    except Exception as e:
        db.rollback()
        print(f"\n✗ ROLLBACK FAILED: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python 001_unified_recursive_model.py [up|down]")
        sys.exit(1)

    command = sys.argv[1]

    if command == "up":
        migrate_up()
    elif command == "down":
        migrate_down()
    else:
        print(f"Unknown command: {command}")
        print("Usage: python 001_unified_recursive_model.py [up|down]")
        sys.exit(1)
