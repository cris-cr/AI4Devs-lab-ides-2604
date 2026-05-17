## ADDED Requirements

### Requirement: AppBar is responsive and accessible
The AppBar component SHALL be restyled with Tailwind utility classes. The root element MUST be a `<header>` with `role="banner"`. The layout MUST be responsive: the navigation area stacks vertically on mobile and is horizontal on desktop.

#### Scenario: AppBar renders with banner role
- **WHEN** the AppBar component is rendered
- **THEN** a `<header>` element with `role="banner"` is present in the DOM

#### Scenario: AppBar displays the application name
- **WHEN** the AppBar is rendered at any viewport width
- **THEN** the text "LTI – Talent Tracker" is visible

### Requirement: Dashboard page is responsive with card layout and action button
The Dashboard page SHALL render a page `<main>` landmark. On desktop (≥ 1280 px) candidate entries SHALL be displayed as a table or list of cards. On mobile (≥ 320 px) the layout SHALL collapse to a single-column list. An "Add Candidate" CTA button SHALL be visually prominent (primary button style). The empty state and error state SHALL each render a distinct, styled message.

#### Scenario: Dashboard renders main landmark
- **WHEN** the Dashboard page is rendered
- **THEN** a `<main>` element is present in the DOM

#### Scenario: Dashboard shows empty state message when no candidates exist
- **WHEN** the candidate list API returns an empty array
- **THEN** a message indicating no candidates are present is displayed

#### Scenario: Dashboard shows error state when API call fails
- **WHEN** the candidate list API call rejects
- **THEN** an error message is displayed using an alert-style visual treatment

#### Scenario: Add Candidate button links to the add-candidate route
- **WHEN** the Dashboard is rendered
- **THEN** an element linking to `/candidates/new` is present and styled as a primary action button

### Requirement: AddCandidate form is responsive with two-column layout on desktop
The AddCandidate page SHALL render a page `<main>` landmark. The form fields SHALL be arranged in a two-column grid on screens ≥ 768 px and a single column on smaller screens. Each field MUST have a visible `<label>` directly associated via `htmlFor`/`id`. Required fields MUST display a visual indicator (e.g., `*`).

#### Scenario: AddCandidate renders main landmark
- **WHEN** the AddCandidate page is rendered
- **THEN** a `<main>` element is present in the DOM

#### Scenario: All form inputs have associated labels
- **WHEN** the AddCandidate form is rendered
- **THEN** each `<input>` and `<textarea>` element has an associated `<label>` with matching `htmlFor`/`id`

### Requirement: All interactive elements meet WCAG 2.1 AA focus and contrast requirements
Every button, link, and form input SHALL have a visible focus ring rendered via `focus-visible:ring-*` Tailwind classes. Focus rings SHALL NOT be suppressed with `outline: none` without a replacement visible indicator. Color contrast for text on its background MUST be ≥ 4.5:1 for body text and ≥ 3:1 for large text (≥ 18 pt or ≥ 14 pt bold).

#### Scenario: Submit button has visible focus ring
- **WHEN** the submit button receives keyboard focus
- **THEN** a visible focus ring is rendered around the button (verified via `focus-visible:ring` class presence)

#### Scenario: Cancel button has visible focus ring
- **WHEN** the cancel button receives keyboard focus
- **THEN** a visible focus ring is rendered around the button

### Requirement: Form inputs include ARIA attributes for accessibility
All required inputs in AddCandidate SHALL have `aria-required="true"`. Inline validation error messages SHALL use `role="alert"` and SHALL be linked to their field via `aria-describedby`. The CV file input SHALL have an `aria-label` describing accepted formats.

#### Scenario: Required fields declare aria-required
- **WHEN** the AddCandidate form is rendered
- **THEN** inputs for First Name, Last Name, and Email each have `aria-required="true"`

#### Scenario: Validation error is announced to screen readers
- **WHEN** a required field is submitted empty
- **THEN** the error message element has `role="alert"` and the input's `aria-describedby` references that element's `id`

#### Scenario: CV file input has descriptive aria-label
- **WHEN** the AddCandidate form is rendered
- **THEN** the file input has an `aria-label` that mentions accepted file formats (PDF, DOCX)
