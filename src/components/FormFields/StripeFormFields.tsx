import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AddressElement, PaymentElement } from '@stripe/react-stripe-js';

import { FieldContainer } from '@/components/FieldContainer';
import { StripeProvider } from '@/components/StripeProvider';

const StripeAddressTitle = () => (
  <h3 className="mb-3">
    <FormattedMessage
      id="billingDetailsPage.stripeFormFields.billingAddress.title"
      defaultMessage="Customer billing information"
      description="Stripe form billing address information title"
    />
  </h3>
);

const StripePaymentTitle = () => (
  <>
    <h3>
      <FormattedMessage
        id="billingDetailsPage.stripeFormFields.billingPayment.title"
        defaultMessage="Billing information"
        description="Stripe form billing payment information title"
      />
    </h3>
    <h4 className="font-weight-light">
      <FormattedMessage
        id="billingDetailsPage.stripeFormFields.billingPayment.subtitle"
        defaultMessage="By providing your card information, you allow edX to charge your card for future payments in accordance with their terms."
        description="Description text explaining the billing payment infomration subtitle"
      />
    </h4>
  </>
);

const StripeFormFields = () => (
  <StripeProvider>
    <FieldContainer>
      <StripeAddressTitle />
      <AddressElement
        options={{
          mode: 'billing',
        }}
      />
    </FieldContainer>
    <FieldContainer>
      <StripePaymentTitle />
      <PaymentElement />
    </FieldContainer>
  </StripeProvider>
);

export default StripeFormFields;
