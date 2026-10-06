# API Environment Guide

Environment variables for `apps/api`. The template is `apps/api/.env.example`.

## Quick setup

```bash
cd apps/api
cp .env.example .env
```

Edit `.env`, then check that the database is reachable:

```bash
mysql -u root -h localhost -P 3306 db_gh_skeleton
```

## Variables the API reads

### Core

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | MySQL connection string | — | Yes |
| `JWT_SECRET` | Secret used to sign JWTs | Insecure development fallback | Yes |
| `PORT` | HTTP port | `3030` | No |
| `CORS_ORIGIN` | Allowed origins, comma-separated | All origins when empty | Yes in production |
| `APP_URL` | Public base URL of the API, used to build local upload URLs | `http://localhost:3030` | With `STORAGE_DRIVER=local` outside localhost |

`DATABASE_URL` format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

Always set `JWT_SECRET`. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Uploads

| Variable | Description | Required |
|---|---|---|
| `STORAGE_DRIVER` | `local` or `s3` | Yes |
| `MAX_FILE_SIZE` | Maximum upload size in bytes (5 MB is `5242880`) | No |
| `ALLOWED_MIME_TYPES` | Comma-separated MIME types | No |
| `SIGNED_URL_EXPIRY` | Signed URL lifetime in seconds | No |

With `STORAGE_DRIVER=s3`, also set:

| Variable | Description |
|---|---|
| `AWS_REGION` | Bucket region |
| `AWS_ACCESS_KEY_ID` | Access key |
| `AWS_SECRET_ACCESS_KEY` | Secret key |
| `S3_BUCKET_NAME` | Bucket name |
| `S3_ENDPOINT` | Optional. Custom endpoint for S3-compatible services such as MinIO |

With `STORAGE_DRIVER=local`, files are written to `apps/api/uploads/` and served at `/uploads/local`. Use it for development only.

## Variables in `.env.example` that the code does not read

These appear in the template but nothing in `apps/api/src` uses them. Changing them has no effect.

| Variable | Actual behavior |
|---|---|
| `JWT_EXPIRES_IN` | Token lifetime is fixed at `7d` in `src/auth/auth.module.ts` |
| `API_PREFIX`, `API_VERSION` | The prefix is fixed at `api/v1` in `src/main.ts` |
| `NODE_ENV` | Not read by application code |
| `LOG_LEVEL` | Not read |
| `RATE_LIMIT_TTL`, `RATE_LIMIT_MAX` | Rate limiting is not implemented |

## Example

```env
DATABASE_URL="mysql://root:@localhost:3306/db_gh_skeleton"
JWT_SECRET="replace-with-a-generated-secret"
PORT=3000
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
STORAGE_DRIVER=local
```

`5173` is the admin dev server and `5174` is the landing dev server. The admin's `VITE_API_BASE_URL` must point at the same port as `PORT`.

## Security

- Never commit `.env`.
- Use a random `JWT_SECRET` of at least 32 bytes in production.
- List exact origins in `CORS_ORIGIN` in production; an empty value allows every origin.
- Use a database user with only the privileges the API needs.
- Use `STORAGE_DRIVER=s3` in production.

## Checklist

- [ ] `apps/api/.env` exists
- [ ] `DATABASE_URL` points at an existing database
- [ ] `JWT_SECRET` is set
- [ ] `CORS_ORIGIN` includes the admin and landing URLs
- [ ] `STORAGE_DRIVER` is set, with the S3 variables if it is `s3`
- [ ] Migrations and seed have run: `pnpm db:migrate && pnpm db:seed`

## Troubleshooting

**Database connection failed**

```bash
mysql -u root -h localhost -P 3306 db_gh_skeleton
mysql -u root -e "SHOW DATABASES LIKE 'db_gh_skeleton';"
```

**Port already in use**

```bash
lsof -i :3030
```

Or set a different `PORT` in `.env`.

**Registration fails with a missing role**

The `owner` role is created by the seed. Run `pnpm db:seed`.
