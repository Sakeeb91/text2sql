"""Test package initialization."""

from __future__ import annotations

import os
import warnings
from pathlib import Path

warnings.simplefilter("ignore", ResourceWarning)

TEST_DB_PATH = Path("data/test_database.db")
if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()

os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH.resolve().as_posix()}")
os.environ.setdefault("OPENAI_API_KEY", "test-key")
os.environ.setdefault("OPENAI_MODEL", "gpt-4o-mini")
os.environ.setdefault("OPENAI_TEMPERATURE", "0.1")
