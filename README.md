# Vibe

## Overview

This project is a Next.js application that empowers users to generate code using AI prompts, experiment with it in a browser-based sandbox, persist workspaces, and deploy projects. Imagine describing a project to AI, receiving the code, testing it live, and then deploying it, all within a streamlined workflow!

## Tech Stack

*   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui, lucide-react, next-themes
*   **Backend:** Convex (Serverless Database)
*   **AI:** OpenAI Chat Completions (gpt-4o-mini)
*   **Authentication:** Google OAuth (@react-oauth/google)
*   **Code Runtime:** @codesandbox/sandpack-react
*   **Integrations:** GitHub API, Vercel API, JSZip
*   **Packages:** convex, openai, axios, jszip

## Features

*   **Chat-Based AI Prompting:** Interact with AI using natural language to describe your desired project.
*   **AI Code Generation:** Generates code based on your prompts, providing a structured file system with dependencies.
*   **In-Browser Code Execution:**  Test and run the generated code directly in your browser using Sandpack.
*   **Persistent Workspaces:** Save your progress! Workspaces (messages, files) are stored in ConvexDB, allowing you to pick up where you left off.
*   **Project Export:** Export your generated project as a ZIP archive.
*   **One-Click Vercel Deployment:** Seamlessly deploy your project to Vercel through automatic GitHub repository creation.
*   **Google OAuth:** Secure and easy sign-in using your Google account.

## Flow Diagram

  <img width="1024" height="1536" alt="ChatGPT Image Dec 21, 2025, 12_26_51 PM" src="https://github.com/user-attachments/assets/9ff2fdf7-8735-488e-8412-335a5578a6df" />

## System Architecture

The application follows a modular architecture:

*   **Client (Next.js Frontend):** Handles user interaction, displays AI-generated code, and manages the Sandpack code editor.
*   **API Gateway (Next.js Route Handlers):** Acts as an intermediary between the client and backend services, handling requests for AI code generation, chat completions, project export, and deployment.  Key endpoints include `/api/ai-chat`, `/api/gen-ai-code`, `/api/export`, and `/api/deploy`.
*   **Backend (Convex):** A serverless database that stores user data, workspace information (messages, files), and application configuration.
*   **AI Engine (OpenAI):** Powers the code generation and chat functionalities using GPT models.
*   **Code Runtime (Sandpack):** Provides the in-browser code execution environment.

## Running the Project Locally

1.  **Prerequisites:**

    *   Node.js (version >= 18)
    *   npm
    *   A Google Cloud project with OAuth enabled
    *   An OpenAI API key
    *   A GitHub account
    *   A Vercel account

2.  **Clone the repository:**

    ```bash
    git clone https://github.com/Devleena2003/Vibe.git
    cd Vibe
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Set up environment variables:**

    Create a `.env.local` file in the root directory with the following variables:

    ```
    NEXT_PUBLIC_CONVEX_URL=<your_convex_url>
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your_google_client_id>
    OPENAI_API_KEY=<your_openai_api_key>
    GITHUB_TOKEN=<your_github_token>
    GITHUB_USERNAME=<your_github_username>
    VERCEL_TOKEN=<your_vercel_token>
    ```

    *   `NEXT_PUBLIC_CONVEX_URL`:  Your Convex deployment URL (get this from the Convex dashboard).
    *   `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
    *   `OPENAI_API_KEY`: Your OpenAI API key.
    *   `GITHUB_TOKEN`: A personal access token from GitHub with `repo` scope.
    *   `GITHUB_USERNAME`: Your GitHub username.
    *   `VERCEL_TOKEN`: A Vercel API token.

5.  **Configure Convex:**

    *   Install the Convex CLI: `npm install -g convex`
    *   Run `convex init` in your project directory.
    *   Deploy your Convex schema and functions.  Refer to the Convex documentation for detailed instructions.

6.  **Start the development server:**

    ```bash
    npm run dev
    ```

    Open your browser and navigate to `http://localhost:3000`.

    
