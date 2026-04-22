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
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data';
import { useCreateCheckoutSessionMutation } from '@/components/app/data/hooks';
import { queryBffContext, queryBffSuccess } from '@/components/app/data/queries/queries';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  DataStoreKey,
  EssentialsPageRoute,
} from '@/constants/checkout';
import EVENT_NAMES, {
  PLAN_TYPE,
} from '@/constants/events';
import {
  useCheckoutFormStore,
  useCurrentPageDetails,
} from '@/hooks/index';
import useCurrentStep from '@/hooks/useCurrentStep';
import { sendEnterpriseCheckoutPageEvent, sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import { isEssentialsFlow } from '../app/routes/loaders/utils';

import AccountDetailsSubmitButton from './AccountDetailsSubmitButton';

const ACCOUNT_DETAILS_RESTORE_ERRORS_KEY = 'accountDetailsRestoreErrors';

const AccountDetailsPage: React.FC = () => {
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const navigate = useNavigate();
  const location = useLocation();

  const accountDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.AccountDetails]);
  const planDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const { data: checkoutIntent } = useCheckoutIntent();
  const queryClient = useQueryClient();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const lmsUserId: number | undefined = authenticatedUser?.userId;

  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();

  const lastTrackedPathRef = useRef<string | null>(null);
  const { currentStepKey } = useCurrentStep();

  // Fire page view tracking event whenever the current step changes
  useEffect(() => {
    // Ensure that the current step is active in the stepper before firing the event
    if (currentStepKey !== CheckoutStepKey.AccountDetails || lastTrackedPathRef.current === location.pathname) {
      return;
    }

    // Avoid double counting: only fire once per pathname
    try {
      sendEnterpriseCheckoutPageEvent({
        checkoutIntentId: checkoutIntent?.id ?? null,
        checkoutIntentUuid: checkoutIntent?.uuid ?? null,
        category: 'enterprise_checkout',
        name: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
        properties: {
          step: currentStepKey,
          plan_type: PLAN_TYPE.TEAMS,
          path: location.pathname,
        },
      });

      lastTrackedPathRef.current = location.pathname;
    } catch (error) {
      logError(
        `Failed to send page view tracking event for ${currentStepKey}`,
        error,
      );
    }
  }, [checkoutIntent?.id, checkoutIntent?.uuid, currentStepKey, location.pathname]);

  const accountDetailsSchema = useMemo(() => (
    formSchema(formValidationConstraints, planDetailsFormData.adminEmail)
  ), [formSchema, formValidationConstraints, planDetailsFormData.adminEmail]);

  const form = useForm<AccountDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: accountDetailsFormData,
  });

  const {
    handleSubmit,
    formState: { isDirty: formIsDirty, isValid: formIsValid, errors: formErrors },
    setError,
    reset: formReset,
    getValues,
  } = form;

  const setCheckoutSessionClientSecret = useCheckoutFormStore((state) => state.setCheckoutSessionClientSecret);

  const createCheckoutSessionMutation = useCreateCheckoutSessionMutation({
    onSuccess: (responseData) => {
      const applyCheckoutSessionClientSecretToCache = (secret: string) => {
        const queryKeysToUpdate = [
          queryBffContext(lmsUserId).queryKey,
          queryBffSuccess(lmsUserId).queryKey,
        ];
        queryKeysToUpdate.forEach(queryKey => {
          queryClient.setQueryData<CheckoutContextResponse>(queryKey, (previous) => {
            if (!previous || !previous.checkoutIntent) {
              return previous;
            }
            return {
              ...previous,
              checkoutIntent: {
                ...previous.checkoutIntent,
                checkoutSessionClientSecret: secret,
              },
            };
          });
        });
      };

      applyCheckoutSessionClientSecretToCache(responseData.checkoutSessionClientSecret);
      setCheckoutSessionClientSecret(responseData.checkoutSessionClientSecret);

      const isEssentials = isEssentialsFlow();
      //     Removed the invalidateQueries() call
      //  The cache is already updated with the secret via setQueryData()
      //  Secret is now persisted in the store
      //  To avoid unnecessary refetch that loses the data
      //
      // const queryKeysToInvalidate = [
      //   queryBffContext(lmsUserId).queryKey,
      //   queryBffSuccess(lmsUserId).queryKey,
      // ];
      // queryKeysToInvalidate.forEach(queryKey => queryClient.invalidateQueries({ queryKey }));

      navigate(
        isEssentials
          ? EssentialsPageRoute.BillingDetails
          : CheckoutPageRoute.BillingDetails,
      );
    },

    onError: (fieldErrors) => {
      if (!fieldErrors) {
        setError('root.serverError', {
          type: 'manual',
          message: 'Server Error',
        });
        return;
      }

      const isProblemOnThisPage = Object.keys(fieldErrors!).every(
        field => Object.keys(accountDetailsFormData).includes(field),
      );

      if (isProblemOnThisPage) {
        Object.entries(fieldErrors!).forEach(([fieldKey, fieldError]) => {
          setError(fieldKey, {
            type: 'manual',
            message: fieldError.errorCode,
          });
        });
      } else {
        setError('root.serverError', {
          type: 'manual',
          message: 'Server Error',
        });
      }
    },
  });

  const { isSuccess: mutationIsSuccess, reset: resetMutation } = createCheckoutSessionMutation;

  useEffect(() => {
    if (!mutationIsSuccess) { return; }
    if (formIsDirty) { resetMutation(); }
  }, [formIsDirty, mutationIsSuccess, resetMutation]);

  const hasPersistedAccountDetailsValues = Object.keys(accountDetailsFormData).length > 0;

  // Restore validation errors when returning from back navigation
  useEffect(() => {
    const shouldRestoreValidation = sessionStorage.getItem(ACCOUNT_DETAILS_RESTORE_ERRORS_KEY) === 'true';
    if (!shouldRestoreValidation || !hasPersistedAccountDetailsValues) {
      return;
    }

    let isActive = true;

    const restoreValidationErrors = async () => {
      try {
        const result = await accountDetailsSchema.safeParseAsync(accountDetailsFormData);
        if (!isActive || result.success) return;

        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0];
          if (typeof fieldName === 'string') {
            setError(fieldName as keyof AccountDetailsData, {
              type: 'manual',
              message: issue.message,
            });
          }
        });
      } catch (error) {
        logError('Failed to restore validation errors', error);
      }
    };

    void restoreValidationErrors();

    return () => {
      isActive = false;
    };
  }, [accountDetailsFormData, accountDetailsSchema, hasPersistedAccountDetailsValues, setError]);

  // Clear the restore flag when user starts editing (form becomes dirty)
  useEffect(() => {
    if (formIsDirty) {
      sessionStorage.removeItem(ACCOUNT_DETAILS_RESTORE_ERRORS_KEY);
    }
  }, [formIsDirty]);

  const onSubmit = (data: AccountDetailsData) => {
    setFormData(DataStoreKey.AccountDetails, data);
    formReset(data);

    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId: checkoutIntent?.id ?? null,
      checkoutIntentUuid: checkoutIntent?.uuid ?? null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.ACCOUNT_DETAILS_CONTINUE_BUTTON_CLICKED,
    });

    if (!createCheckoutSessionMutation.isSuccess) {
      const { companyName, enterpriseSlug } = data;
      const { quantity, adminEmail, stripePriceId } = planDetailsFormData;

      createCheckoutSessionMutation.mutate({
        stripePriceId,
        adminEmail,
        enterpriseSlug,
        companyName,
        quantity,
      });
    } else {
      const isEssentials = isEssentialsFlow();
      navigate(
        isEssentials
          ? EssentialsPageRoute.BillingDetails
          : CheckoutPageRoute.BillingDetails,
      );
    }
  };

  const handleBackClick = () => {
    const hasVisibleValidationErrors = Object.keys(formErrors).length > 0;
    if (hasVisibleValidationErrors) {
      sessionStorage.setItem(ACCOUNT_DETAILS_RESTORE_ERRORS_KEY, 'true');
    } else {
      sessionStorage.removeItem(ACCOUNT_DETAILS_RESTORE_ERRORS_KEY);
    }

    setFormData(DataStoreKey.AccountDetails, {
      ...accountDetailsFormData,
      ...getValues(),
    });

    const isEssentials = isEssentialsFlow();
    navigate(
      isEssentials
        ? EssentialsPageRoute.PlanDetails
        : CheckoutPageRoute.PlanDetails,
    );
  };

  const StepperContent = useStepperContent();
  const eventKey = CheckoutStepKey.AccountDetails;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Account Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <Stack gap={4}>
            <StepperContent form={form} />
          </Stack>
        </Stepper.Step>

        {stepperActionButtonMessage && (
          <Stepper.ActionRow eventKey={eventKey}>
            <Button
              variant="outline-primary"
              onClick={handleBackClick}
            >
              <FormattedMessage
                id="checkout.back"
                defaultMessage="Back"
                description="Button to go back to the previous step"
              />
            </Button>

            <Stepper.ActionRow.Spacer />

            <AccountDetailsSubmitButton
              formIsValid={formIsValid}
              submissionIsPending={createCheckoutSessionMutation.isPending}
              submissionIsSuccess={createCheckoutSessionMutation.isSuccess}
              submissionIsError={createCheckoutSessionMutation.isError}
            />
          </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};

export default AccountDetailsPage;
