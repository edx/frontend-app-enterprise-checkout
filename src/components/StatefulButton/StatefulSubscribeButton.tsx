import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { StatefulButton } from '@openedx/paragon';
import { CheckoutContextValue, useCheckout } from '@stripe/react-stripe-js';
import { StripeCheckoutStatus } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent } from '@/components/app/data';
import { termsAndConditions } from '@/components/app/data/constants';
import { queryBffContext } from '@/components/app/data/queries/queries';
import { patchCheckoutIntent } from '@/components/app/data/services/checkout-intent';
import { CheckoutPageRoute, CheckoutSubstepKey, DataStoreKey, EssentialsPageRoute } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { isEssentialsFlow, sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

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
  const hasNavigatedRef = useRef(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
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
      if (checkoutIntent) {
        const { uuid, country, state } = checkoutIntent;
        const tncCheckoutUpdateRequest: CheckoutIntentPatchRequestSchema = {
          country,
          state,
          termsMetadata: termsAndConditions,
        };
        await patchCheckoutIntent({
          uuid,
          requestData: tncCheckoutUpdateRequest,
        });
      }
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
      setErrorMessageKey(buttonMessages.error[response.error?.code] ? response.error?.code : 'fallback');
      logError(
        `[BillingDetails] Error during self service purchasing Stripe checkout for checkoutIntent: ${JSON.stringify(checkoutIntent)}, ${JSON.stringify(response.error)}`,
      );
    }
  };

  useEffect(() => {
    if (statefulButtonState !== 'success' || hasNavigatedRef.current) {
      return;
    }

    if (status.type === 'complete' && status.paymentStatus === 'paid') {
      hasNavigatedRef.current = true;

      // 1. Persist checkout completion
      setCheckoutSessionStatus(status);

      // 2. Refresh BFF context
      queryClient
        .invalidateQueries({
          queryKey: queryBffContext(authenticatedUser.userId ?? null).queryKey,
        })
        .catch((error) => logError(error));

      // 3. Tracking
      sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId: checkoutIntent?.id ?? null,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.PAYMENT_PROCESSED_SUCCESSFULLY,
      });

      // 4. Navigate ONCE
      const isEssentials = isEssentialsFlow();

      navigate(
        isEssentials
          ? EssentialsPageRoute.BillingDetailsSuccess
          : CheckoutPageRoute.BillingDetailsSuccess,
        { replace: true },
      );
    } else {
      // Stripe fallback
      setStatefulButtonState('error');
      setErrorMessageKey('fallback');
    }
  }, [
    statefulButtonState,
    status,
    setCheckoutSessionStatus,
    queryClient,
    authenticatedUser?.userId,
    checkoutIntent?.id,
    navigate,
  ]);

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
