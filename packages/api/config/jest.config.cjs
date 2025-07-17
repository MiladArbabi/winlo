// packages/api/jest.config.cjs
/** @type {import('jest').Config} */
module.exports = {
  rootDir: '../',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
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
