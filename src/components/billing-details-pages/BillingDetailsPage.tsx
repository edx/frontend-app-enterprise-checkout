import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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
import { useCheckoutEventProductProperties, useTrackCheckoutStepViewed } from '@/components/app/data/hooks';
import { StatefulSubscribeButton } from '@/components/StatefulButton';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageDetails,
  CheckoutPageRoute,
  CheckoutStepKey,
  DataStoreKey,
  EssentialsPageRoute,
} from '@/constants/checkout';
import EVENT_NAMES, { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import { useCheckoutFormStore, useCurrentPageDetails } from '@/hooks/index';
import useCurrentStep from '@/hooks/useCurrentStep';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import { isEssentialsFlow } from '../app/routes/loaders/utils';

const BillingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const isEssentials = isEssentialsFlow();

  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const StepperContent = useStepperContent();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const { data: checkoutIntent } = useCheckoutIntent();

  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();
  const intl = useIntl();
  const { title } = CheckoutPageDetails.BillingDetails;

  const { currentStepKey, currentSubstepKey } = useCurrentStep();
  const checkoutEventProduct = useCheckoutEventProductProperties();
  useTrackCheckoutStepViewed({
    eventName: EVENT_NAMES.CHECKOUT.STEP_VIEWED_BILLING_DETAILS,
    step: CHECKOUT_EVENT_STEPS.BILLING_DETAILS,
    product: checkoutEventProduct,
    // This page also renders the success substep, which is not a view of the billing step.
    isActive: currentStepKey === CheckoutStepKey.BillingDetails && !currentSubstepKey,
  });

  const billingDetailsSchema = useMemo(() => (
    formSchema(formValidationConstraints, { intl })
  ), [formSchema, formValidationConstraints, intl]);

  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(billingDetailsSchema),
    defaultValues: billingDetailsData,
  });

  const { handleSubmit } = form;

  const onSubmit = async (data: BillingDetailsData) => {
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId: checkoutIntent?.id ?? null,
      checkoutIntentUuid: checkoutIntent?.uuid ?? null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.BILLING_DETAILS_SUBSCRIBE_BUTTON_CLICKED,
    });

    setFormData(DataStoreKey.BillingDetails, data);
  };

  const eventKey = CheckoutStepKey.BillingDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title={intl.formatMessage(title)} />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title={intl.formatMessage(title)}>
          <Stack gap={4}>
            <StepperContent form={form} />
          </Stack>
        </Stepper.Step>

        {stepperActionButtonMessage && (
          <Stepper.ActionRow eventKey={eventKey}>
            <Button
              variant="outline-primary"
              onClick={() => navigate(
                isEssentials
                  ? EssentialsPageRoute.AccountDetails
                  : CheckoutPageRoute.AccountDetails,
              )}
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
