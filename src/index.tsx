import {
  APP_INIT_ERROR, APP_READY, initialize, subscribe,
} from '@edx/frontend-platform';
import { mergeConfig } from '@edx/frontend-platform/config';
import {
  ErrorPage,
} from '@edx/frontend-platform/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/components/app/App';

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
      <ErrorPage message={error.message} />
    </StrictMode>,
  );
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        ENTERPRISE_ACCESS_BASE_URL: process.env.ENTERPRISE_ACCESS_BASE_URL || null,
      });
    },
  },
  messages,
  // We don't require authenticated users so that we can perform our own auth redirect to a proxy login that depends on
  // the route, rather than the LMS like frontend-platform does.
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
