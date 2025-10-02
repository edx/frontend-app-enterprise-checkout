import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SubscriptionStartMessage } from '@/components/billing-details-pages/SubscriptionStartMessage';
import { useFirstBillableInvoice } from '@/components/app/data';

// Mock the useFirstBillableInvoice hook
jest.mock('@/components/app/data', () => ({
  useFirstBillableInvoice: jest.fn(),
}));

const mockUseFirstBillableInvoice = useFirstBillableInvoice as jest.MockedFunction<typeof useFirstBillableInvoice>;


describe('SubscriptionStartMessage', () => {
  beforeEach(() => {
    // Mock the hook to return data that will render "June 9th, 2025"
    mockUseFirstBillableInvoice.mockReturnValue({
      data: {
        startTime: '2025-05-10T00:00:00Z', // Start of trial
        endTime: '2025-06-09T00:00:00Z', // End date that formats to "June 9th, 2025"
      },
    });
  });

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
    validateText(/Your trial expires on/i);
    validateText('June 9, 2025');
    validateText(/Cancel anytime from the/i);
    validateText('Subscription Management');
  });

  it('renders the bold text correctly', () => {
    renderComponent();
    const boldElement = screen.getByText('June 9, 2025');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe('SPAN');
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
