## Context

The backend currently has no candidate-related code — only a `User` model exists in Prisma. The frontend is a blank CRA scaffold (`App.tsx` renders the default CRA page, no routing). This change introduces the first domain model and the first real recruiter UI.

Key constraints:
- No authentication — all requests are accepted without user identity.
- File uploads (CV) must be stored on disk; only the path is persisted in the database.
- Backend layer rules from `agent-specs/backend.md` apply: types → service → controller → route.
- Frontend layer rules from `agent-specs/frontend.md` apply: types → service → hook → component → page.

## Goals / Non-Goals

**Goals:**
- Introduce the `Candidate` Prisma model and its migration.
- Expose `POST /api/v1/candidates` (multipart/form-data) and `GET /api/v1/candidates` (JSON list).
- Deliver a recruiter dashboard homepage at `/` with an "Add Candidate" entry point.
- Deliver an Add Candidate form page at `/candidates/new` with inline validation and file upload.
- Set up React Router in `App.tsx` as the application routing foundation.

**Non-Goals:**
- Authentication, sessions, or any user identity concept.
- Candidate editing, deletion, or detail view.
- Pagination on the candidate list.
- Autocomplete for education or work experience fields.
- CV parsing or content extraction.

## Decisions

### D1 — File upload library: `multer`
Use `multer` (disk storage) on the backend to handle `multipart/form-data`. Alternatives considered:
- `busboy` directly — lower-level, more boilerplate, no benefit here.
- S3/cloud storage — out of scope for local dev; `UPLOAD_DIR` env var leaves room to swap later.

`multer` is the Express-idiomatic choice with TypeScript types available (`@types/multer`). Files land in `process.env.UPLOAD_DIR ?? './uploads'` relative to the backend process. The absolute path is stored in `Candidate.cvPath`.

### D2 — Validation library: `zod`
Use `zod` for backend input validation, consistent with the pattern in `agent-specs/backend.md`. Zod schemas are defined alongside TypeScript interfaces in the types file and passed to the shared `validateBody` middleware.

`POST /api/v1/candidates` accepts `multipart/form-data`. The text fields are validated by Zod after `multer` parses the request. File validation (MIME type, existence) is enforced in the `multer` `fileFilter` option.

### D3 — Routing: React Router v6 via `react-router-dom`
Introduce `BrowserRouter` + `Routes` + `Route` in `frontend/src/App.tsx`. Two routes:
- `/` → `<Dashboard />`
- `/candidates/new` → `<AddCandidate />`

No lazy loading at this stage — the app is small and CRA handles code splitting at the bundle level if needed later.

### D4 — Form state: `useReducer`
The Add Candidate form has 7+ fields. Using `useReducer` with a single `FormState` type keeps field updates centralized and avoids 7 separate `useState` calls, consistent with `agent-specs/frontend.md`.

### D5 — No shared types package
Frontend types in `frontend/src/types/candidate.ts` are defined independently (not imported from backend). The API contract is kept in sync manually — acceptable for this project size. If the project grows, a shared `packages/types` workspace can be introduced.

### D6 — App bar: plain React component, no UI library
Deliver a minimal `<AppBar>` component with the app name and basic nav. No Material UI or other component library — keeps the bundle small and avoids locking in a library before the team decides. Styled with a CSS Module.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Disk-stored CVs lost on container restart (no volume mount) | Document in `.env.example` that `UPLOAD_DIR` should be a host-mounted volume in production. |
| No file size limit on CV upload could exhaust disk | Set `multer` `limits.fileSize` to 5 MB. |
| `multipart/form-data` bypasses `express.json()` body parsing | `multer` middleware handles parsing; Zod validates `req.body` after multer runs. Controller must not assume JSON content-type. |
| `req.body` fields from multipart are all strings — Zod must coerce numeric types | Use `z.coerce` or keep all candidate fields as strings (phone, address are strings by nature; no numeric fields in this form). |
| CRA's default `App.tsx` is overwritten | This is expected; the CRA boilerplate is replaced by the routing shell. |
