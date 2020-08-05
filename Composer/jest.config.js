// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  collectCoverageFrom: [
    '**/src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/demo/**',
    '!**/extensions/**/dist/**',
    '!**/extensions/**/lib/**',
    '!packages/lib/**/lib/**',
    '!**/coverage/**',
    '!**/jest/**',
    '!**/jestMocks/**',
    '!**/scripts/**',
    '!**/config/**',
    '!**/build/**',
    '!**/dist/**',
    '!**/*config.js',
    '!**/gulpfile.js',
    '!**/style.js',
    '!**/styles.js',
    '!**/styles.ts',
    '!cypress/',
  ],
  coverageReporters: ['lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 20,
    },
  },
  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(jpg|jpeg|png|svg)$': '<rootDir>/jestMocks/styleMock.js',
    '\\.(s)?css$': '<rootDir>/jestMocks/styleMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/scripts/', '/jestMocks/', '__tests__/setup.(j|t)s', '/cypress/'],
  projects: [
    '<rootDir>/packages/client',
    '<rootDir>/packages/extensions/adaptive-form',
    '<rootDir>/packages/extensions/adaptive-flow',
    '<rootDir>/packages/extensions/extension',
    '<rootDir>/packages/extensions/intellisense',
    '<rootDir>/packages/lib/code-editor',
    '<rootDir>/packages/lib/shared',
    '<rootDir>/packages/server',
    '<rootDir>/packages/electron-server',
    '<rootDir>/packages/tools/language-servers/language-generation',
    '<rootDir>/packages/tools/language-servers/intellisense',
    '<rootDir>/packages/ui-plugins/lg',
    '<rootDir>/packages/ui-plugins/luis',
    '<rootDir>/packages/ui-plugins/prompts',
    '<rootDir>/packages/ui-plugins/schema-editor',
    '<rootDir>/packages/ui-plugins/select-dialog',
    '<rootDir>/packages/ui-plugins/select-skill-dialog',
  ],
};
