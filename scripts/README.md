# Utility Scripts

Helper scripts for common development and deployment tasks.

## Available Scripts

### 🚀 setup.sh

Sets up the development environment.

```bash
./scripts/setup.sh
```

**What it does:**
- Creates Python virtual environment
- Installs backend dependencies
- Installs dev dependencies
- Installs frontend dependencies (if streamlit_app exists)
- Creates `.env` from `.env.example`
- Creates `data/` directory

**When to use:** First time setup or after cloning the repository.

---

### 🧪 run_tests.sh

Runs the test suite with various options.

```bash
# Run all tests with coverage
./scripts/run_tests.sh

# Run without coverage
./scripts/run_tests.sh --no-cov

# Run specific test file
./scripts/run_tests.sh --test tests/test_api.py

# Verbose output
./scripts/run_tests.sh -v
```

**Options:**
- `--no-cov` - Skip coverage reporting
- `-v, --verbose` - Verbose test output
- `--test <path>` - Run specific test file

**When to use:** Before committing changes, during development.

---

### 🚢 deploy.sh

Deployment helper for various platforms.

```bash
# Deploy backend to Render
./scripts/deploy.sh render

# Deploy backend to Railway
./scripts/deploy.sh railway

# Deploy frontend to Streamlit Cloud
./scripts/deploy.sh streamlit

# Run with Docker locally
./scripts/deploy.sh docker
```

**Platforms:**
- `render` - Deploy to Render (uses `.deploy/render.yaml`)
- `railway` - Deploy to Railway (uses `.deploy/railway.json`)
- `streamlit` - Deploy frontend to Streamlit Cloud
- `docker` - Build and run with Docker Compose

**When to use:** When deploying to production or running locally with Docker.

---

## Adding New Scripts

When adding new utility scripts:

1. Create the script in this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add documentation to this README
4. Follow the existing script structure:
   - Start with `#!/bin/bash`
   - Use `set -e` for error handling
   - Add descriptive echo statements
   - Include usage instructions

## Examples

### Quick Development Setup

```bash
# Clone and setup
git clone https://github.com/Sakeeb91/text2sql.git
cd text2sql
./scripts/setup.sh

# Activate venv and run
source venv/bin/activate
uvicorn app.main:app --reload
```

### Testing Workflow

```bash
# Run tests before commit
./scripts/run_tests.sh

# Check specific module
./scripts/run_tests.sh --test tests/test_database.py -v
```

### Deployment Workflow

```bash
# Check everything works with Docker
./scripts/deploy.sh docker

# Deploy to production
git push origin main
./scripts/deploy.sh render  # Follow the prompts
```
