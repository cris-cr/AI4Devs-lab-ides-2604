## ADDED Requirements

### Requirement: Tailwind CSS is installed and configured for the CRA frontend
The frontend SHALL use Tailwind CSS (v3), PostCSS, and Autoprefixer as devDependencies. A `tailwind.config.js` and `postcss.config.js` MUST exist at `frontend/`. The content array in `tailwind.config.js` MUST include `./src/**/*.{ts,tsx}` so utility classes are purged correctly in production builds.

#### Scenario: Production build completes without CSS errors
- **WHEN** `cd frontend && npm run build` is executed
- **THEN** the build succeeds with exit code 0 and the output bundle contains Tailwind-generated utility CSS

#### Scenario: TypeScript type check passes
- **WHEN** `cd frontend && npx tsc --noEmit` is executed
- **THEN** the command exits with code 0 and reports no type errors

### Requirement: Tailwind directives are the sole source of global styles
`frontend/src/index.css` SHALL contain only `@tailwind base`, `@tailwind components`, and `@tailwind utilities` directives. `App.css` MUST be deleted and its import removed from `App.tsx`. `AppBar.module.css` MUST be deleted and its import removed from the AppBar component.

#### Scenario: No legacy CSS files remain
- **WHEN** the repository is inspected after the change
- **THEN** `frontend/src/App.css` does not exist and `frontend/src/components/AppBar/AppBar.module.css` does not exist

#### Scenario: No inline style props remain on any component
- **WHEN** the source of AppBar, Dashboard, and AddCandidate is inspected
- **THEN** no JSX `style={{...}}` props are present on any element

### Requirement: A consistent design token set is applied across all pages
The `tailwind.config.js` SHALL define or accept Tailwind's default palette. The chosen accent color (indigo) and neutral (slate) MUST be used consistently: indigo for primary buttons, focus rings, and links; slate for backgrounds, borders, and secondary text.

#### Scenario: Primary button uses indigo accent
- **WHEN** the "Add Candidate" button and the form submit button are rendered
- **THEN** they have the indigo background class (`bg-indigo-600` or equivalent) and white text
