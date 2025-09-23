import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { StatefulButton } from '@openedx/paragon';
import { useCheckout } from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateCheckoutSessionMutation } from '@/components/app/data';
import { queryBffContext, queryBffSuccess } from '@/components/app/data/queries/queries';
import { CheckoutPageRoute, DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const variants = {
  default: 'secondary',
  pending: 'secondary',
  error: 'danger',
  success: 'success',
};

const StatefulSubscribeButton = () => {
  const [statefulButtonState, setStatefulButtonState] = useState('default');

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { authenticatedUser }: AuthenticatedUser = useContext(AppContext);
  const { canConfirm, status } = useCheckout();

  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);
  const setCheckoutSessionStatus = useCheckoutFormStore((state) => state.setCheckoutSessionStatus);
  const planDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const accountDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.AccountDetails]);
  const setCheckoutSessionClientSecret = useCheckoutFormStore((state) => state.setCheckoutSessionClientSecret);

  const hasInvalidTerms = Object.values(billingDetailsData).some((value) => !value);
  const isFormValid = canConfirm && !hasInvalidTerms;
  const lmsUserId: number | undefined = authenticatedUser?.userId;

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
    },
    onError: (errors) => {
      logError(errors);
    },
  });

  const clickHandler = () => {
    if (status.type === 'open') {
      // The checkout form is open and ready to be confirmed.
      setStatefulButtonState('pending');
    }
  };

  useEffect(() => {
    if (statefulButtonState === 'pending' && (status.type === 'complete' && status.paymentStatus === 'paid')) {
      setStatefulButtonState('success');
      setCheckoutSessionStatus(status);
      queryClient.invalidateQueries(
        // @ts-ignore
        queryBffContext(
          authenticatedUser.id,
        ).queryKey,
      )
        .then(data => data)
        .catch(error => logError(error));
      navigate(CheckoutPageRoute.BillingDetailsSuccess);
    }
  }, [
    accountDetailsData,
    authenticatedUser.id,
    createCheckoutSessionMutation,
    navigate,
    planDetailsData,
    queryClient,
    setCheckoutSessionStatus,
    statefulButtonState,
    status,
  ]);

  const props = {
    labels: {
      default: 'Subscribe',
      pending: 'Processing...',
      error: 'Error, try again later.',
      success: 'Success',
    },
    type: 'submit',
    variant: variants[statefulButtonState],
    disabled: !isFormValid,
    disabledStates: ['pending'],
    onClick: clickHandler,
    state: statefulButtonState,
  };

  return (
    <StatefulButton {...props} />
  );
};

export default StatefulSubscribeButton;
