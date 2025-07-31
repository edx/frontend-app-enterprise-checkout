const { createConfig } = require('@openedx/frontend-build');
const {pathsToModuleNameMapper} = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

process.env.TZ='UTC'

const config = createConfig('jest', {
  // setupFilesAfterEnv is used after the jest environment has been loaded.  In general this is what you want.
  // If you want to add config BEFORE jest loads, use setupFiles instead.
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.ts',
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coveragePathIgnorePatterns: [
    'src/setupTest.ts',
    'src/i18n',
  ],
});

config.transformIgnorePatterns = ['node_modules/(?!(lodash-es|@(open)?edx)/)'];

module.exports = config;
