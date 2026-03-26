import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { AddressElement, PaymentElement } from '@stripe/react-stripe-js';
import { StripeAddressElementChangeEvent, StripeAddressElementOptions } from '@stripe/stripe-js';
import { useCallback } from 'react';

import { FieldContainer } from '@/components/FieldContainer';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

import type { UseFormReturn } from 'react-hook-form';

interface BillingFormFieldsProps {
  form: UseFormReturn<BillingDetailsData>;
}

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
    <p className="h4 font-weight-light">
      <FormattedMessage
        id="billingDetailsPage.stripeFormFields.billingPayment.subtitle"
        defaultMessage="By providing your card information, you allow edX to charge your card for future payments in accordance with their terms."
        description="Description text explaining the billing payment information subtitle"
      />
    </p>
  </>
);

/**
 * BillingFormFields component
 *
 * Renders the billing address form and payment element for the billing details page.
 * Uses Stripe AddressElement and PaymentElement.
 * AddressElement provides autocomplete/manual entry and returns
 * normalized address fields (line1, line2, city, state, postal code).
 */
const BillingFormFields = ({ form }: BillingFormFieldsProps) => {
  const billingDetailsData = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.BillingDetails],
  );
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const onAddressChange = useCallback((event: StripeAddressElementChangeEvent) => {
    const name = event.value?.name || '';
    const country = event.value?.address?.country || '';
    const line1 = event.value?.address?.line1 || '';
    const line2 = event.value?.address?.line2 || '';
    const city = event.value?.address?.city || '';
    const state = event.value?.address?.state || '';
    const zip = event.value?.address?.postal_code || '';

    form.setValue('fullName', name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    form.setValue('country', country, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    form.setValue('line1', line1, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    form.setValue('line2', line2, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    form.setValue('city', city, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    form.setValue('state', state, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    form.setValue('zip', zip, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

    setFormData(DataStoreKey.BillingDetails, {
      ...billingDetailsData,
      fullName: name,
      country,
      line1,
      line2,
      city,
      state,
      zip,
    });
  }, [billingDetailsData, form, setFormData]);

  const addressElementOptions: StripeAddressElementOptions = {
    mode: 'billing',
  };

  return (
    <>
      <FieldContainer>
        <BillingAddressTitle />
        <AddressElement
          options={addressElementOptions}
          onChange={onAddressChange}
        />
        {form.formState.errors?.fullName?.message && (
          <Form.Control.Feedback type="invalid" hasIcon={false} className="d-block mt-2">
            {form.formState.errors.fullName.message}
          </Form.Control.Feedback>
        )}
      </FieldContainer>
      <FieldContainer>
        <BillingPaymentTitle />
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </FieldContainer>
    </>
  );
};

export default BillingFormFields;
