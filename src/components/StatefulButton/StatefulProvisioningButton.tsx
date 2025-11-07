import {
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ArrowForward } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import { useBFFSuccess, usePolledCheckoutIntent } from '@/components/app/data';
import { queryBffSuccess } from '@/components/app/data/queries/queries';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const buttonMessages = defineMessages({
  pendingInactive: {
    id: 'checkout.billingDetails.statefulProvisioningButton.pending.inactive',
    defaultMessage: 'Your account is pending verification. {b} Please complete the email verification.',
    description: 'Button label when system is currently pending account verification while the admin dashboard is not ready',
  },
  pendingInactiveReady: {
    id: 'checkout.billingDetails.statefulProvisioningButton.pending.inactive-ready',
    defaultMessage: 'Your dashboard is ready. {b} Please check your email to complete the verification to access your dashboard.',
    description: 'Button label when system is currently pending account verification when the admin dashboard is ready',
  },
  success: {
    id: 'checkout.billingDetails.statefulProvisioningButton.success',
    defaultMessage: 'Go to dashboard',
    description: 'Button label when system creates account successfully',
  },
});

const InActiveUserMessage = ({ dashboardReady }: { dashboardReady: boolean }) => (
  <p className="h5 text-muted text-center">
    {dashboardReady ? (
      <FormattedMessage
        id="checkout.billingDetails.statefulProvisioningButton.pending.inactive-ready"
        defaultMessage="Please check your email to complete the verification process to access your dashboard."
        description="Button label when system is currently pending account verification when the admin dashboard is ready"
      />
    ) : (
      <FormattedMessage
        id="checkout.billingDetails.statefulProvisioningButton.pending.inactive"
        defaultMessage="Please check your email to complete the verification process."
        description="Button label when system is currently pending account verification while the admin dashboard is not ready"
      />
    )}
  </p>
);

const StatefulProvisioningButton = () => {
  const queryClient = useQueryClient();
  const authenticatedUser = getAuthenticatedUser();
  const { data: polledCheckoutIntent } = usePolledCheckoutIntent();
  const { data: successContext, refetch } = useBFFSuccess();
  const { checkoutIntent } = successContext || {};
  const [buttonState, setButtonState] = useState('pending');
  const intl = useIntl();
  const dashboardReady: boolean = polledCheckoutIntent?.state === 'fulfilled' && !!checkoutIntent?.adminPortalUrl;
  const [intervalState, setIntervalState] = useState(null);

  const onClickHandler = () => {
    if (buttonState === 'success' && checkoutIntent?.adminPortalUrl && checkoutIntent?.enterpriseSlug) {
      const adminRegisterUrl = `${checkoutIntent.adminPortalUrl}/admin/subscriptions/manage-learners/`;
      sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId: checkoutIntent?.id ?? null,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.GO_TO_DASHBOARD_BUTTON_CLICKED,
        properties: {
          adminPortalUrl: adminRegisterUrl,
        },
      });
      window.open(adminRegisterUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (polledCheckoutIntent?.state !== successContext?.checkoutIntent?.state && !checkoutIntent?.adminPortalUrl) {
      queryClient.invalidateQueries({
        queryKey: queryBffSuccess(authenticatedUser?.userId).queryKey,
      }).catch(() => { /* Do nothing */ });
      refetch().catch(() => { /* Do nothing */ });
    }
  }, [
    authenticatedUser?.userId,
    checkoutIntent?.adminPortalUrl,
    polledCheckoutIntent?.state,
    queryClient,
    refetch,
    successContext?.checkoutIntent?.state,
  ]);

  useEffect(() => {
    if (polledCheckoutIntent) {
      setButtonState('pending');
      if (authenticatedUser.isActive && dashboardReady) {
        setButtonState('success');
      }
      if (['errored_provisioning', 'errored_stripe_checkout'].includes(polledCheckoutIntent?.state)) {
        setButtonState('error');
      }
    }
  }, [authenticatedUser.isActive, checkoutIntent?.adminPortalUrl, dashboardReady, polledCheckoutIntent]);

  const props = {
    labels: {
      success: intl.formatMessage(buttonMessages.success),
    },
    icons: {
      success: <Icon src={ArrowForward} className="ml-2" />,
    },
    type: 'submit',
    variant: 'secondary',
    state: buttonState,
    onClick: onClickHandler,
  };

  if (buttonState === 'pending') {
    return (
      <InActiveUserMessage dashboardReady={dashboardReady} />
    );
  }

  return (
    <StatefulButton
      data-testid="stateful-provisioning-button"
      className={classNames('mx-auto d-block w-auto', {
        'reverse-stateful-provisioning-success': buttonState === 'success',
      })}
      {...props}
    />
  );
};

export default StatefulProvisioningButton;
