import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CustomUrlField from '../CustomUrlField';

describe('CustomUrlField', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <CustomUrlField />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Create a custom URL for your team');
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText((content) => content.includes('This is how your colleagues will access your team subscription on edX'));
    validateText((content) => content.includes('This access link name cannot be changed after your trial subscription starts'));
  });
});
