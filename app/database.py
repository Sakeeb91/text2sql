"""Database layer bootstrap utilities."""
from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Default to a local SQLite database stored under data/
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/database.db")

connect_args: dict[str, object] = {}
if DATABASE_URL.startswith("sqlite"):
    # Needed for SQLite when used with FastAPI/SQLAlchemy in multi-threaded contexts.
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Provide a scoped database session generator."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
