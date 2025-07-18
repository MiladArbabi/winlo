var _a;
// packages/api/src/db.ts
import knex from 'knex';
const config = require('../config/knexfile.cjs');
const env = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development';
const knexConfig = config[env];
const db = knex(knexConfig);
export default db;
