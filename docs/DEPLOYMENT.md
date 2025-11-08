# Deployment Guide

This guide covers deploying the Text-to-SQL application with a FastAPI backend and Streamlit frontend.

## Architecture Overview

```
┌─────────────────┐      HTTP Requests      ┌──────────────────┐
│   Streamlit     │ ───────────────────────> │   FastAPI        │
│   Frontend      │                          │   Backend        │
│  (UI Layer)     │ <─────────────────────── │  (API Layer)     │
└─────────────────┘      JSON Responses      └──────────────────┘
        │                                              │
        │                                              │
        v                                              v
  Streamlit Cloud                              Render/Railway/Fly.io
  (Free hosting)                               (Free tier available)
                                                       │
                                                       v
                                                 SQLite Database
                                                 OpenAI API
```

## Part 1: Deploy FastAPI Backend

You have three options for deploying the FastAPI backend:

### Option A: Render (Recommended for Beginners)

**Why Render?**
- Free tier with persistent storage
- Easy setup with `.deploy/render.yaml`
- Automatic deployments from Git

**Steps:**

1. **Create a Render account:** https://render.com

2. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `.deploy/render.yaml`

3. **Set environment variables:**
   - Go to "Environment" tab
   - Add `OPENAI_API_KEY` with your key

4. **Deploy:**
   - Render will automatically deploy
   - Your API will be at: `https://your-app-name.onrender.com`

5. **Test your API:**
   ```bash
   curl https://your-app-name.onrender.com/health
   ```

**Important Notes:**
- Free tier spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Database persists on a 1GB disk

---

### Option B: Railway

**Why Railway?**
- Very fast deployments
- Generous free tier ($5/month credits)
- Great developer experience

**Steps:**

1. **Create a Railway account:** https://railway.app

2. **Create a new project:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Railway auto-detects the config** from `.deploy/railway.json`

4. **Set environment variables:**
   - Go to "Variables" tab
   - Add `OPENAI_API_KEY`
   - Railway auto-generates `PORT`

5. **Generate domain:**
   - Go to "Settings" → "Generate Domain"
   - Your API will be at: `https://your-app.railway.app`

6. **Test:**
   ```bash
   curl https://your-app.railway.app/health
   ```

---

### Option C: Fly.io

**Why Fly.io?**
- Best for global deployments
- Runs on edge locations
- Free tier includes 3 VMs

**Steps:**

1. **Install Fly CLI:**
   ```bash
   # macOS
   brew install flyctl

   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Initialize:**
   ```bash
   fly launch
   ```

4. **Set secrets:**
   ```bash
   fly secrets set OPENAI_API_KEY=your_key_here
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

6. **Your API will be at:** `https://your-app.fly.dev`

---

## Part 2: Add CORS to FastAPI Backend

Before deploying the Streamlit frontend, you need to enable CORS on your FastAPI backend so it can accept requests from the Streamlit app.

**Edit `app/main.py`:**

```python
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware  # Add this import

app = FastAPI(
    title="Text-to-SQL API",
    description="Convert natural language questions into SQL queries.",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8501",  # Local Streamlit development
        "https://*.streamlit.app",  # Streamlit Cloud (wildcard)
        # Add your specific Streamlit app URL here after deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rest of your code...
```

**Commit and push this change** before deploying Streamlit.

---

## Part 3: Deploy Streamlit Frontend

### Deploy to Streamlit Cloud (Free)

1. **Push your code to GitHub** (if not already)
   ```bash
   git add streamlit_app/
   git commit -m "Add Streamlit frontend"
   git push
   ```

2. **Go to [Streamlit Cloud](https://streamlit.io/cloud)**

3. **Sign in with GitHub**

4. **Click "New app"**

5. **Configure the deployment:**
   - **Repository:** `your-username/text2sql`
   - **Branch:** `main`
   - **Main file path:** `streamlit_app/streamlit_app.py`

6. **Advanced settings → Environment variables:**
   ```
   API_URL=https://your-fastapi-backend.onrender.com
   ```
   *(Replace with your actual backend URL from Part 1)*

7. **Click "Deploy"**

8. **Wait for deployment** (~2-3 minutes)

9. **Your app will be live at:**
   ```
   https://your-app-name.streamlit.app
   ```

---

## Part 4: Testing the Full Stack

1. **Test the backend directly:**
   ```bash
   curl -X POST "https://your-backend.onrender.com/query" \
     -H "Content-Type: application/json" \
     -d '{"question": "How many customers do we have?"}'
   ```

2. **Test the Streamlit app:**
   - Visit `https://your-app.streamlit.app`
   - Check the sidebar: "API Status" should show "✅ API is healthy"
   - Try an example question

3. **If API status shows red:**
   - Check your `API_URL` environment variable in Streamlit Cloud
   - Verify CORS is configured on the backend
   - Check backend logs on Render/Railway

---

## Cost Breakdown

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Render** | 750 hours/month | Spins down after 15 min inactivity, 1GB storage |
| **Railway** | $5/month credits | No spin-down, usage-based billing |
| **Fly.io** | 3 shared VMs | 160GB data transfer/month |
| **Streamlit Cloud** | Unlimited apps | Community tier, 1GB RAM per app |
| **OpenAI API** | Pay-as-you-go | GPT-4o-mini: ~$0.15 per 1M input tokens |

**Monthly Cost Estimate (Low Usage):**
- Backend: $0 (free tier)
- Frontend: $0 (Streamlit free)
- OpenAI API: $1-5 (depends on usage)

**Total:** ~$1-5/month for light usage

---

## Monitoring and Maintenance

### Backend Monitoring

**Render:**
- Dashboard: https://dashboard.render.com
- View logs: Click on service → "Logs" tab
- Metrics: CPU, Memory, Requests

**Railway:**
- Dashboard: https://railway.app/dashboard
- View logs: Click project → "Deployments" → "View Logs"
- Metrics: Memory, Network, Build times

**Fly.io:**
```bash
fly logs
fly status
```

### Frontend Monitoring

**Streamlit Cloud:**
- Dashboard: https://streamlit.io/cloud
- View logs: Click app → "Manage app" → "Logs"
- Reboot app: "Reboot app" button

### Health Checks

Set up automated monitoring with [UptimeRobot](https://uptimerobot.com/) (free):

1. Create account
2. Add monitors for:
   - Backend health: `https://your-backend.onrender.com/health`
   - Frontend: `https://your-app.streamlit.app`
3. Get email alerts if services go down

---

## Updating Your Deployment

### Update Backend

**Render/Railway (Auto-deploy enabled):**
```bash
git add .
git commit -m "Update backend"
git push
```
*(Automatically deploys)*

**Fly.io:**
```bash
git add .
git commit -m "Update backend"
git push
fly deploy
```

### Update Frontend

**Streamlit Cloud (Auto-deploy):**
```bash
git add streamlit_app/
git commit -m "Update frontend"
git push
```
*(Automatically deploys in ~2 minutes)*

---

## Troubleshooting

### Backend Issues

**Problem:** Database not persisting
- **Render:** Check that disk is mounted at `/opt/render/project/src/data`
- **Railway:** Add a volume in settings
- **Fly.io:** Configure persistent volumes

**Problem:** 502 Bad Gateway
- Check logs for errors
- Verify `PORT` environment variable is used
- Ensure app starts successfully

**Problem:** OpenAI API errors
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI account has credits
- Review rate limits

### Frontend Issues

**Problem:** "API is unreachable"
- Check `API_URL` environment variable
- Verify CORS is enabled on backend
- Test backend URL directly in browser

**Problem:** Slow loading
- Free tier backend spins down (first request takes 30s)
- Consider upgrading to paid tier for always-on
- Add caching to backend

**Problem:** App crashes
- Check Streamlit Cloud logs
- Verify `requirements.txt` has all dependencies
- Ensure `streamlit_app.py` has no syntax errors

---

## Security Checklist

Before going to production:

- [ ] OPENAI_API_KEY is stored as environment variable (not in code)
- [ ] CORS origins are restricted (not `allow_origins=["*"]`)
- [ ] API has rate limiting (consider adding to FastAPI)
- [ ] SQLite is not exposed publicly (it's internal to backend)
- [ ] HTTPS is enabled (automatic on Render/Railway/Fly.io/Streamlit)
- [ ] Error messages don't leak sensitive info
- [ ] Add authentication if needed (OAuth, API keys, etc.)

---

## Next Steps

1. **Custom Domain** (optional):
   - Render: Settings → Custom Domain
   - Streamlit: Not available on free tier

2. **Analytics** (optional):
   - Add Google Analytics to Streamlit app
   - Track API usage with middleware

3. **Scaling:**
   - Upgrade to paid tiers when needed
   - Consider PostgreSQL for production database
   - Add caching layer (Redis) for frequently asked questions

4. **CI/CD:**
   - Your GitHub Actions already test the backend
   - Add Streamlit tests if needed

---

## Support

- **Backend issues:** Check GitHub Actions logs, backend service logs
- **Frontend issues:** Check Streamlit Cloud logs
- **API issues:** Review FastAPI docs at `/docs` endpoint

Good luck with your deployment! 🚀
