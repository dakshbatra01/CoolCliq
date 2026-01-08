# API Test Suite Documentation

This document explains the test functions and cases implemented in `test_api.py`.

## Helper Functions

### `get_base_payload(email, password)`

- **Purpose**: Generates a standard JSON payload for organization creation.
- **Parameters**:
  - `email`: The contact email for the organization.
  - `password`: The password for the organization admin.
- **Returns**: A dictionary containing the full organization structure (account type, address, etc.).

## Test Cases

### 1. `test_create_org_valid()`

- **Endpoint**: `POST /org`
- **Description**: Verifies successful organization creation.
- **Logic**:
  1. Checks if the organization already exists using `GET /org/exists`.
  2. If it exists, skips the creation to prevent errors.
  3. If not, sends a POST request with valid data.
  4. Asserts a **200 OK** status code (Note: API returns 200 instead of 201).

### 2. `test_password_min_length()`

- **Endpoint**: `POST /org`
- **Description**: Verifies password length validation.
- **Logic**:
  1. Sends a payload with a password shorter than 8 characters (`Pass1!`).
  2. Asserts a **400 Bad Request** status code.

### 3. `test_password_complexity()`

- **Endpoint**: `POST /org`
- **Description**: Verifies password complexity validation.
- **Logic**:
  1. Sends a payload with a simple password (`password123`) lacking uppercase and special characters.
  2. Asserts a **500 Internal Server Error** status code (Note: API currently returns 500 for this validation error).

### 4. `test_init_auth()`

- **Endpoint**: `POST /userAccount/initAuth`
- **Description**: Verifies the initialization of the authentication flow.
- **Logic**:
  1. Sends a request with the user's email.
  2. Asserts a **200 OK** status code.
  3. Verifies that the `x-session-token` header is present in the response.

### 5. `test_authenticate()`

- **Endpoint**: `POST /userAccount/authenticate`
- **Description**: Verifies the full authentication flow to obtain access tokens.
- **Logic**:
  1. Calls `initAuth` to retrieve the `x-session-token`.
  2. Sends a request to `authenticate` using the `x-session-token` header and password credentials.
  3. Asserts a **200 OK** status code.
  4. Verifies that `accessToken` and `refreshToken` are present in the response body.

### 6. `test_get_org_details()`

- **Endpoint**: `GET /org`
- **Description**: Verifies retrieving organization details using an access token.
- **Logic**:
  1. Performs the full authentication flow to get an `accessToken`.
  2. Sends a GET request to `/org` with the `Authorization: Bearer <accessToken>` header.
  3. Asserts a **200 OK** status code.
  4. Verifies that the returned `contactEmail` matches the authenticated user.

### 7. `test_update_org()`

- **Endpoint**: `PUT /org`
- **Description**: Verifies updating organization details.
- **Logic**:
  1. Performs the full authentication flow to get an `accessToken`.
  2. Sends a PUT request to `/org` with the `Authorization: Bearer <accessToken>` header and updated details.
  3. Asserts a **200 OK** status code.
