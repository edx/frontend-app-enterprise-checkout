import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AddressElement, PaymentElement } from '@stripe/react-stripe-js';
import { StripeAddressElementOptions } from '@stripe/stripe-js';

import { FieldContainer } from '@/components/FieldContainer';

const BillingAddressTitle = () => (
  <h3 className="mb-3">
    <FormattedMessage
      id="billingDetailsPage.stripeFormFields.billingAddress.title"
      defaultMessage="Customer billing information"
      description="Stripe form billing address information title"
    />
  </h3>
);

const BillingPaymentTitle = () => (
  <>
    <h3>
      <FormattedMessage
        id="billingDetailsPage.stripeFormFields.billingPayment.title"
        defaultMessage="Billing information"
        description="Stripe form billing payment information title"
      />
    </h3>
    <p className="fs-4 font-weight-light">
      <FormattedMessage
        id="billingDetailsPage.stripeFormFields.billingPayment.subtitle"
        defaultMessage="By providing your card information, you allow edX to charge your card for future payments in accordance with their terms."
        description="Description text explaining the billing payment information subtitle"
      />
    </p>
  </>
);

const BillingFormFields = () => {
  /**
   * Stripe AddressElement configured for collecting the cardholder’s billing address.
   *
   * The `mode: "billing"` option ensures the address is tied to the payment method
   * and used for fraud checks and payment authorization.
   *
   * Docs: https://docs.stripe.com/elements/address-element
   */
  const addressElementOptions: StripeAddressElementOptions = {
    mode: 'billing',
  };
  return (
    <>
      <FieldContainer>
        <BillingAddressTitle />
        <AddressElement
          options={addressElementOptions}
        />
      </FieldContainer>
      <FieldContainer>
        <BillingPaymentTitle />
        <PaymentElement
          options={{
            layout: 'tabs', // or 'accordion'
          }}
        />
      </FieldContainer>
    </>
  );
};

export default BillingFormFields;
