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

import { useFormValidationConstraints } from '@/components/app/data';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  DataStoreKey,
} from '@/constants/checkout';
import {
  useCheckoutFormStore,
  useCurrentPageDetails,
} from '@/hooks/index';

const AccountDetailsPage: React.FC = () => {
  const intl = useIntl();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const navigate = useNavigate();
  const accountDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.AccountDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();

  const accountDetailsSchema = useMemo(() => (
    formSchema(formValidationConstraints)
  ), [formSchema, formValidationConstraints]);

  const form = useForm<AccountDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: accountDetailsFormData,
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: AccountDetailsData) => {
    setFormData(DataStoreKey.AccountDetails, data);
    navigate(CheckoutPageRoute.BillingDetails);
  };

  const StepperContent = useStepperContent();
  const eventKey = CheckoutStepKey.AccountDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Account Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <Stack gap={4}>
            <StepperContent form={form} />
          </Stack>
        </Stepper.Step>
        {stepperActionButtonMessage && (
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="outline-primary"
            onClick={() => navigate(CheckoutPageRoute.PlanDetails)}
          >
            <FormattedMessage
              id="checkout.back"
              defaultMessage="Back"
              description="Button to go back to the previous step"
            />
          </Button>
          <Stepper.ActionRow.Spacer />
          <Button
            variant="secondary"
            type="submit"
            disabled={!isValid}
            data-testid="stepper-submit-button"
          >
            {intl.formatMessage(stepperActionButtonMessage)}
          </Button>
        </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};

export default AccountDetailsPage;
