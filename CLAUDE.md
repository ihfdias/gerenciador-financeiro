# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless noted.

```bash
# Install all dependencies (installs both workspaces)
npm install

# Start frontend + backend in parallel (dev mode)
npm run dev

# Start only the backend
npm run start:backend

# Start only the frontend
npm run dev:frontend

# Run backend tests (Node built-in test runner — no extra packages)
cd backend && node --test

# Run a single test file
cd backend && node --test test/security.test.js

# Lint frontend
cd frontend && npm run lint

# Build frontend for production
cd frontend && npm run build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Vite proxies `/api/*` → `http://localhost:3001` in dev, so the frontend can call `/api/...` directly without CORS issues locally.

## Architecture Overview

### Monorepo structure

npm Workspaces monorepo with two packages: `frontend/` and `backend/`. Root `package.json` only wires the workspaces and `concurrently`.

### Backend (`backend/`)

Express 5 + Mongoose REST API. Entry point: `index.js`.

**Route layout:**
- `POST/GET /api/auth/*` — register, login, logout, token refresh, `/me`
- `GET/POST/PUT/DELETE /api/transactions` — full CRUD with filtering/pagination
- `GET /api/reports/*` — analytics (category summary, balance trend, forecast, financial indicators)
- `GET /api/health`

**Middleware stack applied globally:** security headers → CORS → `express.json` (100 kb limit) → request logger.

**Auth layer (applied per-route):**
- `middleware/auth.js` — verifies the JWT access token from the `financeiro_auth` HttpOnly cookie (falls back to `Authorization: Bearer` header).
- `middleware/csrf.js` — double-submit cookie pattern: compares `financeiro_csrf` cookie with `X-CSRF-Token` request header using `crypto.timingSafeEqual`. Applied only to mutating routes that already require `auth`.

**Token lifecycle:**
- Access token: JWT, 15-minute TTL, stored in `financeiro_auth` HttpOnly cookie.
- Refresh token: random 40-byte token, stored **hashed (SHA-256)** in the `RefreshToken` collection, 7-day TTL, in `financeiro_refresh` HttpOnly cookie. Rotated on every `/api/auth/refresh` call.
- CSRF token: 32-byte hex, returned in every auth response (`csrfToken` field) and as a readable `financeiro_csrf` cookie (not HttpOnly so JS can read it).

**Transaction amount convention:** amounts are stored **signed** — expenses are stored as negative numbers, incomes as positive. The routes and services use `Math.abs()` to display values and re-apply the sign on write.

**Financial indicators service (`services/indicatorsService.js`):** fetches USD/BRL from AwesomeAPI and SELIC/IPCA from BCB SGS API; results are cached in-process with a configurable TTL (`INDICATORS_CACHE_TTL_MS`, default 10 min).

**Testing:** uses Node's built-in `node:test` runner. Tests live in `backend/test/`. No test database — security/unit tests are pure unit tests that import middleware directly.

### Frontend (`frontend/`)

React 19 + Vite + Tailwind CSS 3. All pages are lazy-loaded.

**Routing & auth guard:** `App.jsx` wraps all private routes in `PrivateWrapper`, which reads `isAuthenticated` from `AuthContext`. Unauthenticated users are redirected to `/login`.

**`AuthContext` (`context/AuthContext.jsx`):** central auth state. On mount it calls `GET /api/auth/me` to restore the session from the existing access-token cookie. Exposes `{ user, isAuthenticated, isLoading, login, logout, refreshAuth }`. Listens for the `auth:session-expired` custom DOM event to clear state when the Axios interceptor fails a silent refresh.

**Axios instance (`lib/api.js`):** configured with `baseURL = VITE_API_URL` and `withCredentials: true`.
- Request interceptor: attaches `X-CSRF-Token` header (read from in-memory cache first, then falls back to the cookie) on all non-safe methods.
- Response interceptor: silently calls `POST /api/auth/refresh` once on a 401, queues concurrent requests during the refresh, and dispatches `auth:session-expired` if the refresh also fails.

**CSRF token (`lib/csrf.js`):** kept in a module-level variable (`csrfTokenMemory`). Set by `AuthContext` after every auth response; read by the Axios request interceptor.

**Tailwind custom tokens:**
- `bg-background` → `#07111f` (dark navy page background)
- `text-primary` / `border-primary` → `#38bdf8` (sky blue)
- `text-success` → `#34d399` (green)
- `text-danger` → `#fb7185` (rose)
- `shadow-glow` → blue glow utility

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | Local: `mongodb://127.0.0.1:27017/gerenciador-financeiro` |
| `JWT_SECRET` | yes | Min 32 chars |
| `NODE_ENV` | — | `development` / `production` |
| `COOKIE_SECURE` | — | `false` in dev, `true` in prod |
| `FRONTEND_URL` | — | Exact frontend origin for CORS |
| `CORS_ORIGINS` | — | Extra comma-separated origins |
| `AUTH_COOKIE_NAME` | — | Default: `financeiro_auth` |
| `REFRESH_COOKIE_NAME` | — | Default: `financeiro_refresh` |
| `CSRF_COOKIE_NAME` | — | Default: `financeiro_csrf` |
| `INDICATORS_CACHE_TTL_MS` | — | Default: 600000 (10 min) |

**Frontend** (`frontend/.env`):

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | yes | `http://localhost:3001` in dev |

## Deploy

- Frontend → **Vercel** (root: `frontend/`, build: `npm run build`, output: `dist`)
- Backend → **Render** (start: `npm run start:backend`, health check: `/api/health`)
- Database → **MongoDB Atlas**

After deploying, set `FRONTEND_URL` on Render to the Vercel URL and `VITE_API_URL` on Vercel to the Render URL.
