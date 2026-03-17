import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data';
import { StatefulSubscribeButton } from '@/components/StatefulButton';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  DataStoreKey,
} from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { useCheckoutFormStore, useCurrentPageDetails } from '@/hooks/index';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

type BillingDetailsData = {
  fullName?: string;
  country?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

const BillingDetailsPage: React.FC = () => {
  const navigate = useNavigate();

  const billingDetailsData = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.BillingDetails],
  );

  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const StepperContent = useStepperContent();

  const { data: formValidationConstraints } = useFormValidationConstraints();
  const { data: checkoutIntent } = useCheckoutIntent();

  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();

  const billingDetailsSchema = useMemo(
    () => formSchema(formValidationConstraints),
    [formSchema, formValidationConstraints],
  );

  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(billingDetailsSchema),
    defaultValues: billingDetailsData || {
      fullName: '',
      country: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: '',
    },
  });

  const {
    handleSubmit,
  } = form;

  // ✅ Keep submit clean (no tracking here)
  const onSubmit = async (data: BillingDetailsData) => {
    setFormData(DataStoreKey.BillingDetails, data);
  };

  // ✅ Fire tracking BEFORE validation
  const handleSubscribeClick = () => {
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId: checkoutIntent?.id ?? null,
      eventName:
        EVENT_NAMES.SUBSCRIPTION_CHECKOUT
          .BILLING_DETAILS_SUBSCRIBE_BUTTON_CLICKED,
    });

    handleSubmit(onSubmit)().catch(() => {
      // Form submission errors are handled by react-hook-form
    });
  };

  const eventKey = CheckoutStepKey.BillingDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Billing Details" />

      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Billing Details">
          <Stack gap={4}>
            {/* Stripe Address + Full Name fields rendered dynamically */}
            <StepperContent form={form} />
          </Stack>
        </Stepper.Step>

        {stepperActionButtonMessage && (
          <Stepper.ActionRow eventKey={eventKey}>
            <Button
              variant="outline-primary"
              onClick={() => navigate(CheckoutPageRoute.AccountDetails)}
            >
              <FormattedMessage
                id="checkout.back"
                defaultMessage="Back"
                description="Button to go back to the previous step"
              />
            </Button>

            <Stepper.ActionRow.Spacer />

            {/* ✅ Fixed Subscribe Button */}
            <StatefulSubscribeButton onClick={handleSubscribeClick} />
          </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};

export default BillingDetailsPage;
