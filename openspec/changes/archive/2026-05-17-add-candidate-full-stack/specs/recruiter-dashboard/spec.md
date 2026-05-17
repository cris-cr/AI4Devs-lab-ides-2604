## ADDED Requirements

### Requirement: Application shell with app bar
The system SHALL render a persistent app bar at the top of every page. The app bar SHALL display the application name ("LTI – Talent Tracker"). The app bar SHALL be present on all routes without requiring a login.

#### Scenario: App bar visible on dashboard
- **WHEN** the user navigates to `/`
- **THEN** the app bar is rendered at the top of the page with the application name visible

#### Scenario: App bar visible on add candidate form
- **WHEN** the user navigates to `/candidates/new`
- **THEN** the app bar is rendered at the top of the page

### Requirement: Recruiter dashboard homepage
The system SHALL render a dashboard page at route `/`. The dashboard SHALL display a list of all existing candidates fetched from `GET /api/v1/candidates`. The dashboard SHALL include a clearly visible "Add Candidate" action that navigates to `/candidates/new`. No authentication or login UI SHALL be present.

#### Scenario: Dashboard loads with existing candidates
- **WHEN** the user visits `/` and candidates exist in the system
- **THEN** the dashboard displays the list of candidates

#### Scenario: Dashboard shows empty state
- **WHEN** the user visits `/` and no candidates exist
- **THEN** the dashboard displays a message indicating no candidates have been added yet

#### Scenario: Add Candidate entry point is visible
- **WHEN** the user visits `/`
- **THEN** an "Add Candidate" button or link is rendered and clicking it navigates to `/candidates/new`

#### Scenario: Data fetch error is communicated
- **WHEN** the user visits `/` and the API call to list candidates fails
- **THEN** the dashboard displays a user-facing error message; no raw error details are exposed

### Requirement: Client-side routing
The system SHALL use React Router to manage navigation between `/` and `/candidates/new` without full page reloads. Unknown routes SHALL redirect to the dashboard at `/`.

#### Scenario: Direct navigation to dashboard
- **WHEN** the user enters `/` in the browser address bar
- **THEN** the Dashboard page is rendered

#### Scenario: Direct navigation to add candidate form
- **WHEN** the user enters `/candidates/new` in the browser address bar
- **THEN** the Add Candidate form page is rendered

#### Scenario: Unknown route redirects to dashboard
- **WHEN** the user navigates to an undefined route (e.g., `/foo`)
- **THEN** the application renders the Dashboard page
