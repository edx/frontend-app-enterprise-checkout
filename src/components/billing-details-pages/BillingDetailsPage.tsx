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

const BillingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const StepperContent = useStepperContent();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const { data: checkoutIntent } = useCheckoutIntent();

  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();

  const billingDetailsSchema = useMemo(() => (
    formSchema(formValidationConstraints)
  ), [formSchema, formValidationConstraints]);

  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(billingDetailsSchema),
    defaultValues: billingDetailsData,
  });
  const {
    handleSubmit,
  } = form;

  const onSubmit = async (data: BillingDetailsData) => {
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId: checkoutIntent?.id ?? null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.BILLING_DETAILS_SUBSCRIBE_BUTTON_CLICKED,
    });

    setFormData(DataStoreKey.BillingDetails, data);
  };

  const eventKey = CheckoutStepKey.BillingDetails;
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Billing Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Billing Details">
          <Stack gap={4}>
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
            <StatefulSubscribeButton />
          </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};
export default BillingDetailsPage;
