# API Conventions

## Style

- REST, JSON only
- Resource-oriented routes
- Global prefix `/api/v1`
- Swagger UI at `/docs`; document every DTO and mark protected routes with bearer auth

## Controllers

- Thin: DTO in, service call, result out
- No business logic and no Prisma access

## DTOs and validation

- All input arrives through a DTO with `class-validator` decorators.
- The global `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted`, and `transform`: unknown fields are rejected, and values are converted to the DTO's types.
- A validation failure returns HTTP 400 with code `VALIDATION_ERROR`.

## Response shape

`TransformInterceptor` wraps every successful response:

```json
{ "success": true, "data": {} }
```

`HttpExceptionFilter` shapes every error:

```json
{ "success": false, "message": "...", "code": "ERROR_CODE" }
```

## Pagination

- Accept `PaginationDto` through `@Query()`: `page` and `limit`.
- Return `{ data, meta }` from the service, where `meta` is `{ total, page, limit, totalPages }` (`PaginationMeta` in `@gh-skeleton/shared-types`).
- After wrapping, the wire shape is:

```json
{ "success": true, "data": { "data": [], "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 } } }
```

## Authentication and authorization

- Every route requires `Authorization: Bearer <token>` unless it is marked `@Public()`.
- Permission checks use `@UseGuards(PermissionGuard)` on the controller and `@RequirePermission('resource.action')` on the handler.
- Never accept `merchant_id` from the client. Read it from `@CurrentUser('merchant_id')`.
