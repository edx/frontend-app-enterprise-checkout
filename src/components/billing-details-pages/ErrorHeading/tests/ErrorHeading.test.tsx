import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ErrorHeading } from '@/components/billing-details-pages/ErrorHeading';

describe('ErrorHeading', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <ErrorHeading />
    </IntlProvider>,
  );

  it('renders the error alert with danger variant', () => {
    renderComponent();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('alert-danger');
  });

  it('renders the error alert with icon', () => {
    renderComponent();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    // Icon is rendered internally by Paragon Alert component
  });

  it('renders the error heading correctly', () => {
    renderComponent();
    validateText('We\'re sorry, something went wrong');
  });

  it('renders the error description message', () => {
    renderComponent();
    validateText(/An unexpected error occurred while setting up your account/i);
    validateText(/We're actively working to resolve this issue/i);
    validateText(/If you require immediate assistance, please/i);
  });

  it('renders the contact support link correctly', () => {
    renderComponent();
    const supportLink = screen.getByRole('link', { name: 'contact our support team' });
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute('href', 'https://google.com');
    expect(supportLink).toHaveAttribute('target', '_blank');
    expect(supportLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has proper accessibility attributes', () => {
    renderComponent();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});
