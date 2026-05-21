# Resume Analyzer

An AI-powered, production-ready application designed to parse and evaluate resumes against specific job descriptions. Built with a modern full-stack architecture, it provides deep, ATS-style analysis and optimization feedback without persisting sensitive user data.

## Features
- **Stateless Architecture:** High-privacy design—resumes and analysis results are processed in-memory and never stored in a database.
- **Multi-Format Parsing:** Server-side extraction for PDF, DOCX, and TXT files.
- **Intelligent Evaluation:** Leverages the OpenAI Responses API to deliver structured feedback, keyword gaps, and alignment scores.

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
