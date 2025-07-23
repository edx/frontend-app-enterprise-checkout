import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText('Create a custom URL for your team')).toBeInTheDocument();
  });

  it('renders the description correctly', () => {
    renderComponent();
    expect(screen.getByText((content) => content.includes('This is how your colleagues will access your team subscription on edX'))).toBeInTheDocument();

    expect(screen.getByText((content) => content.includes('This access link name cannot be changed after your trial subscription starts'))).toBeInTheDocument();
  });
});
