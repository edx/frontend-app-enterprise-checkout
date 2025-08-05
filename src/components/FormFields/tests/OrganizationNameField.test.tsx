import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import OrganizationNameField from '../OrganizationNameField';

describe('OrganizationNameField', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <OrganizationNameField />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('What is the name of your company or organization?');
  });
});
