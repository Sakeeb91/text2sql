"""Shared pytest fixtures for the test suite."""
from __future__ import annotations

import importlib
from pathlib import Path
from typing import Iterator

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def app_module() -> Iterator[object]:
    """Provide a reloaded FastAPI app configured for the test database."""
    import app.database

    app.database = importlib.reload(app.database)
    app.database.init_db()

    import app.main

    app.main = importlib.reload(app.main)

    yield app.main


@pytest.fixture()
def client(app_module: object) -> Iterator[TestClient]:
    """Yield a TestClient wired to the FastAPI application."""
    with TestClient(app_module.app) as test_client:
        yield test_client
    from app import database as database_module

    database_module.engine.dispose()


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_database() -> Iterator[None]:
    """Remove the test database file after the suite completes."""
    yield
    import app.database as database

    database.engine.dispose()

    db_path = Path(database.DATABASE_FILE)
    if db_path.exists():
        try:
            db_path.unlink()
        except PermissionError:
            pass
