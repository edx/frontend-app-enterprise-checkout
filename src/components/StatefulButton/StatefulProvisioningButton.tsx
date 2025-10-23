import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ArrowForward } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';

import { useBFFSuccess, usePolledCheckoutIntent } from '@/components/app/data';
import { queryBffSuccess } from '@/components/app/data/queries/queries';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const buttonMessages = defineMessages({
  success: {
    id: 'checkout.billingDetails.statefulProvisioningButton.success',
    defaultMessage: 'Go to dashboard',
    description: 'Button label when system creates account successfully',
  },
});

const StatefulProvisioningButton = () => {
  const queryClient = useQueryClient();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: polledCheckoutIntent } = usePolledCheckoutIntent();
  const { data: successContext, refetch } = useBFFSuccess();
  const { checkoutIntent } = successContext || {};
  const [buttonState, setButtonState] = useState('pending');
  const intl = useIntl();

  const onClickHandler = () => {
    if (buttonState === 'success' && checkoutIntent?.adminPortalUrl && checkoutIntent?.enterpriseSlug) {
      const adminRegisterUrl = `${checkoutIntent.adminPortalUrl}/admin/register`;
      sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId: checkoutIntent?.id ?? null,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.GO_TO_DASHBOARD_BUTTON_CLICKED,
        properties: {
          adminPortalUrl: adminRegisterUrl,
        },
      });
      window.location.href = adminRegisterUrl;
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
      if (polledCheckoutIntent?.state === 'fulfilled' && checkoutIntent?.adminPortalUrl) {
        setButtonState('success');
      }
      if (['errored_provisioning', 'errored_stripe_checkout'].includes(polledCheckoutIntent?.state)) {
        setButtonState('error');
      }
    }
  }, [checkoutIntent?.adminPortalUrl, polledCheckoutIntent]);

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

  if (buttonState !== 'success') {
    return null;
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
