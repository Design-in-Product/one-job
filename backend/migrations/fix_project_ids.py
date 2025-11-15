"""Fix project_id assignments"""

from sqlalchemy import create_engine, text
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

def fix_project_ids():
    db = SessionLocal()

    try:
        default_project_id = '00000000-0000-0000-0000-000000000001'

        # Update tasks that have NULL project_id
        result = db.execute(text("""
            UPDATE tasks
            SET project_id = :project_id,
                parent_id = NULL,
                depth = 0,
                path = '/' || id
            WHERE project_id IS NULL
        """), {"project_id": default_project_id})

        db.commit()
        print(f"✓ Updated {result.rowcount} tasks with default project")

        # Verify
        count = db.execute(text("SELECT COUNT(*) FROM tasks WHERE project_id IS NOT NULL")).scalar()
        print(f"✓ Tasks with project_id: {count}")

    except Exception as e:
        db.rollback()
        print(f"✗ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_project_ids()
