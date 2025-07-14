// packages/api/knexfile.cjs
require('ts-node').register();
module.exports = {
  development: {
    client:    'pg',
    connection:{
      host:     '127.0.0.1',
      user:     'postgres',
      password: 'postgres',
      database: 'winlo'
    },
    migrations:{ directory: './migrations', extension: 'cjs' },
    seeds:     { directory: './seeds',      extension: 'cjs' }
  }
};