#!/bin/bash
# Run tests with various options

set -e

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
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--no-cov] [-v|--verbose] [--test TEST_PATH]"
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
eval $CMD

# Show summary
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo ""
    echo "❌ Some tests failed"
    exit 1
fi
