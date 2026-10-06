FROM node:22-alpine AS shared-types-build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.22.0 --activate
WORKDIR /shared-types
COPY packages/shared-types/package.json ./
COPY packages/shared-types/tsconfig.json ./
COPY packages/shared-types/src ./src
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.22.0 --activate
WORKDIR /app

ARG VITE_API_BASE_URL=https://gh-skeleton-api-production.up.railway.app
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY apps/admin/ .
COPY --from=shared-types-build /shared-types/dist ./vendor/shared-types/dist
COPY --from=shared-types-build /shared-types/package.json ./vendor/shared-types/package.json
# @gh-skeleton/ui is source-only: link it so its imports resolve from this app's node_modules.
COPY packages/ui/package.json packages/ui/resolver.js packages/ui/resolver.d.ts ./vendor/ui/
COPY packages/ui/src ./vendor/ui/src
RUN node -e "const fs=require('fs');const p='package.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.dependencies['@gh-skeleton/shared-types']='file:./vendor/shared-types';j.dependencies['@gh-skeleton/ui']='link:./vendor/ui';fs.writeFileSync(p,JSON.stringify(j,null,2));"
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/default.conf /etc/nginx/templates/default.conf.template
ENV PORT=80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
