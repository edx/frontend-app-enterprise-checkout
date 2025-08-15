import { useIntl } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageDetails,
  CheckoutStepKey, DataStoreKey,
} from '@/constants/checkout';
import { useCheckoutFormStore, useCurrentPageDetails } from '@/hooks/index';

const BillingDetailsPage: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetailsStoreKey]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const {
    title: pageTitle,
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();
  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: billingDetailsData,
  });

  const {
    handleSubmit,
  } = form;

  const StepperContent = useStepperContent();

  const onSubmit = (data: BillingDetailsData) => {
    setFormData(DataStoreKey.BillingDetailsStoreKey, data);
    navigate(CheckoutPageDetails.BillingDetailsSuccess.route);
  };

  const eventKey = CheckoutStepKey.BillingDetails;
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Billing Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Billing Details">
          <h1 className="mb-5 text-center" data-testid="stepper-title">
            {intl.formatMessage(pageTitle, { firstName: 'Don' })}
          </h1>
          <Stack gap={4}>
            <StepperContent />
          </Stack>
        </Stepper.Step>
        {stepperActionButtonMessage && (
          <Stepper.ActionRow eventKey={eventKey}>
            <Button
              variant="secondary"
              type="submit"
            >
              {intl.formatMessage(stepperActionButtonMessage)}
            </Button>
          </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};
export default BillingDetailsPage;
