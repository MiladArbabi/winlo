// packages/api/src/db.ts
import knex from 'knex';
// point at your CJS knexfile:
import config from '../knexfile.cjs';

const env = process.env.NODE_ENV ?? 'development';
// cast to any to get rid of the missing‐Config type error
const knexConfig = (config as any)[env];

const db = knex(knexConfig);
export default db;
