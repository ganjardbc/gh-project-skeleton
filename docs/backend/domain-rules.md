# Domain Rules

Rules the API enforces today. A new module must follow the tenancy and RBAC rules.

## Tenancy

- The tenant is the **merchant**. Every user belongs to exactly one merchant (`users.merchant_id`).
- All tenant-owned data is scoped by `merchant_id`, taken from the authenticated user.
- `merchants.slug` is globally unique.
- `users.username` is unique **per merchant**. `users.email` is unique **across all merchants**.
- `roles` and `permissions` are global tables with no `merchant_id`.
- Deleting a merchant cascades to its users.

## Registration

- Creates the merchant and its first user in one transaction.
- Assigns the `owner` role, which must already exist: run the seed before the first registration.

## Users

- Deleting a user is a soft delete: `is_active` is set to `false`.
- An inactive user cannot log in and is rejected by the JWT guard.
- Passwords are stored as hashes (`password_hash`), never in plain text.

## RBAC

- The model is flat. `user_roles` links a user to a role with no merchant or outlet scope.
- A user's effective permissions are the union across all of their roles.
- Access is granted by **permission code**, never by role name.
- Permission codes use `<resource>.<action>`, for example `user.create`, `merchants.read`, `role.update`.
- A code used in `@RequirePermission` must exist in `permissions` and be attached to a role, or no one can call the handler.
- Seeded roles: `admin`, `owner`, `viewer`. The seeded permission list is in `apps/api/prisma/seed.ts`.

Known gap: the `settings.*` codes used by `SettingsController` are not in the seed.

## Uploads

- Files go through a storage driver chosen by `STORAGE_DRIVER`: `local` or `s3`.
- Merchant logos and user avatars reference `uploads.id` (`logo_upload_id`, `avatar_upload_id`).
- Deleting an upload sets those references to `NULL`.
- Read access uses signed URLs.

## Notifications

- A notification belongs to one user and is deleted with that user.
- Read state is per notification (`is_read`); a user can mark one or all as read.

## Audit fields

- Tables with `created_by` / `updated_by` take the values from the authenticated user, never from client input.
