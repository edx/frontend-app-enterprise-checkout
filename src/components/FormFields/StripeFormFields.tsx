import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AddressElement, PaymentElement } from '@stripe/react-stripe-js';

import { FieldContainer } from '@/components/FieldContainer';
import { StripeProvider } from '@/components/StripeProvider';

const StripeFormFields = () => (
  <StripeProvider>
    <FieldContainer>
      <h3>
        <FormattedMessage
          id="billingDetailsPage.stripeFormFields.billingAddress.title"
          defaultMessage="Customer billing information"
          description="Stripe form billing address information title"
        />
      </h3>
      <AddressElement
        options={{
          mode: 'billing',
        }}
      />
    </FieldContainer>
    <FieldContainer>
      <h3>
        <FormattedMessage
          id="billingDetailsPage.stripeFormFields.billingPayment.title"
          defaultMessage="Billing information"
          description="Stripe form billing payment information title"
        />
      </h3>
      <h3 className="font-weight-light">
        <FormattedMessage
          id="billingDetailsPage.stripeFormFields.billingPayment.title"
          defaultMessage="Enter in the number of licenses you want to purchase."
          description="Description text explaining the licenses field purpose"
        />
      </h3>
      <PaymentElement />
    </FieldContainer>

  </StripeProvider>
);

// @ts-ignore
export default StripeFormFields;
