"""Database layer utilities with deterministic sample data."""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Any, Generator, Iterable

from dotenv import load_dotenv
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    create_engine,
    func,
    inspect,
    select,
    text,
)
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

DATA_DIR = Path("data")
DEFAULT_DATABASE_FILE = DATA_DIR / "database.db"

# Ensure environment variables from .env are available when scripts import this module directly.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=False)

# Default to a local SQLite database stored under data/
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DATABASE_FILE.resolve().as_posix()}")
DATABASE_FILE = DEFAULT_DATABASE_FILE
if DATABASE_URL.startswith("sqlite:///"):
    DATABASE_FILE = Path(DATABASE_URL.replace("sqlite:///", ""))

connect_args: dict[str, object] = {}
if DATABASE_URL.startswith("sqlite"):
    # Needed for SQLite when used with FastAPI/SQLAlchemy in multi-threaded contexts.
    connect_args["check_same_thread"] = False

engine_kwargs: dict[str, Any] = {}
if connect_args:
    engine_kwargs["connect_args"] = connect_args
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["poolclass"] = NullPool

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

metadata = MetaData()

customers_table = Table(
    "customers",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String, nullable=False),
    Column("email", String, nullable=False, unique=True),
    Column("city", String, nullable=True),
    Column("created_at", DateTime, server_default=text("CURRENT_TIMESTAMP")),
)

orders_table = Table(
    "orders",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("customer_id", Integer, ForeignKey("customers.id"), nullable=False),
    Column("product_name", String, nullable=False),
    Column("quantity", Integer, nullable=False),
    Column("total_amount", Numeric(10, 2), nullable=False),
    Column("order_date", DateTime, server_default=text("CURRENT_TIMESTAMP")),
)


class DatabaseExecutionError(RuntimeError):
    """Raised when executing a SQL statement fails."""


def get_db() -> Generator[Session, None, None]:
    """Provide a scoped database session generator."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create the database schema and seed sample data if needed."""
    _ensure_data_directory(DATABASE_FILE.parent)
    metadata.create_all(engine)
    _seed_sample_data(engine)


def execute_query(sql: str) -> list[dict[str, Any]]:
    """Execute a SQL statement and return any rows as dictionaries."""
    statement = sql.strip()
    if not statement:
        raise ValueError("SQL query must not be empty.")

    try:
        with engine.connect() as connection:
            result = connection.execute(text(statement))
            if not result.returns_rows:
                return []
            return [dict(row) for row in result.mappings().all()]
    except SQLAlchemyError as exc:  # pragma: no cover - defensive catch
        raise DatabaseExecutionError("Failed to execute SQL query.") from exc


def get_database_schema() -> str:
    """Inspect database tables and return a readable schema summary."""
    inspector = inspect(engine)
    table_names = sorted(inspector.get_table_names())
    if not table_names:
        return ""

    lines: list[str] = []
    for table_name in table_names:
        columns = inspector.get_columns(table_name)
        formatted_columns = ", ".join(f"{column['name']} ({column['type']})" for column in columns)
        lines.append(f"Table: {table_name}")
        lines.append(f"Columns: {formatted_columns}")
        lines.append("")

    return "\n".join(lines).strip()


def _ensure_data_directory(path: Path) -> None:
    """Make sure the database directory exists before any file operations."""
    path.mkdir(parents=True, exist_ok=True)


def _seed_sample_data(db_engine: Engine) -> None:
    """Populate the database with deterministic sample data when both tables are empty."""
    customer_rows = list(_build_customers_seed())
    order_rows = list(_build_orders_seed())

    with db_engine.begin() as connection:
        customer_count = connection.execute(select(func.count()).select_from(customers_table)).scalar_one()
        order_count = connection.execute(select(func.count()).select_from(orders_table)).scalar_one()
        if customer_count or order_count:
            return

        connection.execute(customers_table.insert(), customer_rows)
        connection.execute(orders_table.insert(), order_rows)


def _build_customers_seed() -> Iterable[dict[str, Any]]:
    """Return a reproducible set of customer records."""
    cities = [
        "New York",
        "San Francisco",
        "Chicago",
        "Austin",
        "Seattle",
        "Boston",
        "Denver",
        "Miami",
        "Portland",
        "Los Angeles",
        "Atlanta",
        "Phoenix",
        "Dallas",
        "Washington",
    ]
    base_date = datetime(2024, 1, 1)
    names = [
        ("Alice Johnson", "alice.johnson@example.com"),
        ("Brian Smith", "brian.smith@example.com"),
        ("Carla Gomez", "carla.gomez@example.com"),
        ("Derrick Lee", "derrick.lee@example.com"),
        ("Emily Davis", "emily.davis@example.com"),
        ("Farah Khan", "farah.khan@example.com"),
        ("George Chen", "george.chen@example.com"),
        ("Hannah Patel", "hannah.patel@example.com"),
        ("Ian Wright", "ian.wright@example.com"),
        ("Jasmine Ortiz", "jasmine.ortiz@example.com"),
        ("Kyle Baker", "kyle.baker@example.com"),
        ("Lena Fischer", "lena.fischer@example.com"),
        ("Martin Silva", "martin.silva@example.com"),
        ("Nina Rossi", "nina.rossi@example.com"),
    ]

    for idx, ((name, email), city) in enumerate(zip(names, cities), start=1):
        yield {
            "id": idx,
            "name": name,
            "email": email,
            "city": city,
            "created_at": base_date + timedelta(days=idx),
        }


def _build_orders_seed() -> Iterable[dict[str, Any]]:
    """Return a reproducible set of order records spanning customers."""
    base_date = datetime(2024, 2, 1)
    products = [
        ("Analytics Suite", Decimal("299.99")),
        ("Reporting Dashboard", Decimal("149.00")),
        ("Customer Insights", Decimal("199.50")),
        ("Sales Forecasting", Decimal("249.75")),
        ("Inventory Tracker", Decimal("89.99")),
        ("Expense Monitor", Decimal("129.00")),
        ("Marketing Toolkit", Decimal("179.49")),
        ("Operations Console", Decimal("159.99")),
    ]

    order_specs = [
        (1, 1, 2),
        (2, 2, 1),
        (3, 3, 3),
        (4, 4, 1),
        (5, 5, 2),
        (6, 6, 1),
        (7, 7, 2),
        (8, 8, 1),
        (9, 9, 4),
        (10, 10, 2),
        (11, 11, 1),
        (12, 12, 3),
        (13, 1, 1),
        (14, 2, 2),
        (15, 3, 1),
        (16, 4, 2),
        (17, 5, 3),
        (18, 6, 1),
        (19, 7, 1),
        (20, 8, 2),
        (21, 9, 1),
        (22, 10, 2),
        (23, 11, 2),
        (24, 12, 1),
    ]

    for order_id, customer_id, product_idx in order_specs:
        product_name, base_price = products[product_idx % len(products)]
        quantity = (order_id % 3) + 1
        order_date = base_date + timedelta(days=order_id)
        yield {
            "id": order_id,
            "customer_id": customer_id,
            "product_name": product_name,
            "quantity": quantity,
            "total_amount": base_price * quantity,
            "order_date": order_date,
        }
