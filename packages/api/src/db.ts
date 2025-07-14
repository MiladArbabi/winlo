// packages/api/src/db.ts
import knex from 'knex';
import type { Knex } from 'knex';
import config from '../knexfile.ts';

// pick the right environment config (defaults to “development”)
const env = process.env.NODE_ENV ?? 'development';
const knexConfig = (config as Record<string, Knex.Config>)[env];

// instantiate and export
const db = knex(knexConfig);
export default db;