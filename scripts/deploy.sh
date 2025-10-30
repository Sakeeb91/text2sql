#!/bin/bash
# Deployment helper script

set -e

echo "🚀 Text-to-SQL Deployment Helper"
echo ""

# Parse platform argument
PLATFORM="${1:-render}"

case $PLATFORM in
    render)
        echo "📦 Deploying to Render..."
        echo ""
        echo "Steps:"
        echo "  1. Push your code: git push origin main"
        echo "  2. Render will auto-deploy from .deploy/render.yaml"
        echo "  3. Monitor at: https://dashboard.render.com"
        echo ""
        echo "First time setup:"
        echo "  1. Go to https://render.com"
        echo "  2. New + → Web Service"
        echo "  3. Connect GitHub repo"
        echo "  4. Set OPENAI_API_KEY environment variable"
        echo "  5. Deploy!"
        ;;
    railway)
        echo "🚂 Deploying to Railway..."
        echo ""
        echo "Steps:"
        echo "  1. Push your code: git push origin main"
        echo "  2. Railway will auto-deploy from .deploy/railway.json"
        echo "  3. Monitor at: https://railway.app/dashboard"
        echo ""
        echo "First time setup:"
        echo "  1. Go to https://railway.app"
        echo "  2. New Project → Deploy from GitHub"
        echo "  3. Select your repo"
        echo "  4. Set OPENAI_API_KEY variable"
        echo "  5. Generate domain"
        ;;
    streamlit)
        echo "🎨 Deploying Frontend to Streamlit Cloud..."
        echo ""
        echo "Steps:"
        echo "  1. Push your code: git push origin main"
        echo "  2. Go to https://streamlit.io/cloud"
        echo "  3. New app → Select streamlit_app/streamlit_app.py"
        echo "  4. Set API_URL environment variable"
        echo "  5. Deploy!"
        ;;
    docker)
        echo "🐳 Building and running with Docker..."
        echo ""
        docker-compose up --build
        ;;
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo ""
        echo "Usage: $0 [render|railway|streamlit|docker]"
        echo ""
        echo "Platforms:"
        echo "  render     - Deploy backend to Render"
        echo "  railway    - Deploy backend to Railway"
        echo "  streamlit  - Deploy frontend to Streamlit Cloud"
        echo "  docker     - Run locally with Docker"
        exit 1
        ;;
esac
