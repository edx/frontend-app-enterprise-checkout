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
    validateText((content: string | string[]) => content.includes('Welcome to edX for Teams!'));
    validateText((content: string | string[]) => content.includes('We\'re working on building your administrator dashboard'));
    validateText((content: string | string[]) => content.includes('reach out to us'));
  });

  it('renders the celebration image', () => {
    renderComponent();
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });

  it('renders the link correctly', () => {
    renderComponent();
    const link = screen.getByRole('link', { name: 'reach out to us' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
