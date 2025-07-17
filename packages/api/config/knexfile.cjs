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
    migrations: { directory: '../src/db/migrations', extension: 'cjs' },
    seeds:      { directory: './seeds',      extension: 'cjs' }
  },
  test: {
       client: 'pg',
       connection: {
         host:     process.env.PGHOST     || '127.0.0.1',
         user:     process.env.PGUSER     || 'postgres',
         password: process.env.PGPASSWORD || 'postgres',
         database: process.env.PGDATABASE || 'winlo_test'
       },
       migrations: { directory: '../src/db/migrations', extension: 'cjs' },
       seeds:      { directory: '../src/db/seeds',      extension: 'cjs' }
     }
};