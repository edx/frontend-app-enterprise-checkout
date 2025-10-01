import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { queryClient } from '@/utils/tests';

import BillingDetailsSuccessContent from '../BillingDetailsSuccessContent';

jest.mock('@/components/app/data/hooks/useCheckoutIntent');

const { default: mockUseCheckoutIntent } = jest.requireMock('@/components/app/data/hooks/useCheckoutIntent');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  </QueryClientProvider>
);

describe('BillingDetailsSuccessContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AccountProvisioningError when checkoutIntent state is errored_provisioning', () => {
    mockUseCheckoutIntent.mockReturnValue({
      data: {
        id: 1,
        state: 'errored_provisioning',
      },
    });

    const { getByText } = render(
      <TestWrapper>
        <BillingDetailsSuccessContent />
      </TestWrapper>,
    );

    expect(getByText("We're sorry, something went wrong")).toBeInTheDocument();
  });

  it('renders SuccessNotification when checkoutIntent state is not errored_provisioning', () => {
    mockUseCheckoutIntent.mockReturnValue({
      data: {
        id: 1,
        state: 'completed',
      },
    });

    const { getByText } = render(
      <TestWrapper>
        <BillingDetailsSuccessContent />
      </TestWrapper>,
    );

    expect(getByText("Your free trial for edX team's subscription has started.")).toBeInTheDocument();
  });
});
