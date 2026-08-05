## Purpose

Allows students to register, log in, restore and terminate an authenticated session, and protects private areas of the application by integrating with the BePilot API authentication contract.

## ADDED Requirements

### Requirement: Student registration

The system SHALL allow a student to create an account by providing full name, e-mail, password and password confirmation, and SHALL send the credentials to the BePilot API signup endpoint. The system SHALL validate the form before submitting and SHALL surface API validation errors to the user. On success the system SHALL establish an authenticated session and redirect the student to the private area.

#### Scenario: Successful registration

- **WHEN** the student submits the registration form with valid full name, e-mail, password and matching password confirmation
- **THEN** the system sends the credentials to `POST /auth/signup`
- **AND** the system stores the returned token and user session locally
- **AND** the system redirects the student to the private area

#### Scenario: Registration with invalid fields

- **WHEN** the student submits the registration form with missing, empty or malformed fields (invalid e-mail, password too short, mismatched confirmation)
- **THEN** the system blocks submission, does not call the API, and shows inline validation messages for each invalid field

#### Scenario: Registration rejected by the API

- **WHEN** the API rejects the signup with a 422 validation error (for example, e-mail already registered)
- **THEN** the system shows the API error messages next to the corresponding fields
- **AND** the system keeps the student on the registration page with the entered values preserved

### Requirement: Student login

The system SHALL allow a student to authenticate with e-mail and password against `POST /auth/login`. The system SHALL validate the form before submitting, SHALL disable submission while a request is in flight, and SHALL display credential errors returned by the API.

#### Scenario: Successful login

- **WHEN** the student submits valid e-mail and password
- **THEN** the system sends the credentials to `POST /auth/login`
- **AND** the system stores the returned token and user session locally
- **AND** the system redirects the student to the private area

#### Scenario: Invalid credentials

- **WHEN** the API returns 401 for the submitted credentials
- **THEN** the system displays the API error message (e.g. invalid credentials)
- **AND** the system keeps the student on the login page

#### Scenario: Login request in flight

- **WHEN** the student submits the login form and the request has not yet completed
- **THEN** the system disables the submit control and shows a loading state to prevent duplicate submissions

### Requirement: Persistent authenticated session

The system SHALL persist the session across page reloads. After a reload, the system SHALL restore the current user from the stored token, verifying it against `GET /account/profile`.

#### Scenario: Session restored after reload

- **WHEN** the student reloads the page while an authenticated session is stored locally
- **THEN** the system restores the user profile from `GET /account/profile` using the stored token
- **AND** the student remains authenticated without needing to log in again

#### Scenario: Stored token is invalid or expired

- **WHEN** the stored token is rejected by `GET /account/profile` (401)
- **THEN** the system clears the local session state
- **AND** the system treats the student as unauthenticated and redirects to the login page

#### Scenario: No session stored

- **WHEN** no session is stored locally
- **THEN** the system treats the student as unauthenticated and does not call the profile endpoint

### Requirement: Logout

The system SHALL allow an authenticated student to end the session, which SHALL notify the API via `POST /account/logout` and SHALL clear all local authentication state.

#### Scenario: Successful logout

- **WHEN** an authenticated student triggers logout
- **THEN** the system calls `POST /account/logout` with the current token
- **AND** the system clears the local session regardless of the API response
- **AND** the student is redirected to the login page

### Requirement: Route protection

The system SHALL restrict private routes to authenticated students and SHALL redirect unauthenticated students to the login page. The system SHALL redirect authenticated students away from the login and registration pages into the private area.

#### Scenario: Unauthenticated student accesses a private route

- **WHEN** an unauthenticated student navigates to a private route
- **THEN** the system redirects the student to the login page

#### Scenario: Authenticated student accesses the login page

- **WHEN** an authenticated student navigates to `/login` or `/register`
- **THEN** the system redirects the student to the private area

### Requirement: Authenticated user information

The system SHALL expose the current authenticated user (identifier, full name, e-mail, user type and initials) globally, and SHALL NOT require individual pages to query the API for it.

#### Scenario: Pages access the current user

- **WHEN** any authenticated page or component reads the current user
- **THEN** the system returns the stored user profile without issuing a new API request

### Requirement: Error handling for authentication requests

The system SHALL normalize authentication request failures into user-facing messages for: API validation errors (422), unauthorized/expired token (401), and network/connection failures.

#### Scenario: Network failure

- **WHEN** an authentication request fails due to a network or connection problem
- **THEN** the system displays a user-friendly error message indicating the connection could not be completed
- **AND** the student is able to retry the submission

#### Scenario: Unauthorized token during an authenticated request

- **WHEN** an authenticated request returns 401
- **THEN** the system clears the local session
- **AND** the system redirects the student to the login page

### Requirement: Authorization header injection

The system SHALL include the stored token as a `Bearer` authorization header on authenticated API requests.

#### Scenario: Authenticated API request carries the token

- **WHEN** the system performs an authenticated API request and a session exists
- **THEN** the request includes an `Authorization: Bearer <token>` header
