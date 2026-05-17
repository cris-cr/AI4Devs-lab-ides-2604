## 1. Tailwind Setup

- [x] 1.1 Install `tailwindcss`, `postcss`, and `autoprefixer` as devDependencies in `frontend/`
- [x] 1.2 Create `frontend/tailwind.config.js` with content paths `./src/**/*.{ts,tsx}` and default theme
- [x] 1.3 Create `frontend/postcss.config.js` with tailwindcss and autoprefixer plugins
- [x] 1.4 Replace the contents of `frontend/src/index.css` with the three Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- [x] 1.5 Delete `frontend/src/App.css` and remove its import from `frontend/src/App.tsx`

## 2. AppBar Restyle

- [x] 2.1 Delete `frontend/src/components/AppBar/AppBar.module.css`
- [x] 2.2 Rewrite `frontend/src/components/AppBar/index.tsx` using Tailwind classes: replace `<header>` with `role="banner"`, slate background, indigo accent for the app name, responsive layout
- [x] 2.3 Run frontend tests — fix any assertions broken by markup changes (do not remove tests)

## 3. Dashboard Page Restyle

- [x] 3.1 Rewrite `frontend/src/pages/Dashboard/index.tsx` with Tailwind: add `<main>` landmark, styled page header with "Add Candidate" primary CTA button (indigo), candidate card/table layout, empty-state message, error-state alert
- [x] 3.2 Ensure the "Add Candidate" link uses primary button classes (`bg-indigo-600 hover:bg-indigo-700 text-white`) and has a visible focus ring (`focus-visible:ring-2 focus-visible:ring-indigo-500`)
- [x] 3.3 Run frontend tests — fix any assertions broken by markup changes

## 4. AddCandidate Page Restyle

- [x] 4.1 Rewrite `frontend/src/pages/AddCandidate/index.tsx` with Tailwind: add `<main>` landmark, two-column grid on md+, single column on mobile (`grid grid-cols-1 md:grid-cols-2`)
- [x] 4.2 Add `aria-required="true"` to First Name, Last Name, and Email inputs; add required field visual indicator (`*`) to their labels
- [x] 4.3 Wire each inline validation error to its field: add `id` to error `<span>`, set `role="alert"`, add `aria-describedby` on the input pointing to the error `id`
- [x] 4.4 Add `aria-label` to the CV file input describing accepted formats (PDF, DOCX, max 5 MB)
- [x] 4.5 Apply visible focus rings to Submit and Cancel buttons (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`)
- [x] 4.6 Run frontend tests — fix any assertions broken by markup changes

## 5. Quality Gates

- [x] 5.1 Run `cd frontend && npm run build` — must exit 0 with no errors
- [x] 5.2 Run `cd frontend && npx tsc --noEmit` — must exit 0 with no type errors
- [x] 5.3 Run `cd frontend && npm test -- --watchAll=false` — all tests must pass
