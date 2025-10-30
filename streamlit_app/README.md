# Text-to-SQL Streamlit Frontend

A beautiful, interactive web interface for the Text-to-SQL API.

## Features

- 🔍 Natural language to SQL query conversion
- 📊 Interactive results display
- 📥 Export results to CSV
- ⚙️ Configurable API endpoint
- ✅ API health monitoring
- 💡 Example questions to get started

## Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set your API URL** (optional):
   ```bash
   export API_URL=http://localhost:8000
   ```

3. **Run the app:**
   ```bash
   streamlit run streamlit_app.py
   ```

4. **Open your browser:**
   - App: http://localhost:8501

## Deploy to Streamlit Cloud

### Prerequisites

- GitHub account
- Your FastAPI backend deployed (see main README.md)

### Steps

1. **Push this `streamlit_app` folder to GitHub** (can be in the same repo or separate)

2. **Go to [Streamlit Cloud](https://streamlit.io/cloud)**

3. **Click "New app"**

4. **Configure:**
   - Repository: `your-username/text2sql`
   - Branch: `main`
   - Main file path: `streamlit_app/streamlit_app.py`

5. **Advanced settings** → **Environment variables:**
   ```
   API_URL=https://your-fastapi-backend.onrender.com
   ```

6. **Click "Deploy"**

7. **Your app will be live at:**
   ```
   https://your-app-name.streamlit.app
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_URL` | URL of your FastAPI backend | `http://localhost:8000` | Yes |

## Configuration

You can customize the app appearance by editing `.streamlit/config.toml`:

```toml
[theme]
primaryColor = "#4CAF50"  # Change to your brand color
backgroundColor = "#FFFFFF"
```

## Usage

1. Enter your question in natural language
2. Click "Generate SQL & Execute"
3. View the generated SQL query and results
4. Download results as CSV if needed

### Example Questions

- "How many customers do we have?"
- "What is the total revenue?"
- "Show me the top 5 customers by order count"
- "List all customers from New York"
- "What are the most popular products?"

## Troubleshooting

### "API is unreachable" error

**Cause:** The Streamlit app cannot connect to your FastAPI backend.

**Solutions:**
1. Check that `API_URL` is set correctly in Streamlit Cloud settings
2. Verify your FastAPI backend is running and accessible
3. Ensure CORS is enabled on your FastAPI backend (add to `app/main.py`):
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # In production, specify your Streamlit app URL
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Slow response times

**Cause:** OpenAI API calls take time.

**Solutions:**
- The app shows a spinner during processing
- Consider caching common queries (add to backend)
- Use faster OpenAI models if needed

## Support

For issues related to:
- **Backend API:** See main repository README
- **Streamlit app:** Open an issue in this repository

## License

MIT License - See main repository for details
