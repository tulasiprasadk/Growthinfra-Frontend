# SMA Minimal Frontend

This folder contains a minimal static frontend to interact with your existing backend.

Quick start

- Option A: Open in browser
  - Open `frontend/index.html` in your browser (this will load `/reconnect-accounts.html` from the repo root in a new tab).

- Option B: Serve on localhost (recommended to avoid CORS issues)
  - Using Node: `npx serve frontend` (install `serve` if needed)
  - Using Python 3: `python -m http.server 8080 --directory frontend`
  - Then open `http://localhost:8080`.

Notes
-- The frontend expects the backend to be reachable at `http://localhost:6001`.
- `reconnect-accounts.html` already exists in the repo root and provides an OAuth/connect flow UI; the minimal UI here provides a small dashboard for quick checks and tests.

New SPA: A Vite+React minimal app is available at `frontend/app`. To run it:

```bash
cd frontend/app
npm install
npm run dev
```
