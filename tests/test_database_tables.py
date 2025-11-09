"""Unit tests for table diagnostics utilities."""

from __future__ import annotations

from app import database


def test_get_table_row_counts_returns_expected_shape() -> None:
    """Row counts helper should return name and row_count for each table."""
    # Ensure database is initialised
    database.init_db()
    rows = database.get_table_row_counts()
    assert isinstance(rows, list)
    assert any(row["name"] == "customers" for row in rows)
    assert any(row["name"] == "orders" for row in rows)
    for row in rows:
        assert "name" in row and "row_count" in row
        assert isinstance(row["row_count"], int)
        assert row["row_count"] >= 0
