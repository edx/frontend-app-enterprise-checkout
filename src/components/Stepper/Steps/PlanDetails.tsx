import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, Form, Stack, Stepper,
} from '@openedx/paragon';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import AuthenticatedUserField from '@/components/FormFields/AuthenticatedUserField';
import LicensesField from '@/components/FormFields/LicensesField';
import LoginFields from '@/components/FormFields/LoginFields';
import NameAndEmailFields from '@/components/FormFields/NameAndEmailFields';
import RegisterAccountFields from '@/components/FormFields/RegisterAccountFields';
import {
  PlanDetailsSchema,
  CheckoutStepKey,
  CheckoutSubstepKey, CheckoutStepperPath,
} from '@/components/Stepper/constants';
import PriceAlert from '@/components/Stepper/Steps/PriceAlert';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

import './css/PriceAlert.css';

const PlanDetails: React.FC = () => {
  const planFormData = useCheckoutFormStore((state) => state.formData.planDetails);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  // TODO: Once the user is logged in, use this field for authenticated user validation
  // const { authenticatedUser } = useContext(AppContext);
  const [existingUserEmail, setExistingUserEmail] = useState(null);
  const [authenticatedUserState, setAuthenticatedUserState] = useState(null);
  const { substep } = useParams<{ substep: CheckoutSubstepKey }>();

  const navigate = useNavigate();

  const form = useForm<PlanDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(PlanDetailsSchema),
    defaultValues: planFormData,
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: PlanDetailsData) => {
    // TODO: replace with existing user email logic
    const randomExistingEmail = !!(Math.random() < 0.5 ? 0 : 1);
    if (data.orgEmail) {
      // @ts-ignore
      setExistingUserEmail(randomExistingEmail);
    }
    setFormData('planDetails', data);

    // TODO: replace with an authenticatedUser
    if (authenticatedUserState) {
      navigate(CheckoutStepperPath.AccountDetailsRoute);
      return;
    }

    // TODO: replace with log in / sign up logic and remove anchor
    if (substep) {
      // @ts-ignore
      setAuthenticatedUserState(true);
      navigate(CheckoutStepperPath.PlanDetailsRoute);
      return;
    }

    // TODO: Update to do validation on existing user email
    if (!substep && randomExistingEmail) {
      navigate(CheckoutStepperPath.LoginRoute);
    } else {
      navigate(CheckoutStepperPath.RegisterRoute);
    }
  };

  const eventKey = CheckoutStepKey.PlanDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Build Trial" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Build Trial">
          <h1 className="mb-5 text-center">
            <FormattedMessage
              id="checkout.buildTrial.title"
              defaultMessage="Build your free trial"
            />
          </h1>
          <Stack gap={4}>
            <PriceAlert />
            {(!substep || authenticatedUserState) && <LicensesField form={form} />}
            {existingUserEmail === null && <NameAndEmailFields form={form} />}
            {(substep === 'login' && !authenticatedUserState) && <LoginFields form={form} />}
            {(substep === 'register' && !authenticatedUserState) && <RegisterAccountFields form={form} />}
            {authenticatedUserState && <AuthenticatedUserField orgEmail="test@example.com" fullName="Don Schapps" />}
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="brand"
            type="submit"
            disabled={!isValid}
          >
            <FormattedMessage
              id="checkout.planDetails.continue"
              defaultMessage="Continue"
              description="Button label for the next step in the plan details step"
            />
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default PlanDetails;
