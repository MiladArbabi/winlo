// packages/api/src/__tests__/db.test.ts
import { jest } from '@jest/globals';

describe('db.ts configuration errors & happy path', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.NODE_ENV;
  });

  it('initializes knex with a valid config', async () => {
    const fakeConfig = {
      development: {
        client: 'pg',
        connection: { host: 'h', user: 'u', password: 'p', database: 'd' },
      },
    };

    // When db.ts does `import { createRequire } from 'module'`
    // and then `const require = createRequire(...)`,
    // our mock createRequire(...) will return a function that always yields fakeConfig.
    await jest.unstable_mockModule('module', () => ({
      createRequire: (_: string) => {
        return (_path: string) => fakeConfig;
      },
    }));

    const { default: db } = await import('../db.js');
    // A real Knex instance has a .raw method
    expect(typeof db.raw).toBe('function');
  });

  it('throws if no config for current env', async () => {
    process.env.NODE_ENV = 'missing';
    const fakeConfig: Record<string, any> = {};

    await jest.unstable_mockModule('module', () => ({
      createRequire: () => () => fakeConfig,
    }));

    await expect(import('../db.js'))
      .rejects
      .toThrow('No knex configuration found for environment: missing');
  });

  it('throws if client is missing', async () => {
    process.env.NODE_ENV = 'test';
    const fakeConfig = {
      test: { connection: { host: 'h', user: 'u', password: 'p', database: 'd' } },
    };

    await jest.unstable_mockModule('module', () => ({
      createRequire: () => () => fakeConfig,
    }));

    await expect(import('../db.js'))
      .rejects
      .toThrow('Knex configuration for environment "test" does not specify a client.');
  });

  it('throws if client is not a string', async () => {
    process.env.NODE_ENV = 'test';
    const fakeConfig = {
      test: {
        client: 123,
        connection: { host: 'h', user: 'u', password: 'p', database: 'd' },
      },
    };

    await jest.unstable_mockModule('module', () => ({
      createRequire: () => () => fakeConfig,
    }));

    await expect(import('../db.js'))
      .rejects
      .toThrow('Knex client for environment "test" must be a string, got number');
  });

  it('throws if connection is missing', async () => {
    process.env.NODE_ENV = 'test';
    const fakeConfig = {
      test: { client: 'pg' },
    };

    await jest.unstable_mockModule('module', () => ({
      createRequire: () => () => fakeConfig,
    }));

    await expect(import('../db.js'))
      .rejects
      .toThrow('Knex configuration for environment "test" does not specify a connection.');
  });

  it('throws if connection is not an object', async () => {
    process.env.NODE_ENV = 'test';
    const fakeConfig = {
      test: { client: 'pg', connection: 'not-an-object' },
    };

    await jest.unstable_mockModule('module', () => ({
      createRequire: () => () => fakeConfig,
    }));

    await expect(import('../db.js'))
      .rejects
      .toThrow('Knex connection for environment "test" must be an object, got string');
  });

  it('throws if connection details are incomplete', async () => {
    process.env.NODE_ENV = 'test';
    const fakeConfig = {
      test: {
        client: 'pg',
        connection: { host: '', user: '', password: '', database: '' },
      },
    };

    await jest.unstable_mockModule('module', () => ({
      createRequire: () => () => fakeConfig,
    }));

    await expect(import('../db.js'))
      .rejects
      .toThrow('Knex connection for environment "test" must specify host, user, password, and database.');
  });
});
