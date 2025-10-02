import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SubscriptionStartMessage } from '@/components/billing-details-pages/SubscriptionStartMessage';

// Helper function to validate text content
const validateText = (matcher: string | ((content: string | string[]) => boolean)) => {
  if (typeof matcher === 'string') {
    expect(screen.getByText(matcher)).toBeInTheDocument();
  } else {
    expect(screen.getByText((_, element) => {
      const hasText = element?.textContent && matcher(element.textContent);
      return hasText === true;
    })).toBeInTheDocument();
  }
};

describe('SubscriptionStartMessage', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <SubscriptionStartMessage />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Your free trial for edX team\'s subscription has started.');
  });

  it('renders the description message correctly', () => {
    renderComponent();
    // Check for specific text parts in the rendered component
    expect(screen.getByText(/Your trial expires on/i)).toBeInTheDocument();
    expect(screen.getByText('June 9th, 2025')).toBeInTheDocument();
    expect(screen.getByText(/Cancel anytime from the/i)).toBeInTheDocument();
    expect(screen.getByText('Subscription Management')).toBeInTheDocument();
  });

  it('renders the bold text correctly', () => {
    renderComponent();
    const boldElement = screen.getByText('June 9th, 2025');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe('B');
  });

  it('renders the link correctly', () => {
    renderComponent();
    const link = screen.getByRole('link', { name: 'Subscription Management' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
