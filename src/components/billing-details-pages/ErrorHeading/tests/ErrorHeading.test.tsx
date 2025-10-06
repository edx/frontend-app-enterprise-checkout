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

  it('renders the main heading correctly', () => {
    renderComponent();
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Account Setup is Taking Longer Than Expected');
    expect(heading).toHaveClass('text-center', 'font-weight-normal', 'mb-0');
  });

  it('renders the description heading correctly', () => {
    renderComponent();
    const subheading = screen.getByRole('heading', { level: 3 });
    expect(subheading).toBeInTheDocument();
    expect(subheading).toHaveTextContent(/We're experiencing a brief delay in setting up your edX Teams account/);
    expect(subheading).toHaveClass('font-weight-light', 'text-center');
  });

  it('renders the complete description message', () => {
    renderComponent();
    expect(screen.getByText(/We're experiencing a brief delay in setting up your edX Teams account/)).toBeInTheDocument();
    expect(screen.getByText(/We'll send you a confirmation email immediately once your account is fully operational/)).toBeInTheDocument();
    expect(screen.getByText(/Thank you for your patience!/)).toBeInTheDocument();
  });
});
