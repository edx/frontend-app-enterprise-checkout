import {
  fetchAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ArrowForward, ErrorOutline } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useContext, useEffect, useRef, useState } from 'react';
import { MessageDescriptor } from 'react-intl';

import { useBFFSuccess, usePolledAuthenticatedUser, usePolledCheckoutIntent } from '@/components/app/data';
import { queryBffSuccess } from '@/components/app/data/queries/queries';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const messages = defineMessages({
  goToDashboard: {
    id: 'checkout.billingDetails.statefulProvisioningButton.success',
    defaultMessage: 'Go to dashboard',
    description: 'Button label when system creates account successfully',
  },
  helpText: {
    inactiveUserMessage: {
      id: 'checkout.billingDetails.statefulProvisioningButton.waiting.inactiveUser',
      defaultMessage: 'Please check your email to complete the account verification process.',
      description: 'Button help text when user account verification is pending',
    },
    stillProvisioningMessage: {
      id: 'checkout.billingDetails.statefulProvisioningButton.waiting.stillProvisioning',
      defaultMessage: 'Please wait while we provision your subscription.',
      description: 'Button help text when the system is still provisioning the subscription',
    },
    provisioningErroredMessage: {
      id: 'checkout.billingDetails.statefulProvisioningButton.errored.provisioning',
      defaultMessage: 'There was an error while provisioning your subscription.',
      description: 'Button help text when the system encountered a terminal error while provisioning the subscription',
    },
    successMessage: {
      id: 'checkout.billingDetails.statefulProvisioningButton.success.provisioning',
      defaultMessage: 'Your subscription has been provisioned!',
      description: 'Button help text to indicate successful provisioning',
    },
  },
});

const StatefulProvisioningButton = () => {
  const queryClient = useQueryClient();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { polledCheckoutIntent } = usePolledCheckoutIntent();
  const { polledAuthenticatedUser } = usePolledAuthenticatedUser();
  const { data: successContext, refetch: refetchUseBFFSuccess } = useBFFSuccess();
  const { checkoutIntent } = successContext || {};
  const [buttonState, setButtonState] = useState<'waiting' | 'success' | 'errored'>('waiting');
  const intl = useIntl();
  // Shouldn't need to consider checkoutIntent.state once adminPortalUrl is
  // serialized onto the polledCheckoutIntent.
  const isFulfillmentComplete = (
    checkoutIntent?.state === 'fulfilled'
    && polledCheckoutIntent?.state === 'fulfilled'
  );
  const isFulfillmentErrored = (
    polledCheckoutIntent && [
      'errored_backoffice',
      'errored_fulfillment_stalled',
      'errored_provisioning',
    ].includes(polledCheckoutIntent.state)
  ) || false;
  const isActivationComplete = polledAuthenticatedUser?.isActive;
  // Track when the Success BFF resyncing is occurring to avoid ovlerlapping calls.
  const resyncSuccessBFFInProgress = useRef(false);

  const onClickHandler = () => {
    // Should read adminPortalUrl from polledCheckoutIntent once it is updated to include it.
    const adminRegisterUrl = `${checkoutIntent!.adminPortalUrl}/admin/subscriptions/manage-learners/`;
    sendEnterpriseCheckoutTrackingEvent({
      // TODO: Transition to tracking CheckoutIntent UUID instead of ID.
      checkoutIntentId: checkoutIntent?.id ?? null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.GO_TO_DASHBOARD_BUTTON_CLICKED,
      properties: {
        adminPortalUrl: adminRegisterUrl,
      },
    });
    // Right before navigating to the admin portal, try to refresh the JWT token one
    // more time in case the last attempt occurred too early.
    fetchAuthenticatedUser({ forceRefresh: true }).finally(() => {
      window.open(adminRegisterUrl, '_blank', 'noopener,noreferrer');
    });
  };

  // Try to keep the polled CheckoutIntent in sync with the BFF CheckoutIntent.
  useEffect(() => {
    if (polledCheckoutIntent?.state !== checkoutIntent?.state && !resyncSuccessBFFInProgress.current) {
      resyncSuccessBFFInProgress.current = true;
      // Invalidate the BFFSuccess query key for the specific admin user,
      // queuing it to be refetched imminently.
      const invalidatePromise = queryClient.invalidateQueries({
        queryKey: queryBffSuccess(authenticatedUser?.userId).queryKey,
      }).then(() => {
        // Actually force a refetch for instant feedback.
        refetchUseBFFSuccess().catch(() => { /* do nothing on error */ });
      });
      // Eagerly refresh the user's JWT token.
      // The self-service fulfillment backend modifies the user's enterprise roles, and
      // the user's browser needs that new role BEFORE we navigate to the admin-portal,
      // or else bad things happen on the admin-portal.
      const refetchJwtPromise = polledCheckoutIntent?.state === 'fulfilled'
        ? fetchAuthenticatedUser({ forceRefresh: true })
        : Promise.resolve();
      // Only when both tasks resolve, set the progress tracker back to false to allow
      // data to be updated again if needed.
      Promise.all([
        invalidatePromise,
        refetchJwtPromise,
      ]).finally(() => {
        resyncSuccessBFFInProgress.current = false;
      });
    }
  }, [
    authenticatedUser?.userId,
    checkoutIntent?.state,
    polledCheckoutIntent?.state,
    queryClient,
    refetchUseBFFSuccess,
  ]);

  useEffect(() => {
    if (isFulfillmentErrored) {
      setButtonState('errored');
    } else if (isFulfillmentComplete && isActivationComplete) {
      setButtonState('success');
    } else {
      setButtonState('waiting');
    }
  }, [isActivationComplete, isFulfillmentComplete, isFulfillmentErrored]);

  const props = {
    labels: {
      errored: intl.formatMessage(messages.goToDashboard),
      success: intl.formatMessage(messages.goToDashboard),
      waiting: intl.formatMessage(messages.goToDashboard),
    },
    icons: {
      errored: <Icon src={ErrorOutline} className="ml-2" />,
      success: <Icon src={ArrowForward} className="ml-2" />,
      waiting: <Icon src={ArrowForward} className="ml-2" />,
    },
    disabledStates: ['errored', 'waiting'],
    type: 'submit',
    variant: 'secondary',
    state: buttonState,
    onClick: onClickHandler,
  };

  let helpTextMessage: MessageDescriptor;
  if (buttonState === 'success') {
    helpTextMessage = messages.helpText.successMessage;
  } else if (buttonState === 'waiting') {
    if (isActivationComplete) {
      helpTextMessage = messages.helpText.stillProvisioningMessage;
    } else {
      helpTextMessage = messages.helpText.inactiveUserMessage;
    }
  } else {
    helpTextMessage = messages.helpText.provisioningErroredMessage;
  }

  const buttonClassNames: string = classNames(
    'mx-auto d-block w-auto',
    {
      'button-icon-right-side': ['success', 'waiting'].includes(buttonState),
    },
  );

  return (
    <>
      <StatefulButton
        data-testid="stateful-provisioning-button"
        data-button-state={buttonState}
        className={buttonClassNames}
        {...props}
      />
      <p
        className="h5 text-muted text-center"
        data-testid="stateful-provisioning-button-help-text"
      >
        {intl.formatMessage(helpTextMessage)}
      </p>
    </>
  );
};

export default StatefulProvisioningButton;
