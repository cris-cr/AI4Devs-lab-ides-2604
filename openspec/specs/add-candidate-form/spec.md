## Purpose

Add candidate form page. Collects candidate details and an optional CV file, validates inputs client-side, submits to the backend API, and provides success or error feedback before returning the user to the dashboard.

## Requirements

### Requirement: Add candidate form fields
The system SHALL render a form at `/candidates/new` collecting the following fields:
- `firstName` — text input, required
- `lastName` — text input, required
- `email` — email input, required
- `phone` — text input, optional
- `address` — text input, optional
- `education` — textarea, optional
- `workExperience` — textarea, optional
- `cv` — file input, optional (accepts PDF and DOCX)

#### Scenario: Form renders all fields
- **WHEN** the user navigates to `/candidates/new`
- **THEN** all seven text/textarea fields and the file input are rendered

#### Scenario: Required fields are visually indicated
- **WHEN** the form is rendered
- **THEN** `firstName`, `lastName`, and `email` are marked as required (e.g., asterisk or label)

### Requirement: Client-side form validation
The system SHALL validate form inputs before submission. Validation SHALL run on submit. Required fields MUST NOT be empty. The `email` field MUST match a valid email format. Validation errors SHALL be displayed inline next to the field that failed, not as a global alert.

#### Scenario: Submit with empty required fields
- **WHEN** the user submits the form with `firstName`, `lastName`, or `email` empty
- **THEN** submission is prevented and an inline error message appears next to each empty required field

#### Scenario: Submit with invalid email format
- **WHEN** the user submits the form with a value in `email` that is not a valid email address
- **THEN** submission is prevented and an inline error appears next to the email field

#### Scenario: Valid form passes client-side validation
- **WHEN** all required fields are filled with valid values
- **THEN** the form is submitted to the backend without showing validation errors

### Requirement: CV file upload
The system SHALL include a file input that accepts only PDF (`application/pdf`) and DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`) files. The file is optional — submission SHALL succeed without a file. The form SHALL submit as `multipart/form-data` when a file is attached.

#### Scenario: User attaches a PDF file
- **WHEN** the user selects a `.pdf` file and submits the form
- **THEN** the file is included in the request and the backend stores it

#### Scenario: User attaches a DOCX file
- **WHEN** the user selects a `.docx` file and submits the form
- **THEN** the file is included in the request and the backend stores it

#### Scenario: No file selected
- **WHEN** the user submits the form without selecting a file
- **THEN** the form submits successfully and `cvPath` is null on the created record

### Requirement: Submission feedback
The system SHALL display a success confirmation message when the candidate is created. On a server or network error the system SHALL display a user-facing error message. Raw server error details SHALL NOT be exposed to the user. After successful submission the system SHALL navigate the user back to the dashboard.

#### Scenario: Successful submission
- **WHEN** the backend returns HTTP 201
- **THEN** a success message "Candidate added successfully" is shown and the user is redirected to `/`

#### Scenario: Server validation error (400)
- **WHEN** the backend returns HTTP 400
- **THEN** a user-facing error message is displayed; the form remains open so the user can correct the input

#### Scenario: Conflict error (409)
- **WHEN** the backend returns HTTP 409 (duplicate email)
- **THEN** a user-facing error message is displayed indicating the email is already in use

#### Scenario: Network or server error (5xx / no response)
- **WHEN** the request fails due to a network error or a 5xx response
- **THEN** a generic error message is displayed; no raw error details or stack traces are shown

### Requirement: Form navigation
The system SHALL provide a way for the user to cancel adding a candidate and return to the dashboard without submitting the form.

#### Scenario: Cancel navigates back to dashboard
- **WHEN** the user clicks the "Cancel" button or link on the Add Candidate form
- **THEN** the user is navigated to `/` without any API call being made
