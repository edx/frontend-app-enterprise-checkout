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
      {/* <IntlProvider>
        <BrowserRouter>
          <ErrorPage message="404 :(" />
        </BrowserRouter>
      </IntlProvider> */}
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
