import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { StatefulButton } from '@openedx/paragon';
import { CheckoutContextValue, useCheckout } from '@stripe/react-stripe-js';
import { StripeCheckoutStatus } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent } from '@/components/app/data';
import { termsAndConditions } from '@/components/app/data/constants';
import { queryBffContext } from '@/components/app/data/queries/queries';
import { patchCheckoutIntent } from '@/components/app/data/services/checkout-intent';
import { CheckoutPageRoute, CheckoutSubstepKey, DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

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

interface StatefulSubscribeButtonProps {
  onClick?: () => void;
}

const StatefulSubscribeButton: React.FC<StatefulSubscribeButtonProps> = ({ onClick }) => {
  const [statefulButtonState, setStatefulButtonState] = useState('default');
  const [errorMessageKey, setErrorMessageKey] = useState('fallback');
  const { data: checkoutIntent } = useCheckoutIntent();
  const intl = useIntl();

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

  const requiredBillingFields: Array<keyof BillingDetailsData> = [
    'fullName',
    'country',
    'line1',
    'city',
    'state',
    'zip',
    'confirmTnC',
    'confirmSubscription',
    'confirmRecurringSubscription',
  ];
  const hasMissingRequiredField = requiredBillingFields.some((field) => !billingDetailsData?.[field]);
  const isFormValid = canConfirm && !hasMissingRequiredField;

  const onClickHandler = async () => {
    // Call the parent's onClick handler first (e.g., for tracking)
    onClick?.();

    // Sets the button to pending state and then calls confirm()
    setStatefulButtonState('pending');

    // Step 1: Persist T&C acceptance on the checkout intent before charging.
    // This is a separate try-catch so patchCheckoutIntent failures are clearly
    // distinguished from Stripe confirm() failures and never silently swallowed.
    if (checkoutIntent) {
      const { uuid, country, state } = checkoutIntent;
      const tncCheckoutUpdateRequest: CheckoutIntentPatchRequestSchema = {
        country,
        state,
        termsMetadata: termsAndConditions,
      };
      try {
        await patchCheckoutIntent({
          uuid,
          requestData: tncCheckoutUpdateRequest,
        });
      } catch (patchError) {
        const detail = patchError instanceof Error
          ? patchError.message
          : JSON.stringify(patchError);
        logError(
          `[BillingDetails] Failed to record terms acceptance before Stripe confirm – checkoutIntent: ${JSON.stringify(checkoutIntent)}, error: ${detail}`,
        );
        setStatefulButtonState('error');
        setErrorMessageKey('fallback');
        return;
      }
    }

    // Step 2: Confirm Stripe checkout. confirm() returns a StripeCheckoutStatus;
    // it should not throw, but we guard against unexpected rejections anyway.
    let response;
    try {
      response = await confirm({
        redirect: 'if_required',
        returnUrl: `${window.location.href}/${CheckoutSubstepKey.Success}`,
      });
    } catch (confirmError) {
      // confirm() threw instead of returning a status — convert to a safe error state.
      const detail = confirmError instanceof Error
        ? confirmError.message
        : JSON.stringify(confirmError);
      logError(
        `[BillingDetails] Stripe confirm() threw unexpectedly – checkoutIntent: ${JSON.stringify(checkoutIntent)}, error: ${detail}`,
      );
      setStatefulButtonState('error');
      setErrorMessageKey('fallback');
      return;
    }

    // Step 3: Map the Stripe response type to a button state.
    // Stripe responses map 1:1 to button states except for 'default' which is the initial state.
    setStatefulButtonState(response?.type ?? 'error');
    if (response?.type === 'error') {
      setErrorMessageKey(buttonMessages.error[response.error?.code] ? response.error?.code : 'fallback');
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
        queryClient.invalidateQueries({
          queryKey: queryBffContext(
            authenticatedUser.userId ?? null,
          ).queryKey,
        })
          .then(data => data)
          .catch(error => logError(error));
        sendEnterpriseCheckoutTrackingEvent({
          checkoutIntentId: checkoutIntent?.id ?? null,
          eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.PAYMENT_PROCESSED_SUCCESSFULLY,
        });
        navigate(CheckoutPageRoute.BillingDetailsSuccess);
      } else {
        // Fallback if the payment succeeded but the intent
        // status is not complete or paymentStatus is not paid. from Stripe.
        setStatefulButtonState('error');
        setErrorMessageKey('fallback');
      }
    }
  }, [
    statefulButtonState,
    status,
    setCheckoutSessionStatus,
    queryClient,
    authenticatedUser,
    navigate,
    checkoutIntent?.id,
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

StatefulSubscribeButton.propTypes = {
  onClick: PropTypes.func,
};

StatefulSubscribeButton.defaultProps = {
  onClick: undefined,
};

export default StatefulSubscribeButton;
