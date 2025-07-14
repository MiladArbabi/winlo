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
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        }
    }
};
export default config;
