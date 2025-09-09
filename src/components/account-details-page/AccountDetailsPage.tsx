import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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
import { useNavigate } from 'react-router-dom';

import { useFormValidationConstraints } from '@/components/app/data';
import { useCreateCheckoutSessionMutation } from '@/components/app/data/hooks';
import { queryBffContext, queryBffSuccess } from '@/components/app/data/queries/queries';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {
  CheckoutPageRoute,
  CheckoutStepKey,
  DataStoreKey,
} from '@/constants/checkout';
import {
  useCheckoutFormStore,
  useCurrentPageDetails,
} from '@/hooks/index';

const AccountDetailsPage: React.FC = () => {
  const intl = useIntl();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const navigate = useNavigate();
  const accountDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.AccountDetails]);
  const planDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const setCheckoutSessionClientSecret = useCheckoutFormStore((state) => state.setCheckoutSessionClientSecret);
  const queryClient = useQueryClient();
  // AppContext is not typed upstream.
  // @ts-ignore
  const { authenticatedUser } = useContext(AppContext);
  const lmsUserId: number | undefined = authenticatedUser?.userId;

  const {
    buttonMessage: stepperActionButtonMessage,
    formSchema,
  } = useCurrentPageDetails();

  const accountDetailsSchema = useMemo(() => (
    formSchema(formValidationConstraints)
  ), [formSchema, formValidationConstraints]);

  const form = useForm<AccountDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: accountDetailsFormData,
  });

  const {
    handleSubmit,
    formState: { isValid },
    setError,
  } = form;

  const createCheckoutSessionMutation = useCreateCheckoutSessionMutation({
    onSuccess: (responseData) => {
      // Store the checkout session so that it can be recalled using useCheckoutSession() on subsequent pages.
      setCheckoutSessionClientSecret(responseData.checkoutSessionClientSecret);

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

  const onSubmit = (data: AccountDetailsData) => {
    setFormData(DataStoreKey.AccountDetails, data);

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

export default AccountDetailsPage;
