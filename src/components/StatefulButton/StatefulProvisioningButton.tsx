import {
  fetchAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ArrowForward, ErrorOutline } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import { useBFFSuccess, usePolledAuthenticatedUser, usePolledCheckoutIntent } from '@/components/app/data';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const messages = defineMessages({
  goToDashboard: {
    id: 'checkout.billingDetails.statefulProvisioningButton.success',
    defaultMessage: 'Go to dashboard',
    description: 'Button label when system creates account successfully',
  },
});

const StatefulProvisioningButton = () => {
  const { polledCheckoutIntent } = usePolledCheckoutIntent();
  const { polledAuthenticatedUser } = usePolledAuthenticatedUser();
  const { data: successContext } = useBFFSuccess(polledAuthenticatedUser.id);
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

  const buttonClassNames: string = classNames(
    'mx-auto d-block w-auto',
    {
      'button-icon-right-side': ['success', 'waiting'].includes(buttonState),
    },
  );

  return (
    <StatefulButton
      data-testid="stateful-provisioning-button"
      data-button-state={buttonState}
      className={buttonClassNames}
      {...props}
    />
  );
};

export default StatefulProvisioningButton;
