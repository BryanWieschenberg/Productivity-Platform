---
trigger: always_on
---

# Coding Standards & Best Practices

This document outlines the coding standards, architectural patterns, and security practices for the Productivity Platform. Our stack leverages a monorepo setup containing a React + Vite + TypeScript (`web`) frontend and a FastAPI + SQLModel (`api`) backend.

## 1. Tech Stack

- **Frontend**: React (scaffolded via Vite), Tailwind CSS v4, TypeScript.
- **Backend**: FastAPI, SQLModel (ORM), FastAPI Users (Auth), Asyncpg (Postgres Driver).
- **Infrastructure**: Local PostgreSQL, `concurrently` for unified monorepo dev scripts.

---

## 2. General Architecture & Design

### 2.1 Monorepo Structure

- **Separation of Concerns**: Treat `web` and `api` as independent applications that only communicate over HTTP. Do not import code across the web/api boundary.
- **Environment Management**: Environment configurations must be strictly managed with `dotenv`. Secrets (`DATABASE_URL`, `SECRET`) must _never_ be committed to version control and should remain in local `.env` files (ignored in `.gitignore`).

### 2.2 Scalability

- **Modularity**: Inside `api`, separate route definitions, database logic, schemas, and models into distinct modules (e.g., `routers/todos.py`, `models/todo.py`).
- **Async I/O First**: Ensure all endpoints relying on the database utilize `AsyncSession` and `async/await`. Avoid injecting blocking synchronous code into FastAPI route handlers.

### 2.3 Documentation

- **Only Comments if Absolutely Necessary**: 99% of the time, do not write comments directly in the code. Only include them if, say, a line has a time that needs human translating, like `1000*60*60*24 // 1 day`.

---

## 3. Backend Guidelines (FastAPI & Python)

### 3.1 Security & Safety

- **Authentication**: Rely on `FastAPI Users` for identity management, utilizing secure `JWT` strategies.
- **Input Validation & Typing**: Exclusively use Pydantic (or SQLModel schemas) to strictly validate incoming request bodies and outgoing responses (`response_model`). **Never** trust raw incoming JSON.
- **CORS**: Currently permissive for development. In production, `CORSMiddleware` must be strictly explicitly whitelisted to the production frontend domain (e.g. `https://prodplatform.com`).
- **SQL Injection**: Utilize `SQLModel` query methods (`select().where()`) over raw SQL. Never use Python f-strings to inject variables into raw SQL commands.

### 3.2 Database (PostgreSQL & SQLModel)

- **Migrations**: Since the application is evolving, replace `SQLModel.metadata.create_all` with **Alembic** migrations before reaching full production, allowing safe, scalable schema evolutions without data loss.
- **Cascading & Relationships**: Explicitly define cascade behaviors on `SQLModel` relationships to ensure orphaned records (e.g., Todos belonging to a deleted user) are safely erased.

---

## 4. Frontend Guidelines (React & Tailwind v4)

### 4.1 Data Fetching & State

- **Strictly Native Fetch**: We explicitly avoid `axios` due to its potential vulnerability footprint. Use the native `fetch` API.
- **Error Handling**: Every network call must handle `!res.ok` scenarios to gracefully bubble errors to the user UI, particularly capturing and destroying the `token` on `401 Unauthorized` responses.
- **State Organization**: As the application grows beyond `App.jsx`, separate feature-specific states and their corresponding `fetch` wrappers into custom hooks (e.g., `useTodos`, `useAuth`) to keep components clean and scalable.

### 4.2 Styling & Aesthetics

- **Premium Design Strategy**: We enforce a simple yet elegant visual aesthetic. Do not use overly stylistic designs, and instead design for easy of use and a professional look.
- **Tailwind v4 Conventions**: Utilize the latest standard via `@theme` definitions in `index.css`. Maintain cohesive dark-mode foundations.
- **Responsive & Accessible**: Interactions should feature micro-animations (`transition-all` or `Motion` library for more complex animations) on hover/active/init states to make the interface feel alive. Focus rings must be present on all inputs.

---

## 5. Deployment Readiness Checklist

- [ ] Migrate from implicit `.env` to a structured config pipeline (e.g. `pydantic-settings`).
- [ ] Implement robust logging (replacing print statements with standard Python `logging`).
- [ ] Shift JWT storage on the web client from `localStorage` to `HttpOnly` cookies to mitigate XSS targeting token extraction.
- [ ] Initialize `Alembic` for database migrations.

## 6. Modern Practices for Professionalism

These aren't implemented yet but are planned to be added once the app is a bit further along in development, and serve to make this project more scalable.

- Linting & formatting (Ruff for backend, ESLint/Prettier for frontend)
- Testing (Pytest + pytest-asyncio for backend, Vitest + React Testing Library for frontend)
- E2E (Playwright)
- Observability & monitoring
- App-level agentic AI integration
