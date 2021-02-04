module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?)$",
  reporters: [
    "default",
    ["./node_modules/jest-html-reporter", {
      "pageTitle": "Composer E2E Test Report",
      "includeFailureMsg": true,
      "includeConsoleLog": true,
    }]
  ]
};