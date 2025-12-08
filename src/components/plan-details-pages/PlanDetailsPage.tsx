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
import { useContext, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useFormValidationConstraints, useRecaptchaToken } from '@/components/app/data';
import {
  useCreateCheckoutIntentMutation,
  useLoginMutation,
  useRegisterMutation,
} from '@/components/app/data/hooks';
import { queryBffContext, queryBffSuccess } from '@/components/app/data/queries/queries';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
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

  // Local state to track immediate form submission (optimistic pending state)
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { getToken } = useRecaptchaToken('signup');

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
      setIsSubmitting(false);
      navigate(CheckoutPageRoute.PlanDetails);
    },
    onError: (errorMessage) => {
      setIsSubmitting(false);
      setError('password', {
        type: 'manual',
        message: errorMessage,
      });
    },
  });

  const registerMutation = useRegisterMutation({
    onSuccess: (response) => {
      // Check if the response contains field-level validation errors for email
      // Expected format: {"email":[{"userMessage":"Unauthorized email address."}],"errorCode":"validation-error"}
      const responseData = response as any;
      const emailErrorMessage = responseData?.errorCode === 'validation-error'
        ? responseData?.email?.[0]?.userMessage
        : null;

      if (emailErrorMessage) {
        setError('adminEmail', {
          type: 'manual',
          message: emailErrorMessage,
        });
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      navigate(CheckoutPageRoute.PlanDetails);
    },
    onError: (errorMessage) => {
      setIsSubmitting(false);
      setError('root.serverError', {
        type: 'manual',
        message: errorMessage || 'Registration failed',
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
    onSuccess: async () => {
      // Invalidate BFF context queries so downstream pages see the new intent.
      await queryClientInvalidate(authenticatedUser?.userId);
      setIsSubmitting(false);
      navigate(CheckoutPageRoute.AccountDetails);
    },
    onError: (errorData) => {
      setIsSubmitting(false);
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
    [SubmitCallbacks.PlanDetails]: async (data: PlanDetailsData) => {
      const { validationDecisions, isValid: isValidAdminEmailField } = await validateFieldDetailed(
        'adminEmail',
        data.adminEmail,
        {},
        true,
      );
      // Always persist plan details first.
      setFormData(DataStoreKey.PlanDetails, data);

      // Determine if user is authenticated; if not, proceed to logistration flows.
      if (!authenticatedUser) {
        // Reset submitting state since we're just navigating, not making an API call
        setIsSubmitting(false);
        // Check if the adminEmail validation returned 'not_registered'
        const adminEmailDecision = validationDecisions?.adminEmail;
        if (!isValidAdminEmailField && adminEmailDecision?.errorCode === 'not_registered') {
          // User is not registered, navigate to registration page
          navigate(CheckoutPageRoute.PlanDetailsRegister);
        } else {
          // User is registered (or other validation state), navigate to login page
          navigate(CheckoutPageRoute.PlanDetailsLogin);
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
    [SubmitCallbacks.PlanDetailsRegister]: async (data: PlanDetailsRegisterPageData) => {
      const recaptchaToken: string | null = await getToken();

      const registerMutationPayload: Partial<RegistrationCreateRequestSchema> = {
        name: data.fullName,
        email: data.adminEmail,
        username: data.username,
        password: data.password,
        country: data.country,
      };

      if (recaptchaToken) {
        registerMutationPayload.recaptchaToken = recaptchaToken;
      }
      registerMutation.mutate(registerMutationPayload);
    },
  };

  const onSubmit = (
    data: PlanDetailsData | PlanDetailsLoginPageData | PlanDetailsRegisterPageData,
  ) => {
    // Set submitting state immediately to provide instant user feedback
    setIsSubmitting(true);
    onSubmitCallbacks[currentPage!](data);
  };

  // Determine which mutation states to surface to the button
  const activeMutation = useMemo(() => {
    switch (currentPage) {
      case SubmitCallbacks.PlanDetails:
        return createCheckoutIntentMutation;
      case SubmitCallbacks.PlanDetailsLogin:
        return loginMutation;
      case SubmitCallbacks.PlanDetailsRegister:
        return registerMutation;
      default:
        // Safe fallback if currentPage is undefined or unexpected.
        return { isPending: false, isSuccess: false, isError: false } as {
          isPending: boolean; isSuccess: boolean; isError: boolean;
        };
    }
  }, [currentPage, createCheckoutIntentMutation, loginMutation, registerMutation]);

  const {
    isPending: submissionIsPending,
    isSuccess: submissionIsSuccess,
    isError: submissionIsError,
  } = activeMutation;

  // Combine isSubmitting (immediate feedback) with actual mutation pending state
  const effectiveSubmissionIsPending = isSubmitting || submissionIsPending;

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
              submissionIsPending={effectiveSubmissionIsPending}
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
