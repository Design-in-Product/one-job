"""
Shared pytest fixtures for the One Job API test suites.

Each test gets its own in-memory SQLite database and TestClient, so suites
can run together in any order without sharing state or leaving .db files
on disk.
"""

import os

# Before main is imported (2026-11-15): main builds its engine and runs
# create_all at import, from DATABASE_URL. Forced, not setdefault, so
# neither a developer's environment nor a .env pointing at a real
# database can leak in. See test_isolation.py.
os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app, get_db, Base


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db, None)
        engine.dispose()
