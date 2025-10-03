import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ArrowForward, SpinnerSimple } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';

import { useBFFSuccess, usePolledCheckoutIntent } from '@/components/app/data';

const variants = {
  default: 'secondary',
  pending: 'secondary',
  error: 'danger',
  success: 'secondary',
};

const buttonMessages = defineMessages({
  pending: {
    id: 'checkout.billingDetailsSuccess.statefulProvisioningButton.creating_account.',
    defaultMessage: 'Creating your account',
    description: 'Button label when processing subscription',
  },
  error: {
    id: 'checkout.billingDetailsSuccess.statefulProvisioningButton.error_provisioning',
    defaultMessage: 'Error, try again.',
    description: 'Button label when system errors creating an account',
  },
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
  const [statefulButtonState, setStatefulButtonState] = useState('pending');
  const intl = useIntl();

  const onClickHandler = () => {
    if (statefulButtonState === 'success' && checkoutIntent?.adminPortalUrl) {
      window.location.href = checkoutIntent.adminPortalUrl;
    }
  };

  useEffect(() => {
    if (polledCheckoutIntent?.state !== successContext?.checkoutIntent?.state && !checkoutIntent?.adminPortalUrl) {
      refetch();
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
      setStatefulButtonState('pending');
      if (polledCheckoutIntent?.state === 'fulfilled' && checkoutIntent?.adminPortalUrl) {
        setStatefulButtonState('success');
      }
      if (['errored_provisioning', 'errored_stripe_checkout'].includes(polledCheckoutIntent?.state)) {
        setStatefulButtonState('error');
      }
    }
  }, [checkoutIntent?.adminPortalUrl, polledCheckoutIntent]);

  const props = {
    labels: {
      pending: intl.formatMessage(buttonMessages.pending),
      error: intl.formatMessage(buttonMessages.error),
      success: intl.formatMessage(buttonMessages.success),
    },
    icons: {
      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
      success: <Icon src={ArrowForward} className="ml-2" />,
    },
    type: 'submit',
    variant: variants[statefulButtonState],
    disabledStates: ['default', 'pending'],
    state: statefulButtonState,
    onClick: onClickHandler,
  };

  return (
    <StatefulButton
      className={classNames('mx-auto d-block w-auto', {
        'reverse-stateful-provisioning-success': statefulButtonState === 'success',
        'disabled-opacity': statefulButtonState === 'pending',
      })}
      {...props}
    />
  );
};

export default StatefulProvisioningButton;
