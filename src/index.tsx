import { APP_INIT_ERROR, APP_READY, initialize, mergeConfig, subscribe } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from '@/components/app/App';

import { ErrorPage } from './components/ErrorPage';
import './index.scss';
import messages from './i18n';

const container = document.getElementById('root');
// @ts-ignore
const root = createRoot(container);

subscribe(APP_READY, () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  root.render(
    <StrictMode>
      <IntlProvider>
        <BrowserRouter>
          <ErrorPage message={error.message} />
        </BrowserRouter>
      </IntlProvider>
    </StrictMode>,
  );
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        ENTERPRISE_ACCESS_BASE_URL: process.env.ENTERPRISE_ACCESS_BASE_URL || null,
        ENTERPRISE_ADMIN_PORTAL_URL: process.env.ENTERPRISE_ADMIN_PORTAL_URL || null,
        ENTERPRISE_LEARNER_PORTAL_URL: process.env.ENTERPRISE_LEARNER_PORTAL_URL || null,
        PUBLISHABLE_STRIPE_API_KEY: process.env.PUBLISHABLE_STRIPE_API_KEY || null,
        TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL || null,
        PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL || null,
        ENTERPRISE_PRODUCT_DESCRIPTIONS_AND_TERMS_URL:
          process.env.ENTERPRISE_PRODUCT_DESCRIPTIONS_AND_TERMS_URL || null,
        ENTERPRISE_SALES_TERMS_AND_CONDITIONS_URL: process.env.ENTERPRISE_SALES_TERMS_AND_CONDITIONS_URL || null,
        COMPARE_ENTERPRISE_PLANS_URL: process.env.COMPARE_ENTERPRISE_PLANS_URL || null,
        CONTACT_SUPPORT_URL: process.env.CONTACT_SUPPORT_URL || null,
        RECAPTCHA_SITE_WEB_KEY: process.env.RECAPTCHA_SITE_WEB_KEY || null,
      });
    },
  },
  messages,
  // We don't require authenticated users so that we can perform our own auth redirect to a proxy login that depends on
  // the route, rather than the LMS like frontend-platform does.
  requireAuthenticatedUser: false,
  // Hydrate extra user info from edxapp accounts API for keys not in the JWT. This is
  // especially useful for the "country" key which helps us populate checkout state.
  hydrateAuthenticatedUser: true,
});
export { SubmitCallbacks } from '@/constants/checkout';
export { DataStoreKey } from '@/constants/checkout';
export { authenticatedSteps } from '@/constants/checkout';
