import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SuccessNotification from '../SuccessNotification';

describe('SuccessNotification', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <SuccessNotification />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Your free trial for edX team\'s subscription has started.');
  });
});
