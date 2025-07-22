var _a;
// packages/api/src/db.ts
import knex from 'knex';
import { createRequire } from 'module';
// so we can pull in a .cjs config file even in ESM-land:
const require = createRequire(import.meta.url);
// TS will treat this as `any`
const config = require('../config/knexfile.cjs');
const env = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development';
const knexConfig = config[env];
if (!knexConfig) {
    throw new Error(`No knex configuration found for environment: ${env}`);
}
// Initialize knex with the configuration for the current environment
if (!knexConfig.client) {
    throw new Error(`Knex configuration for environment "${env}" does not specify a client.`);
}
// Ensure that the client is a string
if (typeof knexConfig.client !== 'string') {
    throw new Error(`Knex client for environment "${env}" must be a string, got ${typeof knexConfig.client}`);
}
// Create a Knex instance with the configuration
// This will throw an error if the configuration is invalid
if (!knexConfig.connection) {
    throw new Error(`Knex configuration for environment "${env}" does not specify a connection.`);
}
if (typeof knexConfig.connection !== 'object') {
    throw new Error(`Knex connection for environment "${env}" must be an object, got ${typeof knexConfig.connection}`);
}
if (!knexConfig.connection.host || !knexConfig.connection.user || !knexConfig.connection.password || !knexConfig.connection.database) {
    throw new Error(`Knex connection for environment "${env}" must specify host, user, password, and database.`);
}
export default knex(knexConfig);
