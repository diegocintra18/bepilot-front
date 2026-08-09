## ADDED Requirements

### Requirement: Password recovery request

The system SHALL allow a user who cannot remember their password to request a password recovery link by providing their e-mail. The system SHALL send the e-mail to `POST /auth/forgot-password` and SHALL always display the same success message regardless of whether the e-mail is registered, so that the flow does not reveal which e-mails exist.

#### Scenario: Successful recovery request

- **WHEN** the user submits a valid e-mail on the recovery form
- **THEN** the system sends the e-mail to `POST /auth/forgot-password`
- **AND** the system shows the uniform success message (same for registered and unregistered e-mails)
- **AND** the user remains on the recovery page

#### Scenario: Recovery request with invalid e-mail

- **WHEN** the user submits the recovery form with a missing or malformed e-mail
- **THEN** the system blocks submission, does not call the API, and shows an inline validation message for the e-mail field

#### Scenario: Recovery request rejected by the API

- **WHEN** the API rejects the recovery request with a 422 validation error
- **THEN** the system shows the API error message next to the e-mail field

### Requirement: Password reset with token

The system SHALL allow a user to define a new password using the recovery token received by e-mail. The system SHALL submit the token, the new password and the password confirmation to `POST /auth/reset-password`. On success the system SHALL show a success message and a link to the login page. On an invalid, expired or already-used token the system SHALL show the API error message.

#### Scenario: Successful password reset

- **WHEN** the user submits a valid token with a new password of at least 8 characters and a matching confirmation
- **THEN** the system sends `token`, `password` and `passwordConfirmation` to `POST /auth/reset-password`
- **AND** the system shows a success message with a link to the login page
- **AND** the user is not automatically logged in

#### Scenario: Password reset without a token

- **WHEN** the user opens the reset page without a recovery token in the URL
- **THEN** the system explains that the link received by e-mail is required and does not call the API

#### Scenario: Password reset with invalid or expired token

- **WHEN** the API rejects the reset with an invalid/expired/already-used token error
- **THEN** the system shows the API error message and keeps the user on the reset page

#### Scenario: Password reset with invalid fields

- **WHEN** the user submits a new password shorter than 8 characters or a confirmation that does not match
- **THEN** the system blocks submission, does not call the API, and shows inline validation messages

### Requirement: Password recovery entry point

The system SHALL provide a link to the password recovery flow from the login page.

#### Scenario: User reaches the recovery flow from login

- **WHEN** the user is on the login page and activates the "Esqueci minha senha?" link
- **THEN** the system navigates the user to the recovery request page
