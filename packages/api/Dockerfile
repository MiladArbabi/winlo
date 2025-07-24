# 1) base for both installing
FROM node:18-alpine AS base
RUN apk add --no-cache postgresql-client
WORKDIR /app

# 2) dev-deps: install everything (prod + dev) so we can compile TS
FROM base AS dev-deps
COPY package*.json ./
RUN npm ci

# 3) deps: install only production deps for the final image
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# 4) build: compile TS → JS
FROM dev-deps AS build
COPY . .
RUN npm run build

# 5) release: minimal runtime
FROM node:18-alpine AS release
RUN apk add --no-cache postgresql-client
WORKDIR /app

# copy compiled JS
COPY --from=build /app/dist ./dist
# copy only production deps
COPY --from=deps  /app/node_modules ./node_modules

# our entrypoint will run migrations/seeds then start
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
