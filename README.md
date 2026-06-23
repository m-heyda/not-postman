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
2. The **Random Fact** example loads automatically (meowfacts API)
3. Edit query params (e.g. add `count=3`)
4. Click **Send** to fetch a live response
5. Switch examples with the sidebar tree

## Seeded APIs

### Meowfacts

- Docs: [github.com/wh-iterabb-it/meowfacts](https://github.com/wh-iterabb-it/meowfacts)
- Base URL: `https://meowfacts.herokuapp.com`
- No authentication required
- Requests: Random Fact, Multiple Facts, Fact by ID, Localized Fact

### httpbin

- Docs: [httpbin.org](https://httpbin.org/)
- Base URL: `https://httpbin.org`
- No authentication required
- Requests: Echo GET Params

## Adding a new API domain

To add a new API collection, two steps:

**1. Create a collection folder:**

```
collections/myapi/
  collection.yaml    # name + description
  get-resource.yaml  # request YAML using {{myapiBaseUrl}}
  get-resource.md    # co-located docs (optional)
```

**2. Add the domain to each environment file:**

```yaml
# environments/development.yaml (and staging.yaml, production.yaml)
variables:
  - key: myapiBaseUrl
    value: "https://myapi.example.com"
    enabled: true
```

Convention: variable key = `{folderName}BaseUrl`.

For private APIs, use `.env` indirection: `value: "{{MY_API_BASE_URL}}"` and add `MY_API_BASE_URL=...` to `.env`.

## Environment variables

Copy `.env.example` to `.env`:

```env
HTTPBIN_BASE_URL=https://httpbin.org
PORT=3001
```

meowfacts uses inline URLs in environment YAML — no `.env` entry needed.

## Project layout

```
not-postman/
├── collections/          # API requests as YAML (one folder per API)
│   ├── meowfacts/        # Cat facts API
│   └── httpbin/          # HTTP testing service
├── environments/         # Environment YAML (dev, staging, production)
├── server/               # Node.js API + HTTP proxy
├── src/                  # React frontend
├── tests/                # Test fixtures and helpers
├── workspace.yaml        # Workspace metadata
├── .env.example          # Env template
└── README.md
```

## Architecture

- **Frontend:** React, Vite, Tailwind v4, shadcn/ui, Zustand, TanStack Query
- **Backend:** Node.js + Fastify — reads YAML, proxies HTTP (avoids browser CORS)
- **Persistence:** YAML files in the repo; Git is the source of truth
- **Secrets:** `.env` only (gitignored)
- **Security:** Server binds to `127.0.0.1` only; not exposed on LAN

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start UI + API server |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | Fastify only |
| `npm run build` | Typecheck + Vite build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Running tests

```bash
npm test
```

Tests use Vitest with co-located `*.test.ts` files. Server integration tests use `fastify.inject()` — no running server needed.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/workspace` | Workspace metadata + collection list |
| `GET /api/collections/:path/tree` | Collection file tree with HTTP methods |
| `GET /api/environments` | List environments |
| `GET /api/environments/:id` | Resolved environment variables |
| `GET /api/requests/*` | Raw request YAML (unresolved vars) |
| `GET /api/docs/*` | Co-located markdown documentation |
| `POST /api/execute` | Execute request via server proxy |
