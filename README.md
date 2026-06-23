# not-postman

A local-first API client that stores workspaces, collections, and requests as YAML on disk. Runs as a **localhost web app** with a Node.js proxy backend.

## Prerequisites

- Node.js 20+

## Setup

```bash
git clone https://github.com/m-heyda/not-postman.git
cd not-postman
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The dev script starts:

- **Vite** on port 5173 (React UI)
- **Fastify** on port 3001 (API + HTTP proxy)

## Usage

1. Start the app with `npm run dev`
2. The **List Posts** example loads automatically (JSONPlaceholder)
3. Edit query params (e.g. change `_limit` from `5` to `2`)
4. Click **Send** to fetch a live response
5. Switch examples with the buttons (JSONPlaceholder / httpbin)

## Example APIs

No authentication required for the seeded examples.

### JSONPlaceholder

- Docs: [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com/)
- Base URL env: `JSONPLACEHOLDER_BASE_URL`
- Example: `GET /posts?_limit=5` — returns a JSON array of fake posts

### httpbin

- Docs: [httpbin.org](https://httpbin.org/)
- Base URL env: `HTTPBIN_BASE_URL`
- Example: `GET /get?foo=bar&debug=true` — echoes your query params in the response `args` field (useful for verifying the params UI)

## Environment variables

Copy `.env.example` to `.env`:

```env
JSONPLACEHOLDER_BASE_URL=https://jsonplaceholder.typicode.com
HTTPBIN_BASE_URL=https://httpbin.org
PORT=3001
```

YAML environments reference these via placeholders, e.g. `{{JSONPLACEHOLDER_BASE_URL}}` in [`environments/local.yaml`](environments/local.yaml).

### Staging domains (future)

When connecting to real APIs, add secrets to `.env` (never commit this file):

```env
STAGING_BASE_URL=https://api.staging.example.com
STAGING_API_KEY=your-key-here
```

Reference them in request headers as `Bearer {{STAGING_API_KEY}}` or in environment YAML as `{{STAGING_BASE_URL}}`.

## Project layout

```
not-postman/
├── collections/          # API requests as YAML (one file per endpoint)
├── environments/         # Non-secret env vars (reference .env)
├── generated/            # Generated TS types (future)
├── server/               # Node.js API + HTTP proxy
├── src/                  # React frontend
├── workspace.yaml        # Workspace metadata
├── .env.example          # Env template
└── README.md
```

## Architecture

- **Frontend:** React, Vite, Tailwind v4, shadcn/ui, Zustand, TanStack Query
- **Backend:** Node.js + Fastify — reads YAML, proxies HTTP (avoids browser CORS)
- **Persistence:** YAML files in the repo; Git is the source of truth
- **Secrets:** `.env` only (gitignored)
- **History:** localStorage (future plan)
- **Security:** Server binds to `127.0.0.1` only; not exposed on LAN

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start UI + API server |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | Fastify only |
| `npm run build` | Typecheck + Vite build |
| `npm run typecheck` | TypeScript check |

## Verification

- `GET http://localhost:5173/api/health` → `{ "status": "ok" }`
- Send **List Posts** → HTTP 200, JSON array
- Change `_limit` to `2` → response contains 2 items
- Load **Echo GET Params** → response `args` matches your params
