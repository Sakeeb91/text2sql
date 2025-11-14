#!/bin/bash
# Run tests with various options

set -Eeuo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running Text-to-SQL Tests${NC}"
echo ""

# Parse arguments
COVERAGE=true
VERBOSE=false
SPECIFIC_TEST=""
RUN_TS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cov)
            COVERAGE=false
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --test)
            SPECIFIC_TEST="$2"
            shift 2
            ;;
        --ts)
            RUN_TS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--no-cov] [-v|--verbose] [--test TEST_PATH] [--ts]"
            exit 1
            ;;
    esac
done

# Build pytest command
CMD="pytest"

if [ "$SPECIFIC_TEST" != "" ]; then
    CMD="$CMD $SPECIFIC_TEST"
fi

if [ "$VERBOSE" = true ]; then
    CMD="$CMD -v"
fi

if [ "$COVERAGE" = true ]; then
    CMD="$CMD --cov=app --cov-report=term-missing"
fi

# Run tests
echo "Running: $CMD"
echo ""
eval "$CMD"

if [ "$RUN_TS" = true ]; then
    echo ""
    echo "Running: pnpm ts:test"
    echo ""
    pnpm ts:test
fi

# Show summary
echo ""
echo -e "${GREEN}✅ Test run completed${NC}"
