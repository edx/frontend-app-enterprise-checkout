const path = require('path');

const { createConfig } = require('@openedx/frontend-build');
// eslint-disable-next-line import/no-extraneous-dependencies
const dotenv = require('dotenv');

/**
 * Injects stage-specific env vars from .env.development-stage.
 *
 * Note: ideally, we could use the base config for `webpack-dev-stage` in
 * `getBaseConfig` above, however it appears to have a bug so we have to
 * manually load the stage-specific env vars ourselves for now.
 *
 * The .env.development-stage env vars must be loaded before the base
 * config is created.
 */
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development-stage'),
});

const config = createConfig('webpack-dev', {
  devServer: {
    allowedHosts: 'all',
    server: 'https',
    port: 2012,
    proxy: {
      '/api/catalog/**': {
        target: 'http://localhost:18160', // Enterprise Catalog API
        changeOrigin: true,
        secure: false,
      },
      '/api/access/**': {
        target: 'http://localhost:18270', // Enterprise Access API
        changeOrigin: true,
        secure: false,
      },
      '/api/ecommerce/**': {
        target: 'http://localhost:18130', // Ecommerce API
        changeOrigin: true,
        secure: false,
      },
      '/csrf/api/v1/token': {
        target: 'http://localhost:18270', // CSRF token endpoint (example)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

// Fix module rule for edX packages
config.module.rules[0].exclude = /node_modules\/(?!(lodash-es|@(open)?edx))/;

module.exports = config;
