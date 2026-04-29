# Resume Analyzer

A Vite + React frontend with a local Node.js API that analyzes a resume against a job description using OpenAI.

## Stack

- React + Vite for the UI
- Express for the backend API
- OpenAI Responses API for ATS-style analysis
- PDF, DOCX, and TXT resume parsing on the server

MongoDB is not configured because the current app does not store resumes or analysis results. The flow is stateless by design.

## Environment

Create a `.env` file in the project root. You can copy from `.env.example`.

Required:

```env
OPENAI_API_KEY=your_openai_api_key
```

Optional:

```env
OPENAI_MODEL=gpt-4o-mini
PORT=3001
VITE_API_URL=http://localhost:3001
```

The server also accepts the legacy `open_ai_key` variable name if that already exists in your local `.env`.

## Run locally

```bash
npm install
npm run dev
```

This starts:

- the Node API on `http://localhost:3001`
- the Vite frontend on its default dev port

The frontend proxies `/api/*` requests to the Node server during development.

## Available scripts

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run build
npm run typecheck
npm run start
```
