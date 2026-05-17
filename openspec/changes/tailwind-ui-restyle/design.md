## Context

The frontend currently uses ad-hoc inline styles and CSS Modules with no shared design language. This produces visual inconsistency across AppBar, Dashboard, and AddCandidate. The stack is React 18 + TypeScript 4.9 on Create React App (CRA), which uses webpack under the hood and supports PostCSS via its built-in pipeline.

## Goals / Non-Goals

**Goals:**
- Install Tailwind CSS, PostCSS, and Autoprefixer as devDependencies within `frontend/`
- Replace all inline styles and CSS Module files with Tailwind utility classes
- Produce a polished, responsive (mobile/tablet/desktop) interface for all current pages and components
- Achieve WCAG 2.1 AA compliance across all interactive elements and forms

**Non-Goals:**
- No new pages, routes, or application features
- No backend or API changes
- No Prisma migrations or data model changes
- No changes to test logic (only fix tests broken by markup changes)

## Decisions

### 1. Tailwind via PostCSS (CRA compatible, no ejecting)

CRA 5 supports custom PostCSS config via `postcss.config.js` at the project root without ejecting. Tailwind and Autoprefixer are added as PostCSS plugins. This is the officially supported integration path.

**Alternative considered:** `craco` or ejecting — rejected as unnecessary complexity for a style-only change.

### 2. Tailwind directives in `index.css` (replace existing rules)

The existing `index.css` contains minimal global resets. Replacing its content with `@tailwind base/components/utilities` is the canonical setup. `App.css` (which only sets centering/font rules) is deleted entirely and its import removed from `App.tsx`.

**Alternative considered:** Keeping both files side by side — rejected due to specificity conflicts between Tailwind's preflight and existing CSS rules.

### 3. Color palette — Slate neutrals + Indigo accent

Slate (gray-blue) provides a professional neutral tone appropriate for an HR SaaS. Indigo (`indigo-600`/`indigo-700`) is used as the single accent for CTAs and focus rings, giving sufficient contrast (≥ 4.5:1 on white for `indigo-700` text, ≥ 3:1 for large text and UI elements). All interactive states (hover, focus-visible) use the same palette.

### 4. WCAG 2.1 AA via utility classes, not custom CSS

Focus rings: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500` applied to every interactive element. ARIA attributes (`role`, `aria-required`, `aria-describedby`, `role="alert"`) added directly to JSX. No external a11y library needed — Tailwind + semantic HTML is sufficient.

### 5. Remove `AppBar.module.css`; use Tailwind in component JSX

CSS Modules are removed entirely. All styling moves to Tailwind class strings in JSX. The `moduleNameMapper` in `jest.config.js` already maps CSS imports to an empty mock, so removing the module file causes no test breakage.

### 6. Two-column form layout via CSS Grid on desktop

AddCandidate uses `grid grid-cols-1 md:grid-cols-2` for form fields, collapsing to single-column on mobile. Submit/Cancel buttons span full width at the bottom. This is implemented with Tailwind's responsive prefixes, no extra components.

## Risks / Trade-offs

- **CRA PostCSS config discovery**: CRA reads `postcss.config.js` from the project root. If CRA's version doesn't pick it up automatically, the fallback is to include tailwind in the CRA-supported `babel-plugin-macros` path. Given CRA 5 is in use this should work as documented.
  → Mitigation: verify `npm run build` succeeds as part of task completion criteria.

- **Tailwind preflight resets**: `@tailwind base` includes a CSS reset (preflight) that removes default margins, paddings, and heading sizes. Any component relying on browser defaults will need explicit Tailwind classes.
  → Mitigation: all styled elements receive explicit margin/padding/typography classes as part of the restyle.

- **Test assertions on rendered structure**: Adding ARIA attributes and new wrapper `<div>` elements can break `getByRole` or `getByText` queries if selectors become ambiguous.
  → Mitigation: run the test suite after each component restyle; fix assertions that break (do not remove tests).

## Migration Plan

1. Install devDependencies: `tailwindcss postcss autoprefixer`
2. Create `tailwind.config.js` and `postcss.config.js`
3. Replace `index.css` with Tailwind directives
4. Delete `App.css`; remove its import from `App.tsx`
5. Restyle `AppBar` → delete `AppBar.module.css`
6. Restyle `Dashboard`
7. Restyle `AddCandidate` (including all ARIA attributes)
8. Run `npm run build` — must pass
9. Run `npx tsc --noEmit` — must pass
10. Run frontend test suite — fix any broken assertions

Rollback: revert all file changes via git; no DB or infrastructure state to undo.
