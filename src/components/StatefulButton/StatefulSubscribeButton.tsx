import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { StatefulButton } from '@openedx/paragon';
import { CheckoutContextValue, useCheckout } from '@stripe/react-stripe-js';
import { StripeCheckoutStatus } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent } from '@/components/app/data';
import { queryBffContext } from '@/components/app/data/queries/queries';
import { CheckoutPageRoute, CheckoutSubstepKey, DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const variants = {
  default: 'secondary',
  pending: 'secondary',
  error: 'danger',
  success: 'success',
};

const buttonMessages = defineMessages({
  default: {
    id: 'checkout.billingDetails.statefulSubscribeButton.subscribe',
    defaultMessage: 'Subscribe',
    description: 'Button label for subscription',
  },
  pending: {
    id: 'checkout.billingDetails.statefulSubscribeButton.processing',
    defaultMessage: 'Processing...',
    description: 'Button label when processing subscription',
  },
  error: {
    paymentFailed: {
      id: 'checkout.billingDetails.statefulSubscribeButton.declined_card.error',
      defaultMessage: 'Error, card declined.',
      description: 'Button label when subscription error on declined card',
    },
    fallback: {
      id: 'checkout.billingDetails.statefulSubscribeButton.generic.error',
      defaultMessage: 'Error, try again later.',
      description: 'Button label when subscription error occurs',
    },
  },
  success: {
    id: 'checkout.billingDetails.statefulSubscribeButton.success',
    defaultMessage: 'Success',
    description: 'Button label when subscription is successful',
  },
});

const StatefulSubscribeButton = () => {
  const [statefulButtonState, setStatefulButtonState] = useState('default');
  const [errorMessageKey, setErrorMessageKey] = useState('fallback');
  const { data: checkoutIntent } = useCheckoutIntent();
  const intl = useIntl();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { authenticatedUser }: AuthenticatedUser = useContext(AppContext);
  const {
    canConfirm,
    status,
    confirm,
  }: {
    canConfirm: CheckoutContextValue['canConfirm'],
    status: StripeCheckoutStatus,
    confirm: CheckoutContextValue['confirm'],
  } = useCheckout();
  const billingDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);
  const setCheckoutSessionStatus = useCheckoutFormStore((state) => state.setCheckoutSessionStatus);

  const hasInvalidTerms = Object.values(billingDetailsData).some((value) => !value);
  const isFormValid = canConfirm && !hasInvalidTerms;

  const onClickHandler = async () => {
    // Sets the button to pending state and then calls confirm()
    setStatefulButtonState('pending');

    // Calls confirm() to start the Stripe checkout flow.
    let response;
    try {
      response = await confirm({
        redirect: 'if_required',
        returnUrl: `${window.location.href}/${CheckoutSubstepKey.Success}`,
      });
    } catch (error) {
      response = error;
    }
    // Set the button to the appropriate state based on the response.
    // Stripe responses map 1:1 to button states except for 'default' which is the initial state.
    setStatefulButtonState(response.type || 'default');
    if (response.type === 'error') {
      setErrorMessageKey(buttonMessages.error[response.error.code] ? response.error.code : 'fallback');
      logError(
        `[BillingDetails] Error during self service purchasing Stripe checkout for checkoutIntent: ${JSON.stringify(checkoutIntent)}, ${JSON.stringify(response.error)}`,
      );
    }
  };

  useEffect(() => {
    if (statefulButtonState === 'success') {
      // If the payment succeeded, update the checkout session status.
      if (status.type === 'complete' && status.paymentStatus === 'paid') {
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
      } else {
        // Fallback if the payment succeeded but the intent
        // status is not complete or paymentStatus is not paid. from Stripe.
        setStatefulButtonState('error');
        setErrorMessageKey('fallback');
      }
    }
  }, [statefulButtonState, status, setCheckoutSessionStatus, queryClient, authenticatedUser, navigate]);

  const props = {
    labels: {
      default: intl.formatMessage(buttonMessages.default),
      pending: intl.formatMessage(buttonMessages.pending),
      error: intl.formatMessage(buttonMessages.error[errorMessageKey]),
      success: intl.formatMessage(buttonMessages.success),
    },
    type: 'submit',
    variant: variants[statefulButtonState],
    disabled: !isFormValid,
    disabledStates: ['pending'],
    onClick: onClickHandler,
    state: statefulButtonState,
  };

  return (
    <StatefulButton {...props} />
  );
};

export default StatefulSubscribeButton;
