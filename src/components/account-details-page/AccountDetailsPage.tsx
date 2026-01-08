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
import { useContext, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data';
import { useCreateCheckoutSessionMutation } from '@/components/app/data/hooks';
import { queryBffContext, queryBffSuccess } from '@/components/app/data/queries/queries';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  DataStoreKey,
} from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import {
  useCheckoutFormStore,
  useCurrentPageDetails,
} from '@/hooks/index';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import AccountDetailsSubmitButton from './AccountDetailsSubmitButton';

const AccountDetailsPage: React.FC = () => {
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const navigate = useNavigate();
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
    formState: { isDirty: formIsDirty, isValid: formIsValid },
    setError,
    reset: formReset,
  } = form;

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

      // Invalidate any queries that might be impacted by the creation of a checkout session.
      const queryKeysToInvalidate = [
        queryBffContext(lmsUserId).queryKey, // Includes a serialized CheckoutIntent with checkout session ID.
        queryBffSuccess(lmsUserId).queryKey, // Includes a serialized CheckoutIntent with checkout session ID.
      ];
      queryKeysToInvalidate.forEach(queryKey => queryClient.invalidateQueries({ queryKey }));

      // Move on to the next page where useCheckoutSession() will power the Stripe components.
      navigate(CheckoutPageRoute.BillingDetails);
    },
    onError: (fieldErrors) => {
      if (!fieldErrors) {
        setError('root.serverError', {
          type: 'manual',
          message: 'Server Error',
        });
        return;
      }
      // Test that fieldErrors are a subset of fields on this page.
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

  // Reset the mutation when form fields change AFTER a mutation has run once
  // already but the user revisited this page via the back button.
  //
  // This causes the Continue button to change appearance by removing the
  // success checkmark, and it unlocks the onSubmit callback to perform
  // side-effects again.
  const { isSuccess: mutationIsSuccess, reset: resetMutation } = createCheckoutSessionMutation;
  useEffect(() => {
    // Only allow resetting if the last call was successful.
    if (!mutationIsSuccess) {
      return;
    }
    // Only reset the mutation when the form has changed since the last submission attempt.
    if (formIsDirty) {
      resetMutation();
    }
  }, [
    formIsDirty,
    mutationIsSuccess,
    resetMutation,
  ]);

  // Handle whenever the Continue button is clicked.
  const onSubmit = (data: AccountDetailsData) => {
    // Update persisted form state with new field values.
    setFormData(DataStoreKey.AccountDetails, data);

    // Also reset the form itself to make formIsDirty=false again.
    formReset(data);

    // Emit Segment event representing the account details page continue button was clicked.
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId: checkoutIntent?.id ?? null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.ACCOUNT_DETAILS_CONTINUE_BUTTON_CLICKED,
    });

    // Don't perform side-effect when the mutation has already succeeded.
    if (!createCheckoutSessionMutation.isSuccess) {
      // Create a new checkout session needed for the billing details page (next).
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
      // We won't perform side-effect, so just proceed to next page.
      navigate(CheckoutPageRoute.BillingDetails);
    }
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
            onClick={() => navigate(CheckoutPageRoute.PlanDetails)}
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
