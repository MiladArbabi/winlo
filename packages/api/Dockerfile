# packages/api/Dockerfile
FROM node:18-alpine

RUN apk add --no-cache postgresql-client   # for pg_isready
RUN apk add --no-cache postgresql-client

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

## add entrypoint that waits for DB, then migrates & seeds
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
