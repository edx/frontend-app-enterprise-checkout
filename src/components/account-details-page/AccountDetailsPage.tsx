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
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import {
  AccountDetailsSchema,
  CheckoutStepKey,
  CheckoutStepperPath, CheckoutSubstepKey,
} from '@/components/Stepper/constants';
import useStepperContent from '@/components/Stepper/Steps/hooks/useStepperContent';
import { determineStepperButtonText, determineStepperTitleText } from '@/components/Stepper/utils';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

const AccountDetailsPage: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const accountFormData = useCheckoutFormStore((state) => state.formData.createAccount);
  const { step, substep } = useParams<{ step: CheckoutStepKey, substep: CheckoutSubstepKey }>();

  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const form = useForm<AccountDetailsData>({
    mode: 'onBlur',
    resolver: zodResolver(AccountDetailsSchema),
    defaultValues: accountFormData,
  });
  const {
    handleSubmit,
  } = form;

  const onSubmit = (data: AccountDetailsData) => {
    setFormData('createAccount', data);
    navigate(CheckoutStepperPath.BillingDetailsRoute);
  };

  const eventKey = CheckoutStepKey.AccountDetails;

  const StepperContent = useStepperContent();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Account Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <h1 className="mb-5 text-center" data-testid="stepper-title">
            {intl.formatMessage(determineStepperTitleText({ step, substep }))}
          </h1>
          <Stack gap={4}>
            <StepperContent />
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="secondary"
            type="submit"
          >
            {intl.formatMessage(determineStepperButtonText({ step, substep }))}
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default AccountDetailsPage;
