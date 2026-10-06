# Project Context — GH Skeleton API

| | |
|---|---|
| Project | GH Skeleton API (`apps/api`, package `gh-skeleton-api`) |
| Type | Multi-tenant SaaS backend skeleton |
| Framework | NestJS 11, TypeScript |
| Database | MySQL 8 |
| ORM | Prisma 7 with the MariaDB driver adapter |

## Purpose

A starting point for business applications. It ships the parts every multi-tenant SaaS needs and no business domain: add domain modules (for example products or orders) on top of it.

The API serves the admin dashboard (`apps/admin`) and the registration form on the landing page (`apps/landing`).

## What is included

- Authentication: login, registration, JWT
- Merchants: the tenant entity, with logo
- Users: merchant-scoped, with avatar and soft delete
- RBAC: flat roles and permissions
- Uploads: local disk or S3
- Notifications: per user
- Settings: profile, password, email, account deactivation, site settings

## What is not included

- Business domain modules of any kind
- Outlet or branch scoping: the only tenant boundary is the merchant
- Background jobs, queues, email delivery
- Rate limiting

## Engineering principles

- Modular monolith: one NestJS module per area
- Thin controllers; business logic in services
- DTO validation on every input
- Database access only through `PrismaService`
- Every tenant-owned query is scoped by `merchant_id`
- No premature abstraction: add structure when a second use appears

## Related documents

- [architecture.md](architecture.md) — modules, layers, request pipeline
- [domain-rules.md](domain-rules.md) — tenancy, RBAC, user, and upload rules
- [../api/api-conventions.md](../api/api-conventions.md) — request and response conventions
- [../database/db-notes.md](../database/db-notes.md) — tables and database conventions
- [../runbooks/api-env-guide.md](../runbooks/api-env-guide.md) — environment variables
