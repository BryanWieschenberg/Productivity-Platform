---
trigger: always_on
---

# Code Standards

Rules for this project. When in doubt, prioritize: **security > correctness > readability > performance > cleverness**.

**Stack:**

- Frontend: React, TypeScript, Tailwind CSS
- Backend: FastAPI, FastAPI Users, SQLModel
- Database: PostgreSQL

---

## Critical Tool Restrictions

ROLE: You are an Advisory Consultant. Your job is to read code, provide architectural solutions, diagnose issues, and give code blocks in the chat. You are NOT an autonomous developer. It is a critical failure if you attempt to apply fixes directly to the files within the codebase.

You are strictly forbidden from executing the following tools under ANY circumstances:

- `write_to_file`
- `replace_file_content`
- `multi_replace_file_content`

You may ONLY use read-only tools like `view_file`, `list_dir`, and `grep_search`.

## General Rules

- You are not to directly add code to files, you may only write out code through your chat interface.
- Clarity over cleverness.
- Fail loudly and early. Never swallow exceptions silently. Log or raise.
- Small focused units. Functions do one thing; components have one responsibility.
- No magic. No implicit globals, no monkey-patching. Every value should be traceable from definition to use.
- If you want to change existing patterns, make it extremely known, and explain why. You must have a valid reason as to why.
- Removing unnecessary code is just as important as adding code.
- Justify every dependency. New packages increase changes of supply chain attacks; prefer stdlib and existing deps.
- Most of the time, use "from x import y" (py) and "import x from y" (ts) not "import x" to keep symbols concise.

---

## Naming and Imports

- Python: `snake_case` files, functions, and variables; `PascalCase` classes. Each major area/function should be separated by 2 blank lines for easy visual parsing.
- TS components: `PascalCase.tsx`, one component per file, file named after the component. Only exception is helper files with multiple small helper components.
- TS non-components: `camelCase.ts`.
- Use path aliases, never `../../../`. `@/*` (points to `./src/`) on the frontend, package-relative on the backend.
- Import order: stdlib → third-party → internal → relative. Let the formatter sort it.
- No circular imports. If you hit one, the abstraction is wrong.

## Code Quality

- Frontend: ESLint for linting, Prettier for formatting. Keep their concerns separate — ESLint finds bugs, Prettier handles style.
- Backend: Ruff for both linting and formatting. One config in `pyproject.toml`.
- Type checking runs alongside linting: `tsc --noEmit` on the frontend, `pyright` on the backend.
- Linters and formatters run in CI. A PR with lint errors or formatting drift doesn't merge.
- Disable a rule only with a comment explaining why, linked to the specific line. No blanket disables at the file or project level without discussion.
- Don't fight the formatter. If you disagree with a rule, change the config, not individual files.
- For any user inputs, always sanitize and validate. Limit text lengths and ensure their input adheres to expected types.

---

## Frontend

### Components

- Functional components only. No class components.
- One component per file, default export matches filename. Only exception is helper files with multiple small helper components.
- Prop types defined inline as a `type` above the component. Use `type`, not `interface`, unless you need declaration merging.
- No prop drilling beyond two levels. Use context or colocate state.
- Keep presentational components pure: no fetching, no routing, no global state. Data comes in via props.
- Feature-specific components live under `features/<feature>/`. Shared primitives live under `components/ui/`.

### State and data fetching

- Local state with `useState`; derived state computed inline or via `useMemo` only when measurably needed.
- Server state goes through the shared API client wrapper. Don't call `fetch` directly from components.
- Never store sensitive data (tokens, PII) in `localStorage`. Auth uses httpOnly cookies, handled by the backend.
- Theme preferences and other non-sensitive UI state in `localStorage` is fine.

### TypeScript

- `strict: true` in `tsconfig.json`, non-negotiable. No `// @ts-ignore` without a comment explaining why and an explanation.
- `any` is banned. Define a proper type, or use `unknown` and narrow.
- Type API responses at the call site via generics on the fetch helper. Don't cast raw results inside components.
- Enums as string literal unions (`type State = "open" | "closed"`) unless runtime iteration is required.
- Shared types live in `types/` or next to the feature that owns them.

### Styling

- Tailwind only. No inline `style` props, no CSS modules, no ad-hoc stylesheets.
- Use semantic theme tokens (`bg-surface`, `text-text-muted`, `border-border`), never raw color scales (`bg-neutral-100`). The brand token is the only hand-picked color in components.
- Define tokens once in the theme CSS; add a new token instead of hardcoding a color in a component.
- Dark mode is handled by the token system. Don't write `dark:` variants in components — they're a smell that a token is missing.
- Compose long className strings with a utility like `clsx` or `cn` once conditional logic appears; don't do string concatenation.

### Accessibility

- Every interactive element is a real `<button>`, `<a>`, or labeled form control. No `div onClick`.
- Form inputs have associated `<label>`s. Use `aria-label` only when a visible label isn't possible.
- Icon-only buttons need an `aria-label`.
- Keyboard navigation must work for every flow. Tab order should be logical; no positive `tabIndex`.
- Respect `prefers-reduced-motion` for animations.

---

## Backend

### FastAPI

- One router per resource. Mount routers in `main.py`; don't hardcode prefixes inside the router file.
- Route handlers are thin: parse input, call a service, return a response. No business logic in handlers.
- Business logic lives in a `services/` layer that takes a session and typed inputs — never `Request` or `Response` objects. This keeps logic testable and reusable.
- Use dependency injection for sessions, current user, and anything else shared. Create typed aliases (e.g. `SessionDep`, `CurrentUser`) so handlers stay clean.
- Every route has an explicit `response_model` and `status_code`. Don't rely on defaults for create/delete. Be sure to type all endpoint parameters and the return type.
- Validation happens in Pydantic schemas, not inside handlers.
- Use `async def` throughout. Don't mix sync and async DB calls.

### SQLModel and schemas

- Table models in `models/`, one concept per file. Request/response schemas in `schemas/`, never reuse table models as API schemas.
- Schema naming: `XBase` for shared fields, `XCreate` for input, `XUpdate` for partial input, `XRead` for output.
- Every FK has an explicit `ON DELETE` behavior. Default to `SET NULL` for soft links, `CASCADE` only when child rows are meaningless without the parent.
- Every table has `created_at` and `updated_at` timestamps, DB-generated.
- Primary keys are explicit. Use `int` auto-increment by default, UUIDs only when IDs are exposed externally or generated client-side, like the User table.
- Models are dumb data containers. No methods beyond trivial computed properties.

### Errors and logging

- Raise `HTTPException` with a clear `detail` string. Never return `{"error": ...}` dicts manually.
- Use a custom exception hierarchy for domain errors; translate them to HTTP in a single exception handler, not in each route.
- Log at `INFO` for normal lifecycle events, `WARNING` for recoverable issues, `ERROR` for bugs and unexpected failures. Never log secrets, tokens, passwords, or PII.
- Include a request ID in every log line for traceability.

### Configuration

- All config via environment variables, loaded through a single Pydantic `Settings` class. No `os.getenv` or `os.environ` scattered in modules.
- Ship a `.env.example` with every variable documented; never commit real `.env` files.
- Fail fast on startup if required env vars are missing.

---

## Security

- Auth tokens live in httpOnly, Secure, SameSite cookies. Never in `localStorage` or JS-readable cookies.
- `cookie_secure=True` and HTTPS in every non-local environment.
- CORS allows an explicit origin list, never `*`, with `allow_credentials=True` only when needed.
- Every mutating endpoint requires authentication unless explicitly public. Default to protected.
- Every query that returns user-owned data filters by the current user's ID at the query level. Never rely on client-side filtering for authorization.
- Passwords are hashed and salted by fastapi-users (explicitly set algorithm to argon2). Never log, store, or return them in any form.
- All user input is validated through Pydantic schemas. Never trust query params, body fields, or headers.
- SQL is always parameterized via SQLModel/SQLAlchemy. No string interpolation into queries, ever.
- Rate limit all endpoints, but only heavily limit authentication endpoints and any expensive operations.
- Secrets come from environment variables only. Never commit secrets, API keys, or `.env` files besides `.env.example`, which should not contain any real secrets.
- Keep dependencies patched. Run a vulnerability scan (e.g. `pip-audit`, `npm audit`) in CI and on a schedule.
- Error responses never leak stack traces, SQL, or internal paths to clients in production.

---

## Performance

- Measure before optimizing. No premature optimization; no micro-benchmarks driving design.
- Database: every foreign key has an index. Add indexes for columns used in `WHERE`, `ORDER BY`, and `JOIN` conditions.
- Avoid N+1 queries. Use `selectinload` or explicit joins when loading related data.
- Keep the payload minimal: paginate any endpoint that could return more than a few dozen rows. Never return unbounded lists.
- Return only the fields the client needs. Separate `XRead` and `XReadDetail` schemas when a list view doesn't need everything.
- Memoize (`useMemo`, `useCallback`, `React.memo`) only when a profiler shows a real cost. Default is no memoization.
- Avoid large synchronous work in render; move it to effects or workers.
- Images are sized and compressed before shipping. No 4MB PNGs in the UI.

---

## Version Control

- Use Git as your VCS and GitHub for remote hosting.
- Commit messages in imperative mood: "add company search endpoint", not "added" or "adds".
- Define scope of the commit in parentheses in the beginning of the message: "feat(auth): add OAuth 2.0 Google and GitHub support".
- Commits are small and self-contained. One logical change per commit. If a message needs "and," split it.
- Rebase, don't merge, when updating a feature branch from `main`. Keep history linear.
- PRs include what changed, why, and how to verify. Screenshots for UI changes.
- No force-push to shared branches. Force-push to your own feature branch is fine.

---

## Documentation

- Every public function, route, and service has a docstring explaining _what_ and _why_, not _how_.
- README covers setup, running locally, environment variables, and common commands. Nothing else — keep it current.
- Architectural decisions worth remembering go in short ADR files. Date, context, decision, consequences.
- Keep explanatory inline comments to an absolute minimum. Comments explain _why_ — business rules, non-obvious constraints, tradeoffs. If the code needs a "what" comment, rewrite the code.
- Keep this file updated. When I approve a change or addition in coding standards, edit this document.
