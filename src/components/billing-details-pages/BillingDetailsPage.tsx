import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { useCheckout } from '@stripe/react-stripe-js';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useFormValidationConstraints } from '@/components/app/data';
import { StatefulSubscribeButton } from '@/components/StatefulButton';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  CheckoutSubstepKey,
  DataStoreKey,
} from '@/constants/checkout';
import { useCheckoutFormStore, useCurrentPageDetails } from '@/hooks/index';

const BillingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const { confirm } = useCheckout();

  const StepperContent = useStepperContent();
  const { data: formValidationConstraints } = useFormValidationConstraints();

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
    setFormData(DataStoreKey.BillingDetails, data);
    await confirm({
      redirect: 'if_required',
      returnUrl: `${window.location.href}/${CheckoutSubstepKey.Success}`,
    });
    navigate(CheckoutPageRoute.BillingDetailsSuccess);
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
