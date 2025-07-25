import { FormattedMessage } from '@edx/frontend-platform/i18n';
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

import { baseValidation } from '@/components/app/data/constants';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import useBFFValidation from '@/components/app/data/hooks/useBFFValidation';
import {
  AuthenticatedUserField,
  LicensesField,
  NameAndEmailFields,
} from '@/components/FormFields';
import { PriceAlert } from '@/components/PriceAlert';
import {
  CheckoutStepKey,
  CheckoutStepperPath,
  PlanDetailsSchema,
} from '@/constants/checkout';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

import '../Stepper/Steps/css/PriceAlert.css';

const PlanDetailsPage: React.FC = () => {
  const bffContext = useBFFContext();
  console.log(bffContext);
  const bffValidation = useBFFValidation(baseValidation);
  console.log(bffValidation);
  const planFormData = useCheckoutFormStore((state) => state.formData.planDetails);
  const formData = useCheckoutFormStore((state) => state.formData);
  const { planDetailsRegistration, planDetailsLogin } = formData;
  const isAuthenticated = planDetailsRegistration?.authenticated || planDetailsLogin?.authenticated;
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  // TODO: Once the user is logged in, use this field for authenticated user validation
  // const { authenticatedUser } = useContext<AppContext>(AppContext);
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
    setFormData('planDetails', data);

    // TODO: replace with an authenticatedUser
    if (!isAuthenticated) {
      if (randomExistingEmail) {
        navigate(CheckoutStepperPath.LoginRoute);
      } else {
        navigate(CheckoutStepperPath.RegisterRoute);
      }
      return;
    }

    if (isAuthenticated) {
      navigate(CheckoutStepperPath.AccountDetailsRoute);
    }
  };

  const eventKey = CheckoutStepKey.PlanDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Plan Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Plan Details">
          <h1 className="mb-5 text-center">
            <FormattedMessage
              id="checkout.planDetails.title"
              defaultMessage="Plan Details"
            />
          </h1>
          <Stack gap={4}>
            <PriceAlert />
            <LicensesField form={form} />
            {!isAuthenticated && <NameAndEmailFields form={form} />}
            {isAuthenticated && <AuthenticatedUserField orgEmail="test@example.com" fullName="Don Schapps" />}
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="secondary"
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

export default PlanDetailsPage;
