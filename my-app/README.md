# Traveloop

Traveloop is a full-stack travel planning platform built for the Odoo Hackathon. It helps users plan trips, build day-by-day itineraries, manage budgets, track packing checklists, discover activities, and collaborate through shared trip links.

## Tech Stack

| Layer    | Technology                                     |
|----------|------------------------------------------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS    |
| Backend  | FastAPI, SQLAlchemy (async), Alembic           |
| Database | PostgreSQL (production), SQLite (local dev)    |
| Auth     | JWT (access + refresh tokens), bcrypt          |

## Features

- **Dashboard** — Overview of upcoming trips, total budget, and estimated spending in INR
- **Trip Builder** — Create trips with multi-city stops, day-by-day activities, time slots, and cost tracking
- **Budget Breakdown** — Visual donut chart for category spending, daily cost bars, over-budget alerts
- **Activity Search** — Browse a catalog of 12+ curated activities, filter by city, category, cost, and duration
- **Packing Checklist** — Per-trip packing lists with categories, progress tracking, and bulk reset
- **Shared Trips** — Generate public links to share itineraries with others; one-click copy to own account
- **Admin Analytics** — Platform stats, top cities chart, monthly growth chart, and recent users table
- **Trip Notes** — Add and manage travel notes per trip
- **Dark Mode** — Full light/dark theme toggle across all pages
- **Responsive Design** — Editorial aesthetic with serif/sans typography, works on all screen sizes

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### Frontend

```bash
cd my-app/frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000.

### Backend

```bash
cd my-app/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # Edit DATABASE_URL if needed
uvicorn app.main:app --reload --port 8000
```

The backend runs on http://localhost:8000.

### Seed Demo Data

```bash
cd my-app/backend
python seed.py
```

This creates two demo accounts and sample trips:

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@traveloop.com    | Admin@123  |
| User  | demo@traveloop.com     | Demo@123   |

## Configuration

Copy `backend/.env.example` to `backend/.env` and set these values:

| Variable           | Description                        | Default                                            |
|--------------------|------------------------------------|----------------------------------------------------|
| `DATABASE_URL`     | Async DB connection string         | `sqlite+aiosqlite:///./traveloop.db`               |
| `JWT_SECRET_KEY`   | Secret key for signing tokens      | `CHANGE-ME-TO-A-RANDOM-64-CHAR-SECRET`             |
| `CORS_ORIGINS`     | Allowed frontend origins (JSON)    | `["http://localhost:3000"]`                         |
| `BCRYPT_ROUNDS`    | Password hashing cost factor       | `12`                                               |

## Project Structure

```
my-app/
  backend/
    app/
      core/         # Config, database, auth dependencies
      models/       # SQLAlchemy ORM models
      routers/      # API route handlers
      schemas/      # Pydantic request/response schemas
    seed.py         # Demo data seeder
    requirements.txt
  frontend/
    src/
      app/          # Next.js pages (dashboard, trips, activities, admin, etc.)
      components/   # Reusable UI components (Navbar, PageHeader, EditorialHome)
      context/      # React context providers (Auth, Theme)
      lib/          # API utility (fetchApi)
```

## API Documentation

When the backend is running, open http://localhost:8000/docs for the interactive Swagger UI.

## Currency

All monetary values are stored in USD on the backend and displayed as INR on the frontend using a fixed conversion rate of 1 USD = 83 INR.

## License

Built for the Odoo Hackathon 2026.
