import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
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
    validateText((content: string | string[]) => content.includes('Welcome to edX for teams!'));
    validateText((content: string | string[]) => content.includes('Go to your administrator dashboard'));
  });

  it('renders the celebration image', () => {
    renderComponent();
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
