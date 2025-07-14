// packages/api/knexfile.js
require('ts-node').register({
  /* if you ever run `.ts` migrations, but now we’re pure CJS so this is just for safety */
});
/** @type { import("knex").Knex.Config } */
const config = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgres',
      database: 'winlo'
    },
    migrations: {
      directory: './migrations',
      extension: 'cjs'
    },
    seeds: {
      directory: './seeds',
      extension: 'cjs'
    }
  }
};

module.exports = config;
