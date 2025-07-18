import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import {
  ErrorPage,
} from '@edx/frontend-platform/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/components/app/App';

import messages from './i18n';

import './index.scss';

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
  messages,
});
