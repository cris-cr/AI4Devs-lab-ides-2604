## Why

The LTI ATS has no way to capture candidate data today — the frontend is a blank scaffold and the backend has no candidate model. This change introduces the first core recruiter workflow: adding candidates to the system, along with the dashboard shell that will host all future recruiter features.

## What Changes

- New `Candidate` Prisma model and migration (`add-candidate-model`).
- New backend layer: types, service, controller, and routes for `/api/v1/candidates` (GET list, POST create with optional CV file upload).
- New file upload middleware using `multer` to handle `multipart/form-data`; CV stored on disk, path persisted in `Candidate.cvPath`.
- New frontend shell: app bar component and recruiter dashboard homepage at route `/`.
- New frontend page: Add Candidate form at route `/candidates/new` with inline validation and submission feedback.
- New frontend service and types for the candidate API.

## Capabilities

### New Capabilities

- `candidate-management`: Backend API and data model for creating and listing candidates, including optional CV file upload. Covers the `Candidate` Prisma model, `POST /api/v1/candidates`, and `GET /api/v1/candidates`.
- `recruiter-dashboard`: Frontend application shell (app bar, layout) and the recruiter dashboard homepage at `/`, displaying the candidate list and entry point to add a candidate.
- `add-candidate-form`: Frontend form page at `/candidates/new` — field collection, client-side validation, file upload, and submission feedback (success confirmation and error display).

### Modified Capabilities

*(none — no existing specs)*

## Impact

**Layers affected:**
- Model: new `Candidate` Prisma model (`backend/prisma/schema.prisma`)
- Prisma migration name: `add-candidate-model`
- Service: `backend/src/services/candidate.service.ts` (new)
- Controller: `backend/src/controllers/candidate.controller.ts` (new)
- Route: `backend/src/routes/candidate.routes.ts` (new)
- Middleware: `backend/src/middleware/upload.middleware.ts` (new — multer file upload)
- Types: `backend/src/types/candidate.types.ts` (new)
- Frontend types: `frontend/src/types/candidate.ts` (new)
- Frontend service: `frontend/src/services/candidate.service.ts` (new)
- Frontend components: `frontend/src/components/AppBar/index.tsx` (new)
- Frontend pages: `frontend/src/pages/Dashboard/index.tsx`, `frontend/src/pages/AddCandidate/index.tsx` (new)
- App entry: `frontend/src/App.tsx` (modified — add React Router, register routes)

**New dependencies:**
- Backend: `multer` + `@types/multer` (file upload), `zod` (validation — may already be present)
- Frontend: `react-router-dom` v6 + `@types/react-router-dom` (routing — may already be present)

**New environment variables:**
- `UPLOAD_DIR` (optional, backend) — filesystem path for CV uploads. Defaults to `./uploads` relative to the backend process.
- `REACT_APP_API_URL` (optional, frontend) — backend base URL. Defaults to `http://localhost:3010/api/v1`.

**No authentication scope.** All endpoints accept requests without any user identity. No `user_id`, session, or auth middleware.
