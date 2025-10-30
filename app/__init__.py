"""Application package initialization."""

from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from the project root .env if it exists.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=False)
