import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import '@testing-library/jest-dom';
import ErrorPage from '../ErrorPage';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    CONTACT_SUPPORT_URL: 'https://support.example.com',
    PRIVACY_POLICY_URL: 'https://privacy.example.com',
    TERMS_OF_SERVICE_URL: 'https://terms.example.com',
    COMPARE_ENTERPRISE_PLANS_URL: 'https://compare.example.com',
  }),
}));

describe('ErrorPage', () => {
  // Same provider stack index.tsx uses for the APP_INIT_ERROR path: an ordinary
  // (non-data) router, since ErrorPage no longer requires data-router error context.
  const renderComponent = (props = {}) => render(
    <IntlProvider locale="en">
      <BrowserRouter>
        <ErrorPage {...props} />
      </BrowserRouter>
    </IntlProvider>,
  );

  it('Renders the error correctly', () => {
    renderComponent();
    validateText("We're sorry, something went wrong");
  });

  it('Renders in a message when supplied', () => {
    const props = {
      message: '420: Chill out dude',
    };
    renderComponent(props);
    validateText(props.message);
  });

  it('Renders a stack trace when supplied', () => {
    const props = {
      message: 'Boom',
      stackTrace: 'at foo (bar.js:1:1)',
    };
    renderComponent(props);
    validateText(props.message);
    validateText(props.stackTrace);
  });

  it('Does not render a message or stack trace block when neither is supplied', () => {
    renderComponent();
    expect(document.querySelectorAll('pre')).toHaveLength(0);
  });

  it('Renders without throwing under the APP_INIT_ERROR provider stack (IntlProvider + BrowserRouter)', () => {
    expect(() => renderComponent({ message: 'login_refresh failed' })).not.toThrow();
    validateText('login_refresh failed');
  });
});
