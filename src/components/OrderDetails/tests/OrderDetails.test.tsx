import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import OrderDetails from '../OrderDetails';

describe('OrderDetails', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <OrderDetails />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Order Details');
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText('You have purchased an edX team\'s subscription.');
  });
});
