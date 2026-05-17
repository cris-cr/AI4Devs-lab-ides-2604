## Why

The current frontend uses ad-hoc inline styles and CSS Modules with no design system, resulting in an inconsistent, unstyled appearance. Introducing Tailwind CSS establishes a consistent utility-first design system and delivers a polished, responsive, accessible UI across all existing pages and components in one focused change.

## What Changes

- Install and configure Tailwind CSS, PostCSS, and Autoprefixer for the CRA frontend.
- Replace all inline styles and CSS Module files with Tailwind utility classes.
- Restyle `AppBar`, `Dashboard`, and `AddCandidate` to a professional HR/SaaS visual standard.
- Add full WCAG 2.1 AA accessibility compliance (focus rings, ARIA attributes, contrast, landmarks).
- Remove `App.css` and `AppBar.module.css`; replace with Tailwind global setup in `index.css`.

No new features, routes, backend changes, or data model changes are introduced.

## Capabilities

### New Capabilities

- `tailwind-design-system`: Tailwind CSS installation, configuration, and global style baseline for the frontend application. Covers `tailwind.config.js`, `postcss.config.js`, and `index.css` directives.
- `accessible-responsive-ui`: Restyled AppBar, Dashboard, and AddCandidate components and pages using Tailwind utility classes, with full responsiveness (mobile/tablet/desktop) and WCAG 2.1 AA compliance.

### Modified Capabilities

*(none — existing capability specs define functional requirements that are unchanged; this change affects only presentation)*

## Impact

**Layers affected (frontend components only):**
- New config files: `frontend/tailwind.config.js`, `frontend/postcss.config.js`
- Modified: `frontend/src/index.css` (Tailwind directives replace existing rules)
- Removed: `frontend/src/App.css`, `frontend/src/components/AppBar/AppBar.module.css`
- Modified components: `frontend/src/components/AppBar/index.tsx`
- Modified pages: `frontend/src/pages/Dashboard/index.tsx`, `frontend/src/pages/AddCandidate/index.tsx`
- Modified: `frontend/src/App.tsx` (remove `App.css` import)
- Test files updated only if rendered structure changes break existing assertions

**New dependencies:**
- `tailwindcss`, `postcss`, `autoprefixer` (devDependencies in `frontend/`)

**No new environment variables required.**
**No backend changes.**
**No Prisma migration.**
