# Admin App — User Flows

Flows and acceptance criteria for `apps/admin`, covering what the app does today. Scope and module list are in [spec-summary.md](spec-summary.md).

## Contents

1. [Authentication](#1-authentication)
2. [Navigation and access](#2-navigation-and-access)
3. [Merchants](#3-merchants)
4. [Users](#4-users)
5. [Roles and permissions](#5-roles-and-permissions)
6. [Notifications](#6-notifications)
7. [Profile and settings](#7-profile-and-settings)

Conventions used by every flow:

- A failed request shows an error toast with the API's message.
- A blocking request shows the global loading dialog until it finishes.
- A field that fails validation shows its message under the field, and the form is not submitted.

---

## 1. Authentication

### 1.1 Log in

**Actor:** any user with an active account. **Route:** `/`

1. The user enters email and password and submits.
2. The app calls `POST /api/v1/auth/login`.
3. On success the app stores the session and opens `/landing`.

**Acceptance criteria**

- Email must be a valid address and password must not be empty; otherwise the request is not sent.
- Wrong credentials show an error toast and the user stays on the login page.
- An inactive account cannot log in.
- A signed-in user who opens `/` or `/register` is redirected to `/landing`.

### 1.2 Register

**Actor:** a new customer. **Route:** `/register`

1. The user fills in two steps: User Info, then Merchant Info.
2. The app calls `POST /api/v1/auth/register`.
3. The API creates the merchant and the user together and assigns the `owner` role.

**Acceptance criteria**

- Both steps are validated before submission.
- If the API rejects the registration, nothing is created: merchant and user are written in one transaction.
- Email and username only need to be unique within the merchant.

The landing page (`apps/landing`) has a shorter form that calls the same endpoint.

### 1.3 Log out

1. The user opens the profile menu and chooses Logout.
2. The app clears the stored session and returns to the login page.

**Acceptance criteria**

- After logout, opening any signed-in route redirects to login.

### 1.4 Session expiry

1. A request returns 401.
2. The app shows a confirmation dialog.
3. When the user confirms, the session is cleared and the app returns to login.

---

## 2. Navigation and access

### 2.1 Sidebar

- The sidebar lists Dashboard, Merchants, Users, Roles, and Permissions.
- An item is shown only when the user holds at least one of that module's permissions.
- The sidebar collapses to icons on desktop and opens as a drawer on mobile.

### 2.2 Route guard

- A signed-out user who opens a signed-in route is redirected to login.
- A signed-in user who opens a route without the required permission is redirected to `/403`.
- An unknown path shows `/404`.

### 2.3 Permission-based actions

- Create, edit, and delete buttons appear only with the matching permission code (`<resource>.create`, `.update`, `.delete`).
- Hiding a button is a convenience. The API enforces the permission on every request.

---

## 3. Merchants

**Route:** `/merchants`. **Permissions:** `merchants.read`, `.create`, `.update`, `.delete`, `.detail`.

### 3.1 List merchants

- The table shows logo, name, and creation date, with pagination.
- An empty result shows an empty message in the table.

### 3.2 Create a merchant

1. The user opens the create page and enters name, phone, and address.
2. The slug is generated from the name and cannot be edited.
3. Optionally the user picks a logo image.
4. On save the app creates the merchant, then attaches the logo, then returns to the list.

**Acceptance criteria**

- Name, slug, phone, and address are required.
- The logo accepts JPG, PNG, or WebP up to 5 MB.

### 3.3 Edit a merchant

- The form opens with the current values and logo.
- The logo can be replaced or removed.

### 3.4 View a merchant

- The detail page shows the merchant's fields and logo, read-only.

### 3.5 Delete a merchant

1. The user chooses delete on a row.
2. A confirmation dialog appears.
3. On confirm the merchant is deleted and the list reloads.

---

## 4. Users

**Route:** `/user`. **Permissions:** `user.read`, `.create`, `.update`, `.delete`.

Every user operation is limited to the signed-in user's merchant. The API ignores any merchant supplied by the client.

### 4.1 List users

- The table is paginated and shows only users of the current merchant.

### 4.2 Create a user

1. The user enters username, name, email, and password, and sets the active status.
2. Optionally the user picks an avatar image.
3. On save the account is created and the app returns to the list.

**Acceptance criteria**

- Email and username must be unique within the merchant.

### 4.3 Edit a user

- The form opens with the current values, including the avatar image, which can be replaced or removed.

### 4.4 View a user and assign roles

1. The detail page shows the user's fields and current roles.
2. The user opens the assign-role dialog, picks a role, and confirms.
3. The role list on the detail page updates.

**Acceptance criteria**

- A user can hold several roles. Effective permissions are the union of all of them.
- A role can be revoked from the detail page, after a confirmation dialog.

### 4.5 Delete a user

- Delete asks for confirmation.
- The account is deactivated, not removed: it can no longer log in.

---

## 5. Roles and permissions

Roles and permissions are global: they are shared by all merchants.

### 5.1 Roles

**Route:** `/role`. **Permissions:** `role.*`.

- List, create, edit, and delete roles.
- The detail page lists the role's permissions and lets the user attach or detach them.
- Deleting a role asks for confirmation.

### 5.2 Permissions

**Route:** `/permission`. **Permissions:** `permission.read`, `.create`, `.delete`.

- List, create, and delete permission codes.
- A code uses the form `<resource>.<action>`, for example `user.create`.

**Acceptance criteria**

- A new code has no effect until it is attached to a role and an API handler requires it.

---

## 6. Notifications

**Route:** `/notification`

1. The header bell opens a popover with recent notifications; the page shows all notifications for the signed-in user.
2. The user marks one notification as read with "Mark read", or all of them with "Mark all as read".

**Acceptance criteria**

- Unread notifications are visually distinct from read ones.
- With no notifications the page shows an empty state.
- A user only ever sees their own notifications.

---

## 7. Profile and settings

### 7.1 View profile

**Route:** `/profile`. Shows the signed-in user's details, read-only.

### 7.2 Settings menu

**Route:** `/settings`. Lists the settings pages the user has permission to open.

### 7.3 Edit profile

- The user updates their own profile fields.
- The email field is shown but disabled; it is changed through 7.5.

### 7.4 Change password

1. The user enters the current password, a new password, and its confirmation.
2. On success a toast confirms the change.

**Acceptance criteria**

- The new password needs at least 8 characters with uppercase, lowercase, and a number.
- The confirmation must match the new password.

### 7.5 Change email

The page has two steps.

1. **Request verification.** The page shows the current email. The user enters the new email and submits (`POST /api/v1/settings/email/verify`).
2. **Verify code.** The user enters the verification code, and the email is updated (`PUT /api/v1/settings/email`).

### 7.6 Deactivate account

1. The user ticks the confirmation box, enters their password, and optionally gives a reason.
2. A confirmation dialog appears.
3. On confirm the account is deactivated and the app returns to the login page.

**Acceptance criteria**

- The request is not sent without the confirmation box and the password.

### 7.7 Site settings

- The user saves personal preferences, including the dark mode and notification toggles.
