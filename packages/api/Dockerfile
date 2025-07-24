# 1) base: node + pg_isready
FROM node:18-alpine AS base
RUN apk add --no-cache postgresql-client
WORKDIR /app
COPY tsconfig.base.json ./

# 2) build: copy in API sources & build
FROM base AS build

# bring in root tsconfig for "extends"
COPY tsconfig.base.json ./tsconfig.base.json

# bring in only the API package manifest and source
COPY packages/api/package.json   ./package.json
COPY packages/api/package-lock.json* ./package-lock.json
COPY packages/api/tsconfig.json  ./tsconfig.json
COPY tsconfig.base.json           ./tsconfig.base.json
COPY packages/api/src            ./src
COPY packages/api/src/openapi.yaml   ./openapi.yaml

# install all deps (dev + prod) so we can compile
RUN npm install --ignore-scripts

# compile TypeScript → dist/
RUN npm run build

# 3) release: prod‑only image
FROM node:18-alpine AS release
RUN apk add --no-cache postgresql-client
WORKDIR /app

# copy compiled code
COPY --from=build /app/dist ./dist

# copy full node_modules, then prune dev‑deps
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --production

# copy config & entrypoint
COPY packages/api/config      ./config
COPY packages/api/scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
