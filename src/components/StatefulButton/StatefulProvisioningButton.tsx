import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ArrowForward, SpinnerSimple } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import { usePolledCheckoutIntent } from '@/components/app/data';

const variants = {
  default: 'secondary',
  pending: 'secondary',
  error: 'danger',
  success: 'secondary',
};

const buttonMessages = defineMessages({
  default: {
    id: 'checkout.billingDetailsSuccess.statefulProvisioningButton.creating_account.',
    defaultMessage: 'Loading...',
    description: 'Button label when processing subscription',
  },
  pending: {
    id: 'checkout.billingDetailsSuccess.statefulProvisioningButton.creating_account.',
    defaultMessage: 'Creating your account...',
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
  const { data: polledCheckoutIntent } = usePolledCheckoutIntent();
  const [statefulButtonState, setStatefulButtonState] = useState('default');
  const intl = useIntl();

  useEffect(() => {
    if (polledCheckoutIntent) {
      setStatefulButtonState('pending');
      if (polledCheckoutIntent?.state === 'fulfilled') {
        setStatefulButtonState('success');
      }
      if (polledCheckoutIntent?.state === 'errored_provisioning') {
        setStatefulButtonState('error');
      }
    }
  }, [polledCheckoutIntent]);

  const props = {
    labels: {
      default: intl.formatMessage(buttonMessages.default),
      pending: intl.formatMessage(buttonMessages.pending),
      error: intl.formatMessage(buttonMessages.error),
      success: intl.formatMessage(buttonMessages.success),
    },
    icons: {
      pending: <Icon src={SpinnerSimple} />,
      success: <Icon src={ArrowForward} className="ml-2" />,
    },
    type: 'submit',
    variant: variants[statefulButtonState],
    disabledStates: ['pending'],
    state: statefulButtonState,
  };

  return (
    <StatefulButton
      className={classNames('mx-auto d-block w-auto', {
        'reverse-stateful-provisioning-success': statefulButtonState === 'success',
      })}
      {...props}
    />
  );
};

export default StatefulProvisioningButton;
