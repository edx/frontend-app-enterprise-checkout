import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Stepper } from '@openedx/paragon';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';

import { useCheckoutSessionClientSecret, useFormValidationConstraints } from '@/components/app/data';
import { BillingDetailsPage } from '@/components/billing-details-pages';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import { StripeProvider } from '@/components/StripeProvider';
import { BillingDetailsSchema, CheckoutStepKey, DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

const EMPTY_BILLING_DETAILS_CONSTRAINTS = {} as CheckoutContextFieldConstraints;

const BillingDetailsFallback = () => {
  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const StepperContent = useStepperContent();
  const billingDetailsSchema = useMemo(() => (
    BillingDetailsSchema(formValidationConstraints ?? EMPTY_BILLING_DETAILS_CONSTRAINTS)
  ), [formValidationConstraints]);
  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(billingDetailsSchema),
    defaultValues: billingDetailsData,
  });

  return (
    <>
      <Helmet title="Billing Details" />
      <Stepper.Step eventKey={CheckoutStepKey.BillingDetails} title="Billing Details">
        <Stack gap={4}>
          <StepperContent form={form} />
        </Stack>
      </Stepper.Step>
    </>
  );
};

const BillingDetails = () => {
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();

  if (!checkoutSessionClientSecret) {
    return <BillingDetailsFallback />;
  }

  return (
    <StripeProvider>
      <BillingDetailsPage />
    </StripeProvider>
  );
};

export default BillingDetails;
