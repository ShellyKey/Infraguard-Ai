# InfraGuard AI — Frontend

React + Vite + TypeScript dashboard for the InfraGuard AI infrastructure security scanner.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** (dev server & bundler)
- **Tailwind CSS v4**
- **Recharts** (charts)
- **Lucide React** (icons)
- **React Router v7** (routing)

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend API base URL. In dev, Vite proxies `/api` → `http://localhost:8000` |
| `VITE_USE_MOCK` | `true` | Set to `"true"` to load realistic mock data without a running backend |

## Mock Mode

With `VITE_USE_MOCK=true` (default), the app uses realistic mock data:
- Insecure S3 bucket (no public access block)
- Security group open to 0.0.0.0/0
- Docker container running as root
- Privileged Kubernetes container

No backend required — perfect for frontend development.

## Project Structure

```
src/
├── api/           # Backend HTTP client & response adapter
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks (useScan, useToast)
├── mock/          # Mock data for development
├── pages/         # Route pages (Scan, Dashboard, Findings)
└── types/         # TypeScript type definitions
```

## Docker

```bash
# Build image
docker build -t infraguard-frontend .

# Run container (port 80)
docker run -p 3000:80 infraguard-frontend
```

The nginx config proxies `/api/` requests to `http://backend:8000/`.

## Backend CORS

> ⚠️ The backend currently has **no CORS middleware**. To run the frontend against the real backend in development, the backend team needs to add:
>
> ```python
> from fastapi.middleware.cors import CORSMiddleware
>
> app.add_middleware(
>     CORSMiddleware,
>     allow_origins=["http://localhost:5173"],
>     allow_methods=["*"],
>     allow_headers=["*"],
> )
> ```

## Pages

1. **Scan** (`/`) — Upload IaC files or scan the sample project
2. **Dashboard** (`/dashboard`) — Deployment readiness gauge, score cards, severity donut, charts
3. **Findings** (`/findings`) — Searchable, filterable findings table with AI-assisted remediation detail drawer

## Port

- **Dev server**: `5173`
- **Docker (production)**: `80` (mapped to whatever host port you choose)
