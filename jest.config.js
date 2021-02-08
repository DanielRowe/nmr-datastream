module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
};
