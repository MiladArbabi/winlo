# packages/api/Dockerfile
# 1) base image with just the client
FROM node:18-alpine AS base

# we need pg_isready in entrypoint
RUN apk add --no-cache postgresql-client

WORKDIR /app
COPY package*.json ./

# 2) install deps
FROM base AS deps
RUN npm ci --only=production

# 3) build (we only need node_modules + source to build)
FROM deps AS build
COPY . .
RUN npm run build

# 4) runtime image
FROM node:18-alpine AS release

# pg_isready again
RUN apk add --no-cache postgresql-client

WORKDIR /app
# copy built JS and prod deps
COPY --from=build /app/dist ./dist
COPY --from=deps  /app/node_modules ./node_modules

# entrypoint (migrate, seed, start)
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
