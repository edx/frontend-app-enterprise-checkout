import { AppContext } from '@edx/frontend-platform/react';
import { StatefulButton } from '@openedx/paragon';
import { useCheckout } from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { queryBffContext } from '@/components/app/data/queries/queries';
import { CheckoutPageRoute, DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const variants = {
  default: 'secondary',
  pending: 'secondary',
  error: 'danger',
  success: 'success',
};

const StatefulSubscribeButton = () => {
  const queryClient = useQueryClient();
  const { authenticatedUser }: AuthenticatedUser = useContext(AppContext);
  const { canConfirm, status } = useCheckout();
  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);
  const hasInvalidTerms = Object.values(billingDetailsData).some((value) => !value);
  const isFormValid = canConfirm && !hasInvalidTerms;
  const [statefulButtonState, setStatefulButtonState] = useState('default');
  const navigate = useNavigate();
  const clickHandler = () => {
    if (status.type === 'open') {
      // The checkout form is open and ready to be confirmed.
      setStatefulButtonState('pending');
    }
  };
  console.log({ isFormValid, hasInvalidTerms, canConfirm }, useCheckout());
  useEffect(() => {
    if (statefulButtonState === 'pending' && (status.type === 'complete' && status.paymentStatus === 'paid')) {
      setStatefulButtonState('success');
      queryClient.invalidateQueries(
        // @ts-ignore
        queryBffContext(
          authenticatedUser.id,
        ).queryKey,
      );
      navigate(CheckoutPageRoute.BillingDetailsSuccess);
    }
  }, [authenticatedUser.id, navigate, queryClient, statefulButtonState, status]);

  const props = {
    labels: {
      default: 'Subscribe',
      pending: 'Processing...',
      error: 'Error, try again later.',
      success: 'Success',
    },
    type: 'submit',
    variant: variants[statefulButtonState],
    // disabled: !isFormValid,
    disabledStates: ['pending'],
    onClick: clickHandler,
    state: statefulButtonState,
  };

  return (
    <StatefulButton {...props} />
  );
};

export default StatefulSubscribeButton;
