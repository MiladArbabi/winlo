# packages/api/scripts/docker-entrypoint.sh
#!/usr/bin/env sh
set -e

# wait for Postgres to come up
until pg_isready -h "${PGHOST:-postgres}" -p 5432; do
  echo "⏳ waiting for postgres…"
  sleep 1
done

echo "▶️ running migrations"
npx knex migrate:latest --knexfile ./config/knexfile.cjs

echo "▶️ running seeds"
npx knex seed:run     --knexfile ./config/knexfile.cjs

echo "▶️ starting app"
exec node dist/index.js
