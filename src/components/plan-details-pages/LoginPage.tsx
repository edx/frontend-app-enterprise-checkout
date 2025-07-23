import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, Form, Stack, Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import LoginFields from '@/components/FormFields/LoginFields';
import PriceAlert from '@/components/PriceAlert/PriceAlert';
import {
  CheckoutStepKey,
  CheckoutStepperPath, PlanDetailsLoginSchema,
} from '@/components/Stepper/constants';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

const LoginPage: React.FC = () => {
  const planDetailsLogin = useCheckoutFormStore((state) => state.formData.planDetailsLogin);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const navigate = useNavigate();

  const form = useForm<PlanDetailsLoginData>({
    mode: 'onTouched',
    resolver: zodResolver(PlanDetailsLoginSchema),
    defaultValues: planDetailsLogin,
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: PlanDetailsData) => {
    setFormData('planDetailsLogin', {
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
              id="checkout.login.title"
              defaultMessage="Log in to your account"
            />
          </h1>
          <Stack gap={4}>
            <PriceAlert />
            <LoginFields form={form} />
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

export default LoginPage;
