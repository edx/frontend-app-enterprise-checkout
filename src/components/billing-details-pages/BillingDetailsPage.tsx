import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { StripeCheckoutSession } from '@stripe/stripe-js';
import { useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data';
import useCheckoutEventProductProperties from '@/components/app/data/hooks/useCheckoutEventProductProperties';
import useTrackCheckoutStepViewed from '@/components/app/data/hooks/useTrackCheckoutStepViewed';
import { StatefulSubscribeButton } from '@/components/StatefulButton';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageDetails,
  CheckoutPageRoute,
  CheckoutStepKey,
  CheckoutSubstepKey,
  DataStoreKey,
  EssentialsPageRoute,
} from '@/constants/checkout';
import EVENT_NAMES, { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import { useCheckoutFormStore, useCurrentPageDetails, useCurrentStep } from '@/hooks/index';
import { claimBillingStepCompleted, markCheckoutPaymentSubmitted, sendCheckoutEvent } from '@/utils/checkoutEvents';
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
  const planDetailsQuantity = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]?.quantity);
  const { currentStepKey, currentSubstepKey } = useCurrentStep();

  const checkoutEventProduct = useCheckoutEventProductProperties();
  useTrackCheckoutStepViewed({
    eventName: EVENT_NAMES.CHECKOUT.STEP_VIEWED_BILLING_DETAILS,
    step: CHECKOUT_EVENT_STEPS.BILLING_DETAILS,
    isActive: currentStepKey === CheckoutStepKey.BillingDetails && currentSubstepKey !== CheckoutSubstepKey.Success,
  });

  const handlePaymentSubmit = useCallback(() => {
    markCheckoutPaymentSubmitted(checkoutIntent?.uuid);
  }, [checkoutIntent?.uuid]);

  const handlePaymentSuccess = useCallback((session: StripeCheckoutSession | null) => {
    // Shares idempotency with the success route, which covers Stripe redirect-based payments.
    if (checkoutIntent?.uuid && !claimBillingStepCompleted(checkoutIntent.uuid)) {
      return;
    }
    const totalAmount = session?.total?.total?.minorUnitsAmount;
    const divisor = session?.minorUnitsAmountDivisor || 100;
    sendCheckoutEvent({
      eventName: EVENT_NAMES.CHECKOUT.STEP_COMPLETED_BILLING_DETAILS,
      product: checkoutEventProduct,
      step: CHECKOUT_EVENT_STEPS.BILLING_DETAILS,
      order: {
        order_id: session?.id ?? checkoutIntent?.stripeCheckoutSessionId ?? undefined,
        total_quantity: checkoutIntent?.quantity ?? planDetailsQuantity,
        // Amount actually charged, as reported by Stripe (not price x quantity).
        revenue: totalAmount != null ? totalAmount / divisor : undefined,
      },
    });
  }, [
    checkoutEventProduct,
    checkoutIntent?.uuid,
    checkoutIntent?.quantity,
    checkoutIntent?.stripeCheckoutSessionId,
    planDetailsQuantity,
  ]);

  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();
  const intl = useIntl();
  const { title } = CheckoutPageDetails.BillingDetails;

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
            <StatefulSubscribeButton onPaymentSubmit={handlePaymentSubmit} onPaymentSuccess={handlePaymentSuccess} />
          </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};

export default BillingDetailsPage;
