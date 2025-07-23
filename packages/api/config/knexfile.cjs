// packages/api/config/knexfile.cjs
module.exports = {
  development: {
    client:    'pg',
    connection:{
      host:     process.env.PGHOST     || '127.0.0.1',
      user:     process.env.PGUSER     || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'winlo'
    },
    migrations: { directory: '../src/db/migrations', extension: 'cjs' },
    seeds:      { directory: '../src/db/seeds',      extension: 'cjs' }
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