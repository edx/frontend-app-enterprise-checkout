import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useFormValidationConstraints } from '@/components/app/data';
import {
  useCreateCheckoutIntentMutation,
  useLoginMutation,
} from '@/components/app/data/hooks';
import { queryBffContext, queryBffSuccess } from '@/components/app/data/queries/queries';
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

import PlanDetailsSubmitButton from './PlanDetailsSubmitButton';
import '../Stepper/Steps/css/PriceAlert.css';

const PlanDetailsPage = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const planDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const navigate = useNavigate();
  const currentPage = useCurrentPage();
  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();
  const planDetailsSchema = useMemo(() => (
    formSchema(formValidationConstraints, planDetailsFormData.stripePriceId)
  ), [formSchema, formValidationConstraints, planDetailsFormData.stripePriceId]);

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

  // Use existing checkout intent if already created (avoid duplicate POST)
  async function queryClientInvalidate(userId?: number) {
    if (!userId) {
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryBffContext(userId).queryKey }),
      queryClient.invalidateQueries({ queryKey: queryBffSuccess(userId).queryKey }),
    ]);
  }

  const createCheckoutIntentMutation = useCreateCheckoutIntentMutation({
    onSuccess: () => {
      // Invalidate BFF context queries so downstream pages see the new intent.
      queryClientInvalidate(authenticatedUser?.userId);
      navigate(CheckoutPageRoute.AccountDetails);
    },
    onError: (errorData) => {
      // Basic field-level mapping if backend returns validation-like structure.
      if (errorData && typeof errorData === 'object') {
        Object.entries(errorData).forEach(([fieldKey, fieldVal]) => {
          if (fieldKey === 'quantity' && (fieldVal as any)?.errorCode) {
            setError('quantity', {
              type: 'manual',
              message: (fieldVal as any).errorCode,
            });
          }
        });
      } else {
        setError('root.serverError', {
          type: 'manual',
          message: 'Server Error',
        });
      }
    },
  });

  const onSubmitCallbacks: {
    [K in SubmitCallbacks]: (data: PlanDetailsData | PlanDetailsLoginPageData | PlanDetailsRegisterPageData) => void
  } = {
    [SubmitCallbacks.PlanDetails]: (data: PlanDetailsData) => {
      // Always persist plan details first.
      setFormData(DataStoreKey.PlanDetails, data);

      // Determine if user is authenticated; if not, proceed to logistration flows.
      if (!authenticatedUser) {
        // TODO: replace with existing user email logic
        const emailExists = true;
        if (emailExists) {
          navigate(CheckoutPageRoute.PlanDetailsLogin);
        } else {
          navigate(CheckoutPageRoute.PlanDetailsRegister);
        }
        return;
      }

      // Trigger mutation (spinner state handled by button component)
      createCheckoutIntentMutation.mutate({
        quantity: planDetailsFormData.quantity,
        country: planDetailsFormData.country,
        // TODO: Record terms metadata too.
      });
    },
    [SubmitCallbacks.PlanDetailsLogin]: (data: PlanDetailsLoginPageData) => {
      loginMutation.mutate({
        emailOrUsername: data.adminEmail,
        password: data.password,
      });
    },
    [SubmitCallbacks.PlanDetailsRegister]: (data: PlanDetailsRegisterPageData) => {
      // Placeholder for a future register API call.
      navigate(CheckoutPageRoute.PlanDetails);
      return data;
    },
  };

  const onSubmit = (
    data: PlanDetailsData | PlanDetailsLoginPageData | PlanDetailsRegisterPageData,
  ) => onSubmitCallbacks[currentPage!](data);

  // Determine which mutation states to surface to the button
  const isPlanDetailsMain = currentPage === SubmitCallbacks.PlanDetails;
  const submissionIsPending = isPlanDetailsMain
    ? createCheckoutIntentMutation.isPending
    : loginMutation.isPending;
  const submissionIsSuccess = isPlanDetailsMain
    ? createCheckoutIntentMutation.isSuccess
    : loginMutation.isSuccess;
  const submissionIsError = isPlanDetailsMain
    ? createCheckoutIntentMutation.isError
    : loginMutation.isError;

  const StepperContent = useStepperContent();
  const eventKey = CheckoutStepKey.PlanDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Plan Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Plan Details" data-testid="stepper-title">
          <Stack gap={4}>
            <StepperContent form={form} />
          </Stack>
        </Stepper.Step>
        {stepperActionButtonMessage && (
          <Stepper.ActionRow eventKey={eventKey}>
            {location.pathname !== CheckoutPageRoute.PlanDetails && (
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
            )}
            <Stepper.ActionRow.Spacer />
            <PlanDetailsSubmitButton
              formIsValid={isValid}
              submissionIsPending={submissionIsPending}
              submissionIsSuccess={submissionIsSuccess}
              submissionIsError={submissionIsError}
            />
          </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};

export default PlanDetailsPage;
