## ADDED Requirements

### Requirement: Candidate data model
The system SHALL persist candidate records in a PostgreSQL database via Prisma. Each candidate SHALL have: `id` (auto-increment PK), `firstName` (required), `lastName` (required), `email` (required, unique), `phone` (optional), `address` (optional), `education` (optional), `workExperience` (optional), `cvPath` (optional, stores filesystem path to uploaded CV), `createdAt`, `updatedAt`.

#### Scenario: Candidate record created with all fields
- **WHEN** a valid candidate payload including all optional fields is submitted
- **THEN** a record is persisted with all supplied values and a generated `id`, `createdAt`, and `updatedAt`

#### Scenario: Candidate record created with only required fields
- **WHEN** a payload with only `firstName`, `lastName`, and `email` is submitted
- **THEN** a record is persisted with optional fields set to `null`

#### Scenario: Duplicate email rejected at the data layer
- **WHEN** a candidate with an already-registered email is created
- **THEN** the service throws an error with `statusCode: 409`

### Requirement: Create candidate endpoint
The system SHALL expose `POST /api/v1/candidates` accepting `multipart/form-data`. Text fields SHALL be validated via Zod. An optional CV file (PDF or DOCX, max 5 MB) MAY be included. On success the endpoint SHALL return HTTP 201 with the created candidate JSON. The endpoint SHALL NOT require any authentication header.

#### Scenario: Valid candidate with CV file created
- **WHEN** a `POST /api/v1/candidates` request is sent with valid text fields and a PDF file
- **THEN** the response is HTTP 201, the candidate JSON is returned, and `cvPath` contains the server-side file path

#### Scenario: Valid candidate without CV file created
- **WHEN** a `POST /api/v1/candidates` request is sent with valid text fields and no file
- **THEN** the response is HTTP 201 and `cvPath` is `null`

#### Scenario: Missing required fields rejected
- **WHEN** `firstName`, `lastName`, or `email` is absent or empty
- **THEN** the response is HTTP 400 with `{ error: "Validation failed", details: [...] }`

#### Scenario: Invalid email format rejected
- **WHEN** the `email` field does not match a valid email format
- **THEN** the response is HTTP 400 with `{ error: "Validation failed", details: [...] }`

#### Scenario: Unsupported file type rejected
- **WHEN** a file with a MIME type other than `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document` is uploaded
- **THEN** the response is HTTP 400 with `{ error: "Only PDF and DOCX files are accepted" }`

#### Scenario: File exceeding size limit rejected
- **WHEN** a file larger than 5 MB is uploaded
- **THEN** the response is HTTP 400 with `{ error: "File too large" }`

#### Scenario: Duplicate email conflict
- **WHEN** a candidate with an already-existing email is submitted
- **THEN** the response is HTTP 409 with `{ error: "A candidate with that email already exists" }`

### Requirement: List candidates endpoint
The system SHALL expose `GET /api/v1/candidates` returning an array of all candidate records ordered by `createdAt` descending. The endpoint SHALL return HTTP 200 with a JSON array (empty array if no candidates exist). The endpoint SHALL NOT require any authentication header.

#### Scenario: Candidates exist
- **WHEN** `GET /api/v1/candidates` is called and candidates are present
- **THEN** the response is HTTP 200 with a non-empty JSON array ordered newest first

#### Scenario: No candidates exist
- **WHEN** `GET /api/v1/candidates` is called and no candidates are present
- **THEN** the response is HTTP 200 with an empty JSON array `[]`
