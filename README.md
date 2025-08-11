# Astra Intelligence Dashboard

Astra is a sophisticated, AI-powered dashboard for political intelligence and social media analysis. It processes data from platforms like Facebook to provide actionable insights on sentiment, engagement, narrative trends, and content strategy.

## Key Features

- **Executive Overview:** A high-level cockpit with key performance indicators (KPIs) and campaign health metrics.
- **AI-Powered Insights:** An AI assistant and insights hub powered by the Gemini API for strategic recommendations.
- **Engagement Analytics:** Deep dives into post engagement, including a **Controversy Hotspot** to flag polarizing content.
- **Performance Trends:** Visualize campaign performance over time with interactive charts, including a **Topic & Sentiment Trends** analysis.
- **Content Strategy:** Tools to analyze and optimize content performance.
- **Data Explorer:** A powerful interface for filtering and exploring the raw data.
- **File-Based Data Pipeline:** Ingests and processes data from a series of Python scripts and CSV files located in the `DASHBOARD FINAL 2/` directory.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (with Drizzle ORM), though currently used primarily for user authentication.
- **AI:** Google Gemini

---

## Getting Started

Follow these instructions to set up and run the Astra Intelligence dashboard on your local machine.

### 1. Install Dependencies

First, install the required Node.js packages using npm:

```bash
npm install
```

### 2. Set Up Environment Variables

The application requires two environment variables to run. You can create a `.env` file in the root of the project to manage them.

```
touch .env
```

Add the following variables to your `.env` file:

```env
DATABASE_URL="dummy_url_for_local_dev"
GEMINI_API_KEY="your_google_gemini_api_key"
```

- **`DATABASE_URL`**: The application is configured to require a database URL. For local development and testing of the file-based pipeline features, you can set this to any non-empty string (e.g., `"dummy"`).
- **`GEMINI_API_KEY`**: This is required for the AI-powered features. If you do not have a key, the AI features will be gracefully disabled, but the rest of the application will still run.

### 3. Running the Application

There are two ways to run the application:

#### A) Development Mode

This mode uses the Vite development server with hot-reloading, which is ideal for making changes to the code.

```bash
npm run dev
```

The server will start, and you can access the application at **`http://localhost:5000`**.

#### B) Production Mode

This mode builds the application for production and runs the optimized server. This is the best way to test the application as it would run in a real deployment.

**Step 1: Build the application**
```bash
npm run build
```

**Step 2: Start the production server**
```bash
npm run start
```

The server will start, and you can access the application at **`http://localhost:5000`**.

---
## Login Credentials

For local testing, you can use the following hardcoded credentials to log in:

- **Username:** `admin`
- **Password:** `password123`
