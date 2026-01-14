import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { useRouteError } from 'react-router';
import { BrowserRouter, isRouteErrorResponse } from 'react-router-dom';

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

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useRouteError: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  isRouteErrorResponse: jest.fn(),
  BrowserRouter: jest.requireActual('react-router-dom').BrowserRouter,
}));

describe('ErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouteError as jest.Mock).mockReturnValue(null);
    (isRouteErrorResponse as unknown as jest.Mock).mockReturnValue(false);
  });

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

  it('displays error message from useRouteError if it is a string', () => {
    const errorMsg = 'Route error as string';
    (useRouteError as jest.Mock).mockReturnValue(errorMsg);
    renderComponent();
    validateText(errorMsg);
  });

  it('displays error message from useRouteError if it is an Error object', () => {
    const errorMsg = 'Route error from Error object';
    (useRouteError as jest.Mock).mockReturnValue(new Error(errorMsg));
    renderComponent();
    validateText(errorMsg);
  });

  it('displays error message from useRouteError Response with string data', () => {
    const errorMsg = 'Response error message';
    (isRouteErrorResponse as unknown as jest.Mock).mockReturnValue(true);
    (useRouteError as jest.Mock).mockReturnValue({
      data: errorMsg,
    });
    renderComponent();
    validateText(errorMsg);
  });

  it('displays error message from useRouteError Response with object data containing message', () => {
    const errorMsg = 'Response object error message';
    (isRouteErrorResponse as unknown as jest.Mock).mockReturnValue(true);
    (useRouteError as jest.Mock).mockReturnValue({
      data: { message: errorMsg },
    });
    renderComponent();
    validateText(errorMsg);
  });

  it('displays fallback status text from useRouteError Response if data is not a string or message object', () => {
    (isRouteErrorResponse as unknown as jest.Mock).mockReturnValue(true);
    (useRouteError as jest.Mock).mockReturnValue({
      status: 404,
      statusText: 'Not Found',
      data: { some: 'other' },
    });
    renderComponent();
    validateText('404 Not Found');
  });

  it('displays fallback status text from useRouteError Response if message in data is not a string', () => {
    (isRouteErrorResponse as unknown as jest.Mock).mockReturnValue(true);
    (useRouteError as jest.Mock).mockReturnValue({
      status: 500,
      statusText: 'Internal Server Error',
      data: { message: 123 },
    });
    renderComponent();
    validateText('500 Internal Server Error');
  });

  it('handles useRouteError throwing an error', () => {
    (useRouteError as jest.Mock).mockImplementation(() => {
      const error = new Error('Hook failed');
      error.stack = 'Insert stack trace here';
      return error;
    });
    renderComponent();
    validateText("We're sorry, something went wrong");
    validateText('Hook failed');
    validateText('Insert stack trace here');
  });

  it('displays default error message when useRouteError returns an unknown type', () => {
    (useRouteError as jest.Mock).mockReturnValue(12345);
    renderComponent();
    validateText("We're sorry, something went wrong");
  });
});
