import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SuccessHeading from '../SuccessHeading';

describe('SuccessHeading', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <SuccessHeading />
    </IntlProvider>,

  );

  it('renders the welcome message correctly', () => {
    renderComponent();
    validateText('Welcome to edX for Teams!', { exact: false });
    validateText('Go to your administrator dashboard to onboard and invite your team members to start learning.', { exact: false });
  });
});
