import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useMemo, useState } from 'react';
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
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { queryBffContext, queryBffSuccess } from '@/components/app/data/queries/queries';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  CheckoutSubstepKey,
  DataStoreKey,
  SubmitCallbacks,
} from '@/constants/checkout';
import EVENT_NAMES, { PLAN_TYPE } from '@/constants/events';
import {
  useCheckoutFormStore,
  useCurrentPage,
  useCurrentPageDetails,
} from '@/hooks/index';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

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
  const inEssentials = location.pathname.startsWith('/essentials/');
  const buildCheckoutPath = (route: string) => (
    inEssentials ? `/essentials${route}` : route
  );
  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
    route: expectedRoute,
  } = useCurrentPageDetails();

  const { getToken } = useRecaptchaToken('signup');

  // Get checkout context for tracking
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

  // Fire page view tracking event whenever the current page changes
  useEffect(() => {
    // Ensure that the current URL matches one of the handled routes before firing the event
    const handledRoutes = [
      CheckoutPageRoute.PlanDetails as string,
      CheckoutPageRoute.PlanDetailsLogin as string,
      CheckoutPageRoute.PlanDetailsRegister as string,
    ];

    if (!handledRoutes.includes(location.pathname)) {
      return;
    }

    let step: string;
    switch (location.pathname) {
      case CheckoutPageRoute.PlanDetailsRegister:
        step = CheckoutSubstepKey.Register;
        break;
      case CheckoutPageRoute.PlanDetails:
      case CheckoutPageRoute.PlanDetailsLogin:
      default:
        step = CheckoutStepKey.PlanDetails;
    }

    try {
      sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
        properties: {
          step,
          plan_type: PLAN_TYPE.TEAMS,
        },
      });
    } catch (error) {
      logError(`Failed to send page view tracking event for ${location.pathname}`, error);
    }
  }, [checkoutIntentId, location.pathname]);

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
      navigate(buildCheckoutPath(CheckoutPageRoute.PlanDetails));
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
    onSuccess: () => {
      setIsSubmitting(false);

      // Fire registration success tracking event
      try {
        sendEnterpriseCheckoutTrackingEvent({
          checkoutIntentId,
          eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_REGISTRATION_SUCCESS,
          properties: {
            step: CheckoutSubstepKey.Register,
            plan_type: PLAN_TYPE.TEAMS,
          },
        });
      } catch (error) {
        logError('Failed to send registration success tracking event', error);
      }

      navigate(buildCheckoutPath(CheckoutPageRoute.PlanDetails));
    },
    onError: (errorMessage, errorData) => {
      // Check if the response contains field-level validation errors for email
      const emailErrorMessage = errorData?.errorCode === 'validation-error'
        ? errorData?.email?.[0]?.userMessage
        : null;

      if (emailErrorMessage) {
        setError('adminEmail', {
          type: 'manual',
          message: emailErrorMessage,
        });
      }

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
      navigate(buildCheckoutPath(CheckoutPageRoute.AccountDetails));
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
          navigate(buildCheckoutPath(CheckoutPageRoute.PlanDetailsRegister));
        } else {
          // User is registered (or other validation state), navigate to login page
          navigate(buildCheckoutPath(CheckoutPageRoute.PlanDetailsLogin));
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
        registerMutationPayload.captchaToken = recaptchaToken;
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
                onClick={() => navigate(buildCheckoutPath(CheckoutPageRoute.PlanDetails))}
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
