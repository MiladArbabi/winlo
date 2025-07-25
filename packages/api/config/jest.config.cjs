// packages/api/config/jest.config.cjs
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    rootDir: '../',
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
      },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    globals: {
      'ts-jest': {
        useESM: true,
      },
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    };
  