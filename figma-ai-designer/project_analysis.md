# Project Analysis & Flaws Report

Here is an honest and real analysis of the flaws found in the `figma-ai-designer` project.

## 🚨 Critical Security Flaws

1.  **Hardcoded API Keys**:
    -   **File**: `backend/main.py` (Line 15)
    -   **Issue**: You have hardcoded an API key: `api_key = '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'`.
    -   **Risk**: This is a massive security risk. If this code is pushed to a public repository (like GitHub), bots will scrape it in seconds and abuse your quota or incur costs.
    -   **Fix**: Always use environment variables (`os.getenv`) and never commit keys to code.

2.  **Inconsistent API Key Usage**:
    -   **File**: `backend/main.py`
    -   **Issue**: You initialize `google.genai.Client` with the hardcoded key (Line 20), but later use `Groq` with `os.getenv("GROQ_API_KEY")` (Line 90). The hardcoded key looks like a Groq key (`gsk_...`), but you are passing it to a Google GenAI client. This is confusing and likely broken logic.

## ⚠️ Code Quality & Best Practices

3.  **Broad Error Handling**:
    -   **File**: `backend/main.py` (Lines 126-130)
    -   **Issue**: You catch *all* exceptions (`Exception as e`) and return a default "Sign Up" button.
    -   **Impact**: This "swallows" errors. If the AI fails, the user just sees a generic button with no explanation, making debugging extremely difficult.

4.  **Prompt Management**:
    -   **File**: `backend/main.py` (Lines 30-80)
    -   **Issue**: The system prompt is massive and embedded directly inside the `convert_prompt_to_command` function.
    -   **Fix**: Move this prompt to a separate text file (e.g., `prompts/system_prompt.txt`) or a configuration file. This makes the code cleaner and the prompt easier to edit.

5.  **Inline Styles in React**:
    -   **File**: `frontend/src/App.jsx` (Lines 31-38)
    -   **Issue**: You are using a large block of inline styles for the background image.
    -   **Fix**: Move this to your Tailwind classes or a CSS file to keep your component clean.

6.  **Commented Out/Dead Code**:
    -   **File**: `backend/main.py`
    -   **Issue**: There are chunks of commented-out code (Lines 85-88) and unused imports that clutter the file.

## 🏗️ Architecture & Scalability

7.  **In-Memory Queue**:
    -   **File**: `backend/main.py` (Line 25 `command_queue = queue.Queue()`)
    -   **Issue**: You are using a Python in-memory queue.
    -   **Risk**: If the backend server restarts or crashes, all queued commands are lost forever. This is not production-ready. You should use a persistent store like Redis or a database.

8.  **Polling Architecture**:
    -   **Issue**: The architecture relies on the Figma plugin "polling" the `/mcp/figma/next` endpoint. While simple, this can be inefficient. A WebSocket connection or Server-Sent Events (SSE) would be more real-time and efficient.

## 📝 Summary
The project works as a prototype but needs significant cleanup before it's safe or maintainable. The hardcoded API key is the most urgent fix required.
