import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, Form, Stack, Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import RegisterAccountFields from '@/components/FormFields/RegisterAccountFields';
import PriceAlert from '@/components/PriceAlert/PriceAlert';
import {
  CheckoutStepKey,
  CheckoutStepperPath, PlanDetailsRegistrationSchema,
} from '@/components/Stepper/constants';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

const RegistrationPage: React.FC = () => {
  const planDetailsRegistration = useCheckoutFormStore((state) => state.formData.planDetailsRegistration);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const navigate = useNavigate();

  const form = useForm<PlanDetailsRegistrationData>({
    mode: 'onTouched',
    resolver: zodResolver(PlanDetailsRegistrationSchema),
    defaultValues: planDetailsRegistration,
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: PlanDetailsRegistrationData) => {
    // Store data state
    setFormData('planDetailsRegistration', {
      ...data,
      authenticated: true,
    });
    // TODO: replace with log in / sign up logic and remove anchor
    navigate(CheckoutStepperPath.PlanDetailsRoute);
  };

  const eventKey = CheckoutStepKey.PlanDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Plan Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Plan Details">
          <h1 className="mb-5 text-center">
            <FormattedMessage
              id="checkout.registration.title"
              defaultMessage="Create your Account"
            />
          </h1>
          <Stack gap={4}>
            <PriceAlert />
            <RegisterAccountFields form={form} />
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="secondary"
            type="submit"
            disabled={!isValid}
          >
            <FormattedMessage
              id="checkout.registrationPage.register"
              defaultMessage="Register"
              description="Button label to register a new user in the plan details step"
            />
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default RegistrationPage;
