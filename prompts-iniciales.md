# skill creation

/meta-prompt create a agents-specs specification file expanding on the frontend folder structure and best practices how to create code in the frontend folder knowing what we have as stack and considering @openspec/config.yaml as some of its context

# updating config
update @openspec/config.yaml to include reference to use @agent-specs/frontend.md when working on frontend


# initial meta-prompt
/meta-prompt help me create a prompt for /opsx-new in english for this user requirement
```
Como reclutador,
Quiero tener la capacidad de añadir candidatos al sistema ATS,
Para que pueda gestionar sus datos y procesos de selección de manera eficiente.

Criterios de Aceptación:

Accesibilidad de la función: Debe haber un botón o enlace claramente visible para añadir un nuevo candidato desde la página principal del dashboard del reclutador.

Formulario de ingreso de datos: Al seleccionar la opción de añadir candidato, se debe presentar un formulario que incluya los campos necesarios para capturar la información del candidato como nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.

Validación de datos: El formulario debe validar los datos ingresados para asegurar que son completos y correctos. Por ejemplo, el correo electrónico debe tener un formato válido y los campos obligatorios no deben estar vacíos.

Carga de documentos: El reclutador debe tener la opción de cargar el CV del candidato en formato PDF o DOCX.

Confirmación de añadido: Una vez completado el formulario y enviada la información, debe aparecer un mensaje de confirmación indicando que el candidato ha sido añadido exitosamente al sistema.

Errores y manejo de excepciones: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.

Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web.

Notas:

La interfaz debe ser intuitiva y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.

Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.

Tareas Técnicas:

Implementar la interfaz de usuario para el formulario de añadir candidato.

Desarrollar el backend necesario para procesar la información ingresada en el formulario.

Asegurar la seguridad y privacidad de los datos del candidato.
```

additional context to help generate the prompt
- the project doesn't have any notion of authentication and for the time been we are going to accept all the request, without any user_id, addint authentication/signin/signup for the "recruiter" is completely out of scope|
- currentlyt he FE i completely empty, we need to define a homepage that creates the defined dashboard as well, no authentication needed simply start calling the new endpoints and they should accept the requests

### output

/opsx:new Add Candidate feature — full-stack with recruiter dashboard homepage

## User story

As a recruiter, I want to add candidates to the ATS so I can manage their data and track their selection process.

## Scope and constraints

- **No authentication.** There is no login, session, or user identity. Every request is accepted as-is. Do not add any auth middleware, user_id fields, or sign-in flows.
- The frontend is currently a blank CRA scaffold. This change must also deliver a recruiter **dashboard homepage** (`/`) — the entry point from which the Add Candidate action is reachable. Design it as a simple shell (header + nav + main content area) that will host future recruiter features.

## Acceptance criteria

### Application Appbar
- create a basic empty app bar at the top

### Dashboard homepage (`/`)
- Displays a clearly visible "Add Candidate" button/link.
- No login or auth UI of any kind.

### Add Candidate form
Accessible from the dashboard. Collects:
- First name (required)
- Last name (required)
- Email (required, valid format)
- Phone (optional)
- Address (optional)
- Education (optional, free text or structured list)
- Work experience (optional, free text or structured list)
- CV file upload (PDF or DOCX, optional)

### Validation
- Required fields must not be empty on submit.
- Email must match a valid email format.
- Validation errors are shown inline next to each field.

### Submission feedback
- On success: display a confirmation message ("Candidate added successfully").
- On server/network error: display a user-facing error message. Never expose raw error details.

### File upload
- CV upload is optional. Accepted MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- Store the file on the server (local filesystem or a configured path). Do not store binary in the database — store only the file path/reference.

## Backend requirements
- New `Candidate` Prisma model with fields matching the form above plus `cvPath` (String, optional) and standard `createdAt`/`updatedAt`.
- REST endpoint: `POST /api/v1/candidates` — accepts multipart/form-data (fields + optional file).
- REST endpoint: `GET /api/v1/candidates` — returns list of all candidates (for dashboard display).
- Input validation via Zod. Swagger JSDoc on all new routes.
- Follow `agent-specs/backend.md` for layer structure, error handling, and security rules.

## Frontend requirements
- Follow `agent-specs/frontend.md` for layer structure, component conventions, and service patterns.
- New page: `frontend/src/pages/Dashboard/index.tsx` — homepage at route `/`.
- New page: `frontend/src/pages/AddCandidate/index.tsx` — form page at route `/candidates/new`.
- New service: `frontend/src/services/candidate.service.ts` — wraps all candidate API calls.
- New types: `frontend/src/types/candidate.ts` — `Candidate`, `CreateCandidateDto` interfaces.
- Form uses `useReducer` for field state management.
- Responsive layout compatible with modern desktop and mobile browsers.

## Out of scope
- Authentication, authorization, roles, or session management of any kind.
- Autocomplete for education/work experience fields (noted for future iteration).
- Candidate editing or deletion.
- Pagination on the candidate list (acceptable for now given expected small volume).



# Style metaprompt
/meta-prompt introduction of tailwind framework for the frontend folder + style bump,

goal is to make the UI look better, i dont have any preference in color palette

strict requirements:
- UI must be response
- implement ADA

## output
/opsx:new  Introduce Tailwind CSS into the existing frontend/ directory and restyle all current UI components and pages to produce a polished, production-quality interface. This is a style-only change — no new features, no business logic changes, no route changes.

Tech context:

Stack: React 18 + TypeScript 4.9, Create React App, running on port 3000
Existing pages: Dashboard (/) and AddCandidate (/candidates/new)
Existing components: AppBar
Current styling: plain inline styles and CSS Modules — both should be replaced by Tailwind utility classes
Follow agent-specs/frontend.md for component and file conventions
Design requirements:

Color palette: Choose a professional, neutral palette appropriate for an HR/recruitment SaaS product. A suggestion: slate/gray neutrals with a single blue or indigo accent. No strong preference — use good judgment and be consistent across all pages.
Responsive layout: All pages and components MUST be fully responsive. Use Tailwind's sm:, md:, lg: breakpoint prefixes. The layout must work correctly on mobile (≥320px), tablet (≥768px), and desktop (≥1280px).
ADA / WCAG 2.1 AA compliance (strict requirement):
All interactive elements (buttons, links, inputs) MUST have visible focus rings (focus-visible:ring-*)
Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (verify against chosen palette)
All form inputs MUST have associated <label> elements (already present — preserve them)
All form fields MUST have aria-required="true" on required inputs
Inline validation errors MUST use role="alert" and be associated to their field via aria-describedby
The CV file input MUST include an aria-label describing accepted formats
The <AppBar> <header> element MUST include role="banner"
Page landmarks: <main> on each page, <nav> if navigation is added
All icon-only elements (if any) MUST have aria-label or aria-hidden as appropriate
Scope of changes:

Tailwind setup — Install and configure Tailwind CSS for CRA (tailwindcss, postcss, autoprefixer). Add tailwind.config.js and postcss.config.js. Update frontend/src/index.css to include the Tailwind directives.

AppBar — Restyle with Tailwind. Remove AppBar.module.css. Add role="banner".

Dashboard page — Restyle: header area with "Add Candidate" CTA button, candidate list as a clean card or table layout, empty state with an illustrative message, error state with an alert style, loading skeleton or spinner.

AddCandidate page — Restyle: two-column form layout on desktop, single-column on mobile. Field labels above inputs. Required field indicators (*). Inline error messages with role="alert" and aria-describedby. Submit and Cancel buttons with clear visual hierarchy.

Global styles — Remove or migrate App.css. Set a consistent base font, spacing scale, and focus-ring style in tailwind.config.js or index.css.

Out of scope:

No new pages, routes, or features
No changes to backend code
No changes to existing test files (update only if a component's rendered structure changes enough to break a test — fix the test, don't remove it)
Deliverables checklist:

tailwind.config.js and postcss.config.js at frontend/
Updated frontend/src/index.css with Tailwind directives
All inline styles and CSS Module references removed from components and pages
All ADA requirements listed above implemented and verifiable
cd frontend && npm run build succeeds with no errors
cd frontend && npx tsc --noEmit passes with no type errors