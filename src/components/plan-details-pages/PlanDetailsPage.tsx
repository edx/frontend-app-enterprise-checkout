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

import { DataStores, SubmitCallbacks } from '@/components/Stepper/constants';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageDetails,
  CheckoutStepKey,
  PlanDetailsSchema,
} from '@/constants/checkout';
import {
  useCheckoutFormStore,
  useCurrentPage,
  useCurrentPageDetails,
} from '@/hooks/index';

import '../Stepper/Steps/css/PriceAlert.css';

const PlanDetailsPage = () => {
  // TODO: Example usage of retrieving context data and validation
  // const bffContext = useBFFContext();
  // console.log(bffContext.data);
  // const bffValidation = useBFFValidation(baseValidation);
  const intl = useIntl();
  const planDetailsFormData = useCheckoutFormStore((state) => state.formData.PlanDetails);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const isAuthenticated = useCheckoutFormStore((state) => state.isAuthenticated);
  const setIsAuthenticated = useCheckoutFormStore((state) => state.setIsAuthenticated);
  // TODO: Once the user is logged in, use this field for authenticated user validation
  // const { authenticatedUser } = useContext<AppContext>(AppContext);
  const navigate = useNavigate();
  const currentPage = useCurrentPage();
  const {
    title: pageTitle,
    buttonMessage: stepperActionButtonMessage,
  } = useCurrentPageDetails();

  const form = useForm<PlanDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(PlanDetailsSchema),
    defaultValues: planDetailsFormData,
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmitCallbacks: { [K in SubmitCallbacks]: (data: PlanDetailsData) => void } = {
    [SubmitCallbacks.PlanDetailsCallback]: (data: PlanDetailsData) => {
      setFormData(DataStores.PlanDetailsStoreKey, data);

      // TODO: replace with existing user email logic
      const randomExistingEmail = !!(Math.random() < 0.5 ? 0 : 1);

      // TODO: replace with an authenticatedUser
      if (!isAuthenticated) {
        if (randomExistingEmail) {
          navigate(CheckoutPageDetails.PlanDetailsLogin.route);
        } else {
          navigate(CheckoutPageDetails.PlanDetailsRegister.route);
        }
        return;
      }

      if (isAuthenticated) {
        navigate(CheckoutPageDetails.AccountDetails.route);
      }
    },
    [SubmitCallbacks.PlanDetailsLoginCallback]: () => {
      setIsAuthenticated(true);
      navigate(CheckoutPageDetails.PlanDetails.route);
    },
    [SubmitCallbacks.PlanDetailsRegisterCallback]: () => {
      setIsAuthenticated(true);
      navigate(CheckoutPageDetails.PlanDetails.route);
    },
  };

  const onSubmit = (data: PlanDetailsData) => onSubmitCallbacks[currentPage!](data);

  const StepperContent = useStepperContent();
  const eventKey = CheckoutStepKey.PlanDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Plan Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Plan Details" data-testid="stepper-title">
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

// @ts-ignore
export default PlanDetailsPage;
