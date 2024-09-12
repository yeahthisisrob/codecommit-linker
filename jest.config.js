module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    vscode: '<rootDir>/__mocks__/vscode.js', // Tell Jest to use the custom vscode mock
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
