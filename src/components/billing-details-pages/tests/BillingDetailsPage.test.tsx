import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutPageRoute, DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { renderStepperRoute } from '@/utils/tests';

describe('BillingDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      authenticatedUser: {
        userId: 'test-id',
      },
    } as any);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Billing Details');
  });

  it('renders the purchase button correctly', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      authenticatedUser: {
        userId: 'test-id',
      },
    } as any);
    validateText('Purchase Now');
  });

  it('renders the DataPrivacyPolicyField component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      authenticatedUser: {
        userId: 'test-id',
      },
    } as any);
    validateText('Data Privacy Policy and Master Service Agreement');
  });
});

describe('BillingDetailsSuccessPage', () => {
  it('renders the title correctly based on form state (first name from Plan Details)', () => {
    // Seed the form store with a full name as entered/derived in Plan Details
    checkoutFormStore.setState((s) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.PlanDetails]: {
          ...s.formData[DataStoreKey.PlanDetails],
          fullName: 'Alice Example',
        },
      },
    }));

    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess);

    // The Billing Details Success title uses the "firstName" param populated from the form state.
    // The component currently passes fullName to the "firstName" placeholder.
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Thank you, Alice Example.');
  });

  it('renders the OrderDetails component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess);
    validateText('Order Details');
    validateText('You have purchased an edX team\'s subscription.');
  });

  it('renders the SuccessHeading component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess);
    validateText((content) => content.includes('Welcome to edX for teams!'));
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
