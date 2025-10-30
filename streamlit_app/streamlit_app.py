"""Streamlit frontend for Text-to-SQL API."""

import os
from typing import Any, Dict, Optional

import requests
import streamlit as st
from requests.exceptions import RequestException

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")

# Page configuration
st.set_page_config(
    page_title="Text-to-SQL Query Tool",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS
st.markdown(
    """
    <style>
    .main {
        padding: 2rem;
    }
    .stButton>button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
        font-weight: bold;
        border-radius: 8px;
        padding: 0.5rem 1rem;
    }
    .stButton>button:hover {
        background-color: #45a049;
    }
    .success-box {
        padding: 1rem;
        border-radius: 8px;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }
    .error-box {
        padding: 1rem;
        border-radius: 8px;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


def query_api(question: str) -> Optional[Dict[str, Any]]:
    """Send a question to the Text-to-SQL API."""
    try:
        response = requests.post(
            f"{API_URL}/query",
            json={"question": question},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()
    except RequestException as e:
        st.error(f"API Error: {str(e)}")
        return None


def check_api_health() -> bool:
    """Check if the API is healthy."""
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        return response.status_code == 200
    except RequestException:
        return False


def main():
    """Main Streamlit application."""
    # Sidebar
    with st.sidebar:
        st.title("⚙️ Settings")
        st.markdown("---")

        # API URL configuration
        custom_api_url = st.text_input(
            "API URL",
            value=API_URL,
            help="The URL of your Text-to-SQL API backend",
        )
        if custom_api_url != API_URL:
            os.environ["API_URL"] = custom_api_url
            st.rerun()

        # API Health Check
        st.markdown("### API Status")
        if check_api_health():
            st.success("✅ API is healthy")
        else:
            st.error("❌ API is unreachable")
            st.info(f"Make sure your API is running at: {API_URL}")

        st.markdown("---")

        # Information
        st.markdown("### About")
        st.info(
            """
            This app converts natural language questions into SQL queries
            using OpenAI's GPT models and executes them against a database.

            **Security:** Only SELECT queries are allowed.
            """
        )

        # Example questions
        st.markdown("### Example Questions")
        example_questions = [
            "How many customers do we have?",
            "What is the total revenue?",
            "Show me the top 5 customers by order count",
            "List all customers from New York",
            "What are the most popular products?",
        ]

        selected_example = st.selectbox(
            "Try an example:",
            [""] + example_questions,
            help="Click to use an example question",
        )

        if selected_example:
            st.session_state.question = selected_example

    # Main content
    st.title("🔍 Text-to-SQL Query Tool")
    st.markdown(
        """
        Ask questions about your data in plain English, and get SQL queries with results!
        """
    )

    # Question input
    question = st.text_area(
        "Ask a question about your data:",
        value=st.session_state.get("question", ""),
        height=100,
        placeholder="e.g., How many customers do we have?",
        help="Type your question in natural language",
    )

    # Clear button and submit button in columns
    col1, col2 = st.columns([1, 5])
    with col1:
        if st.button("Clear"):
            st.session_state.question = ""
            st.rerun()

    with col2:
        submit = st.button("🚀 Generate SQL & Execute", type="primary")

    # Process the query
    if submit and question.strip():
        with st.spinner("Generating SQL query and executing..."):
            result = query_api(question)

        if result:
            if result.get("success"):
                # Success response
                st.markdown('<div class="success-box">✅ Query executed successfully!</div>', unsafe_allow_html=True)

                # Display the question
                st.markdown("### 📝 Your Question")
                st.info(result["question"])

                # Display the generated SQL
                st.markdown("### 🔧 Generated SQL Query")
                st.code(result["sql_query"], language="sql")

                # Display results
                st.markdown("### 📊 Query Results")
                results = result.get("results", [])

                if results:
                    st.dataframe(
                        results,
                        use_container_width=True,
                        hide_index=True,
                    )

                    # Show result count
                    st.caption(f"Returned {len(results)} row(s)")

                    # Download button
                    import pandas as pd

                    df = pd.DataFrame(results)
                    csv = df.to_csv(index=False)
                    st.download_button(
                        label="📥 Download Results as CSV",
                        data=csv,
                        file_name="query_results.csv",
                        mime="text/csv",
                    )
                else:
                    st.warning("No results returned from the query.")

            else:
                # Error response
                error_msg = result.get("error", "Unknown error occurred")
                st.markdown(
                    f'<div class="error-box">❌ Query failed: {error_msg}</div>',
                    unsafe_allow_html=True,
                )

                # Still show the question
                st.markdown("### 📝 Your Question")
                st.info(result["question"])

    elif submit and not question.strip():
        st.warning("⚠️ Please enter a question before submitting.")

    # Footer
    st.markdown("---")
    st.markdown(
        """
        <div style='text-align: center; color: #666;'>
            <small>Powered by OpenAI GPT-4o-mini | Built with FastAPI & Streamlit</small>
        </div>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
