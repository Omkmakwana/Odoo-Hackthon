# Traveloop

Traveloop is a travel planning platform built for the Odoo Hackathon. It combines a Next.js frontend with a FastAPI backend to help users plan trips, manage itineraries, track checklists, and organize travel notes.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000.

### Backend

```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend runs on http://localhost:8000.

## Configuration

Create a backend `.env` file if you want to override the defaults in `backend/app/core/config.py`.

Common values include:

- `DATABASE_URL`
- `DATABASE_URL_SYNC`
- `JWT_SECRET_KEY`
- `CORS_ORIGINS`

## Project Structure

- `frontend/`: Next.js app and UI components
- `backend/`: FastAPI app, database models, routers, and migrations
- `design-prototype.html`: UI reference for the product

## API Docs

When the backend is running, open `http://localhost:8000/docs` for the interactive API documentation.
