import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import { CheckoutPageRoute } from '@/constants/checkout';

import PurchaseSummaryCardButton from '../PurchaseSummaryCardButton';

jest.mock('@/components/app/data', () => ({
  __esModule: true,
  useCreateBillingPortalSession: jest.fn(() => ({
    data: { url: 'https://billing.example.com/portal' },
  })),
  useCheckoutIntent: jest.fn(() => ({
    data: { id: 123 },
  })),
}));

jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (initialRoute: string) => render(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[initialRoute]}>
      <PurchaseSummaryCardButton />
    </MemoryRouter>
  </IntlProvider>,
);

describe('PurchaseSummaryCardButton', () => {
  const mockSendTrackingEvent = jest.requireMock('@/utils/common').sendEnterpriseCheckoutTrackingEvent;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Edit Plan Button Rendering', () => {
    it('renders EditPlanButton on AccountDetails route', () => {
      renderWithRouter(CheckoutPageRoute.AccountDetails);

      expect(screen.getByTestId('edit-plan-button')).toBeInTheDocument();
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });

    it('renders EditPlanButton on BillingDetails route', () => {
      renderWithRouter(CheckoutPageRoute.BillingDetails);

      expect(screen.getByTestId('edit-plan-button')).toBeInTheDocument();
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });
  });

  describe('Receipt Button Rendering', () => {
    it('renders ReceiptButton on BillingDetailsSuccess route', () => {
      renderWithRouter(CheckoutPageRoute.BillingDetailsSuccess);

      expect(screen.getByText('View receipt')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-plan-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Plan')).not.toBeInTheDocument();
    });
  });

  describe('No Button Rendering', () => {
    it('renders nothing on PlanDetails route', () => {
      renderWithRouter(CheckoutPageRoute.PlanDetails);

      expect(screen.queryByTestId('edit-plan-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });

    it('renders nothing on PlanDetailsLogin route', () => {
      renderWithRouter(CheckoutPageRoute.PlanDetailsLogin);

      expect(screen.queryByTestId('edit-plan-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });

    it('renders nothing on PlanDetailsRegister route', () => {
      renderWithRouter(CheckoutPageRoute.PlanDetailsRegister);

      expect(screen.queryByTestId('edit-plan-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });

    it('renders nothing for unknown/unmapped routes', () => {
      renderWithRouter('/unknown-route');

      expect(screen.queryByTestId('edit-plan-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    it('returns null when no button should be rendered', () => {
      const { container } = renderWithRouter(CheckoutPageRoute.PlanDetails);

      expect(container.firstChild).toBeNull();
    });

    it('memoizes button type calculation correctly', () => {
      const { rerender } = renderWithRouter(CheckoutPageRoute.AccountDetails);

      expect(screen.getByTestId('edit-plan-button')).toBeInTheDocument();

      rerender(
        <IntlProvider locale="en">
          <MemoryRouter initialEntries={[CheckoutPageRoute.AccountDetails]}>
            <PurchaseSummaryCardButton />
          </MemoryRouter>
        </IntlProvider>,
      );

      expect(screen.getByTestId('edit-plan-button')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls navigate when Edit Plan button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(CheckoutPageRoute.AccountDetails);

      const editButton = screen.getByTestId('edit-plan-button');
      await user.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith(CheckoutPageRoute.PlanDetails);
    });

    it('calls tracking event when View Receipt button is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(CheckoutPageRoute.BillingDetailsSuccess);

      const receiptButton = screen.getByText('View receipt');
      await user.click(receiptButton);

      expect(mockSendTrackingEvent).toHaveBeenCalledWith({
        checkoutIntentId: 123,
        eventName: 'edx.ui.enterprise.checkout.self_service_subscription_checkout.billing_details_success.view_receipt_button.clicked',
        properties: {
          billingPortalSessionUrl: 'https://billing.example.com/portal',
        },
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string route gracefully', () => {
      renderWithRouter('');

      expect(screen.queryByTestId('edit-plan-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });

    it('handles route with query parameters', () => {
      renderWithRouter(`${CheckoutPageRoute.AccountDetails}?param=value`);

      // Route with query parameters should still match the base route
      expect(screen.getByTestId('edit-plan-button')).toBeInTheDocument();
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });

    it('handles route with hash fragment', () => {
      renderWithRouter(`${CheckoutPageRoute.BillingDetails}#section`);

      // Route with hash fragment should still match the base route
      expect(screen.getByTestId('edit-plan-button')).toBeInTheDocument();
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.queryByText('View receipt')).not.toBeInTheDocument();
    });
  });
});
