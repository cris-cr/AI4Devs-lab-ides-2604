## 1. Backend Dependencies

- [x] 1.1 Install `multer` and `@types/multer` in `backend/`: `cd backend && npm install multer && npm install --save-dev @types/multer`
- [x] 1.2 Install `zod` in `backend/` if not already present: `cd backend && npm install zod`
- [x] 1.3 Add `UPLOAD_DIR=./uploads` to `backend/.env` and `backend/.env.example`

## 2. Backend — Data Model

- [x] 2.1 Add `Candidate` model to `backend/prisma/schema.prisma` with fields: `id`, `firstName`, `lastName`, `email` (unique), `phone?`, `address?`, `education?`, `workExperience?`, `cvPath?`, `createdAt`, `updatedAt`
- [x] 2.2 Run migration: `cd backend && npx prisma migrate dev --name add-candidate-model`
- [x] 2.3 Run `npx prisma generate` to update the Prisma client

## 3. Backend — Types

- [x] 3.1 Create `backend/src/types/candidate.types.ts` with `CreateCandidateDto` interface, `UpdateCandidateDto` interface (empty for now), and Zod schemas `candidateCreateSchema` / `candidateUpdateSchema`

## 4. Backend — Upload Middleware (TDD)

- [x] 4.1 Write `backend/src/tests/upload.middleware.test.ts` — tests for fileFilter: accepts `application/pdf`, accepts DOCX MIME type, rejects other MIME types; run `npm test` and confirm tests fail (red)
- [x] 4.2 Create `backend/src/middleware/upload.middleware.ts` with multer disk storage using `process.env.UPLOAD_DIR ?? './uploads'`, fileFilter from 4.1, and `limits.fileSize` of 5 MB; run `npm test` and confirm upload middleware tests pass (green)

## 5. Backend — Service (TDD)

- [x] 5.1 Write `backend/src/tests/candidate.service.test.ts` — tests for: `findAll` returns records, `create` happy path returns new candidate, `create` with duplicate email throws error with `statusCode: 409`; run `npm test` and confirm tests fail (red)
- [x] 5.2 Create `backend/src/services/candidate.service.ts` with `findAll()` returning all candidates ordered by `createdAt` desc; run `npm test` and confirm `findAll` tests pass (green)
- [x] 5.3 Add `create(data: CreateCandidateDto, cvPath?: string)` to `candidate.service.ts` — maps Prisma P2002 to `statusCode: 409`; run `npm test` and confirm all service tests pass (green)

## 6. Backend — Controller (TDD)

- [x] 6.1 Write `backend/src/tests/candidate.controller.test.ts` — tests for: `getAll` returns 200 with data, `getAll` forwards service error to `next`, `create` returns 201 with created candidate, `create` forwards service error to `next`; run `npm test` and confirm tests fail (red)
- [x] 6.2 Create `backend/src/controllers/candidate.controller.ts` with `getAll` handler; run `npm test` and confirm `getAll` controller tests pass (green)
- [x] 6.3 Add `create` handler to `candidate.controller.ts` — reads `req.file?.path` for `cvPath`, calls `candidateService.create()`; run `npm test` and confirm all controller tests pass (green)

## 7. Backend — Routes (TDD)

- [x] 7.1 Write `backend/src/tests/candidate.routes.test.ts` — Supertest tests for: `GET /api/v1/candidates` returns 200, `POST /api/v1/candidates` with valid body returns 201, `POST` with missing required fields returns 400, `POST` with duplicate email returns 409; run `npm test` and confirm tests fail (red)
- [x] 7.2 Create `backend/src/routes/candidate.routes.ts` with `GET /` and `POST /` (upload middleware → validateBody → controller), including Swagger JSDoc for both routes
- [x] 7.3 Mount candidate routes in `backend/src/index.ts`: `app.use('/api/v1/candidates', candidateRoutes)`
- [x] 7.4 Ensure the `uploads/` directory is created on startup (add `fs.mkdirSync` guard in `index.ts` or the upload middleware); run `npm test` and confirm all route tests pass (green)

## 8. Backend — Verification

- [x] 8.1 Run `cd backend && npm test` — all tests pass with no skipped tests
- [x] 8.2 Run `cd backend && npx eslint src/` — no lint errors (no ESLint config present; gate skipped)

## 9. Frontend — Dependencies

- [x] 9.1 Install `react-router-dom` v6 and `@types/react-router-dom` in `frontend/`: `cd frontend && npm install react-router-dom && npm install --save-dev @types/react-router-dom`

## 10. Frontend — Types

- [x] 10.1 Create `frontend/src/types/candidate.ts` with `Candidate` interface (all fields, optional as `string | null`) and `CreateCandidateDto` interface (required fields required, optional as `string | undefined`)

## 11. Frontend — Service (TDD)

- [x] 11.1 Write `frontend/src/tests/candidate.service.test.ts` — mock `fetch`; tests for: `fetchCandidates` returns parsed array on 200, `fetchCandidates` throws on non-ok, `createCandidate` returns Candidate on 201, `createCandidate` throws with server error message on non-ok; run `npm test` and confirm tests fail (red)
- [x] 11.2 Create `frontend/src/services/candidate.service.ts` with `fetchCandidates()` and `createCandidate()`; run `npm test` and confirm service tests pass (green)

## 12. Frontend — AppBar Component (TDD)

- [x] 12.1 Write `frontend/src/tests/AppBar.component.test.tsx` — tests for: renders app name "LTI – Talent Tracker"; run `npm test` and confirm test fails (red)
- [x] 12.2 Create `frontend/src/components/AppBar/index.tsx` and `AppBar.module.css`; run `npm test` and confirm AppBar test passes (green)

## 13. Frontend — Dashboard Page (TDD)

- [x] 13.1 Write `frontend/src/tests/Dashboard.component.test.tsx` — mock candidate service; tests for: renders candidate list when data is returned, renders empty state message when list is empty, renders error message when fetch fails, "Add Candidate" button/link is present and has correct href; run `npm test` and confirm tests fail (red)
- [x] 13.2 Create `frontend/src/pages/Dashboard/index.tsx` — fetches candidates on mount, renders list, empty state, loading indicator, and error state; run `npm test` and confirm Dashboard tests pass (green)

## 14. Frontend — Add Candidate Page (TDD)

- [x] 14.1 Write `frontend/src/tests/AddCandidate.component.test.tsx` — mock candidate service; tests for: all 7 fields and file input render, submit with empty `firstName`/`lastName`/`email` shows inline errors, submit with invalid email shows inline error, valid submit calls `createCandidate`, success shows "Candidate added successfully" and navigates to `/`, non-ok response shows error message without raw details, Cancel navigates to `/` without calling service; run `npm test` and confirm tests fail (red)
- [x] 14.2 Create `frontend/src/pages/AddCandidate/index.tsx` — `useReducer`-based form with all fields and client-side validation; run `npm test` and confirm field-render and validation tests pass (green)
- [x] 14.3 Implement form submission in `AddCandidate` — call `createCandidate()`, show success and navigate or show error; run `npm test` and confirm all AddCandidate tests pass (green)
- [x] 14.4 Add "Cancel" button that navigates to `/` without submitting; run `npm test` and confirm cancel test passes (green)

## 15. Frontend — App Shell (Routing)

- [x] 15.1 Replace `frontend/src/App.tsx` with a `BrowserRouter` + `Routes` shell: route `/` → `<Dashboard />`, route `/candidates/new` → `<AddCandidate />`, catch-all → redirect to `/`; render `<AppBar />` outside `<Routes>`

## 16. Frontend — Verification

- [x] 16.1 Run `cd frontend && npm test -- --watchAll=false` — all tests pass with no skipped tests
- [x] 16.2 Run `cd frontend && npx tsc --noEmit` — no type errors
- [x] 16.3 Run `cd frontend && npx eslint src/` — no lint errors (no ESLint config present; gate skipped)

## 17. Final Verification

- [x] 17.1 Start DB, backend, and frontend; manually verify: dashboard loads, "Add Candidate" navigates to form, form submits a new candidate (with and without CV), success message appears, candidate appears in dashboard list on return
