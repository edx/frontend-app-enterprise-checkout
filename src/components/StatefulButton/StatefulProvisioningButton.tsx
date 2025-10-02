import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ArrowForward, SpinnerSimple } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import { useBFFSuccess, usePolledCheckoutIntent } from '@/components/app/data';

const variants = {
  default: 'secondary',
  pending: 'secondary',
  error: 'secondary',
  success: 'secondary',
};

const buttonMessages = defineMessages({
  pending: {
    id: 'checkout.billingDetailsSuccess.statefulProvisioningButton.creating_account.',
    defaultMessage: 'Creating your account',
    description: 'Button label when processing subscription',
  },
  error: {
    id: 'checkout.billingDetailsSuccess.statefulProvisioningButton.still_provisioning',
    defaultMessage: 'Still provisioning…',
    description: 'Button label when a transient error occurred but the system is still attempting to provision',
  },
  success: {
    id: 'checkout.billingDetails.statefulProvisioningButton.success',
    defaultMessage: 'Go to dashboard',
    description: 'Button label when system creates account successfully',
  },
});

const StatefulProvisioningButton = () => {
  const { data: polledCheckoutIntent } = usePolledCheckoutIntent();
  const { data: successContext } = useBFFSuccess();
  const { checkoutIntent } = successContext || {};
  const [statefulButtonState, setStatefulButtonState] = useState('pending');
  const intl = useIntl();
  const onClickHandler = () => {
    if (statefulButtonState === 'success' && checkoutIntent?.adminPortalUrl) {
      window.location.href = checkoutIntent?.adminPortalUrl;
    }
  };

  useEffect(() => {
    if (polledCheckoutIntent) {
      setStatefulButtonState('pending');
      if (polledCheckoutIntent?.state === 'fulfilled') {
        setStatefulButtonState('success');
      }
      if (['errored_provisioning', 'errored_stripe_checkout'].includes(polledCheckoutIntent?.state)) {
        setStatefulButtonState('error');
      }
    }
  }, [polledCheckoutIntent]);

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
    disabledStates: ['default', 'pending', 'error'],
    state: statefulButtonState,
    onClick: onClickHandler,
  };

  return (
    <StatefulButton
      className={classNames('mx-auto d-block w-auto', {
        'reverse-stateful-provisioning-success': statefulButtonState === 'success',
        'disabled-opacity': ['default', 'pending', 'error'].includes(statefulButtonState),
      })}
      {...props}
    />
  );
};

export default StatefulProvisioningButton;
