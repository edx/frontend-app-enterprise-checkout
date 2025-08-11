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

import { DataStores } from '@/components/Stepper/constants';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  AccountDetailsSchema,
  CheckoutPageDetails,
  CheckoutStepKey,
} from '@/constants/checkout';
import {
  useCheckoutFormStore,
  useCurrentPageDetails,
} from '@/hooks/index';

const AccountDetailsPage: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const accountDetailsFormData = useCheckoutFormStore((state) => state.formData.AccountDetails);

  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const form = useForm<AccountDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(AccountDetailsSchema),
    defaultValues: accountDetailsFormData,
  });
  const {
    title: pageTitle,
    buttonMessage: stepperActionButtonMessage,
  } = useCurrentPageDetails();
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: AccountDetailsData) => {
    setFormData(DataStores.AccountDetailsStoreKey, data);
    navigate(CheckoutPageDetails.BillingDetails.route);
  };

  const StepperContent = useStepperContent();
  const eventKey = CheckoutStepKey.AccountDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Account Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <h1 className="mb-5 text-center" data-testid="stepper-title">
            {intl.formatMessage(pageTitle)}
          </h1>
          <Stack gap={4}>
            <StepperContent form={form} />
          </Stack>
        </Stepper.Step>
        {stepperActionButtonMessage && (
        <Stepper.ActionRow eventKey={eventKey}>
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
