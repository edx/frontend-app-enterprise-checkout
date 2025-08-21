import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { useContext, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useFormValidationConstraints } from '@/components/app/data';
import { useLoginMutation } from '@/components/app/data/hooks';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  DataStoreKey,
  SubmitCallbacks,
} from '@/constants/checkout';
import {
  useCheckoutFormStore,
  useCurrentPage,
  useCurrentPageDetails,
} from '@/hooks/index';

import '../Stepper/Steps/css/PriceAlert.css';

const PlanDetailsPage = () => {
  const intl = useIntl();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const planDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const navigate = useNavigate();
  const currentPage = useCurrentPage();

  const {
    title: pageTitle,
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();

  const planDetailsSchema = useMemo(() => (
    formSchema(formValidationConstraints)
  ), [formSchema, formValidationConstraints]);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(planDetailsSchema),
    defaultValues: planDetailsFormData,
  });
  const {
    handleSubmit,
    formState: { isValid },
    setError,
  } = form;

  const loginMutation = useLoginMutation({
    onSuccess: () => {
      navigate(CheckoutPageRoute.PlanDetails);
    },
    onError: (errorMessage) => {
      setError('password', {
        type: 'manual',
        message: errorMessage,
      });
    },
  });

  const onSubmitCallbacks: {
    [K in SubmitCallbacks]: (data: PlanDetailsData | PlanDetailsLoginPageData | PlanDetailsRegisterPageData) => void
  } = {
    [SubmitCallbacks.PlanDetails]: (data: PlanDetailsData) => {
      setFormData(DataStoreKey.PlanDetails, data);

      // TODO: replace with existing user email logic
      const emailExists = !!(Math.random() < 0.5 ? 0 : 1);
      if (!authenticatedUser) {
        if (emailExists) {
          navigate(CheckoutPageRoute.PlanDetailsLogin);
        } else {
          navigate(CheckoutPageRoute.PlanDetailsRegister);
        }
      } else {
        navigate(CheckoutPageRoute.AccountDetails);
      }
    },
    [SubmitCallbacks.PlanDetailsLogin]: (data: PlanDetailsLoginPageData) => {
      loginMutation.mutate({
        emailOrUsername: data.adminEmail,
        password: data.password,
      });
    },
    [SubmitCallbacks.PlanDetailsRegister]: (data: PlanDetailsRegisterPageData) => {
      // TODO: actually call registerRequest service function.
      navigate(CheckoutPageRoute.PlanDetails);
      // TODO: temporarily return data to make linter happy.
      return data;
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
