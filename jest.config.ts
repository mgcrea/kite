module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/setup.ts'],
  setupFilesAfterEnv: ['expect-playwright'],
  // globalSetup: '<rootDir>/test/setup.ts',
  moduleNameMapper: {
    '^src/(.*)\\.js$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^./(.*)\\.js$': './$1',
    '^../(.*)\\.js$': '../$1',
    '^test/(.*)$': '<rootDir>/test/$1',
  },
};
