// packages/api/jest.config.cjs
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // ts-jest for CLI, Babel for the VS Code extension
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  // let Babel transform your ts files so the extension can parse them
  transformIgnorePatterns: [],
};
