import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import loginRequest from '@/components/app/data/services/login';
import { DataStores, SubmitCallbacks } from '@/components/Stepper/constants';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageDetails,
  CheckoutStepKey,
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
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const navigate = useNavigate();
  const currentPage = useCurrentPage();
  const {
    title: pageTitle,
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: planDetailsFormData,
  });
  const {
    handleSubmit,
    formState: { isValid },
    setError,
  } = form;

  const loginMutation = useMutation({
    mutationFn: (requestData: LoginRequestSchema) => loginRequest(requestData),
    onSuccess: () => {
      navigate(CheckoutPageDetails.PlanDetails.route);
    },
    onError: (error: any) => {
      // Handle login errors
      const errorMessage = error?.response?.data?.non_field_errors?.[0] || 'Invalid email or password';
      setError('password', {
        type: 'manual',
        message: errorMessage,
      });
    },
  });

  const onSubmitCallbacks: { [K in SubmitCallbacks]: (data) => void } = {
    [SubmitCallbacks.PlanDetailsCallback]: (data: PlanDetailsData) => {
      setFormData(DataStores.PlanDetailsStoreKey, data);

      // TODO: replace with existing user email logic
      const emailExists = !!(Math.random() < 0.5 ? 0 : 1);

      if (!authenticatedUser) {
        if (emailExists) {
          navigate(CheckoutPageDetails.PlanDetailsLogin.route);
        } else {
          navigate(CheckoutPageDetails.PlanDetailsRegister.route);
        }
      } else {
        navigate(CheckoutPageDetails.AccountDetails.route);
      }
    },
    [SubmitCallbacks.PlanDetailsLoginCallback]: (data: PlanDetailsLoginPageData) => {
      loginMutation.mutate({
        emailOrUsername: data.email,
        password: data.password,
      });
    },
    [SubmitCallbacks.PlanDetailsRegisterCallback]: (data: PlanDetailsRegisterPageData) => {
      // TODO: temporarily print data to make linter happy.
      console.log(data);
      // TODO: actually call registerRequest service function.
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
