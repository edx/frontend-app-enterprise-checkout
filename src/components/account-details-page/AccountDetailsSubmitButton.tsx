import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { CheckCircleOutline, Refresh, SpinnerSimple } from '@openedx/paragon/icons';
import { useEffect, useState } from 'react';
import { MessageDescriptor } from 'react-intl';

import { useCurrentPageDetails } from '@/hooks/index';

interface AccountDetailsSubmitButtonProps {
  formIsValid: boolean;
  submissionIsPending: boolean;
  submissionIsSuccess: boolean;
  submissionIsError: boolean;
}

type ButtonState = 'inactive' | 'default' | 'pending' | 'complete' | 'errored';

const overrideButtonMessage: Record<string, MessageDescriptor> = defineMessages({
  submitting: {
    id: 'checkout.submitting',
    defaultMessage: 'Creating account...',
    description: 'Button label when the form is submitting',
  },
  submitted: {
    id: 'checkout.submitted',
    defaultMessage: 'Account created',
    description: 'Button label when the form has been submitted successfully',
  },
  tryAgain: {
    id: 'checkout.tryAgain',
    defaultMessage: 'Try Again',
    description: 'Button label after the form submission errored',
  },
});

const AccountDetailsSubmitButton = ({
  formIsValid,
  submissionIsPending,
  submissionIsSuccess,
  submissionIsError,
}: AccountDetailsSubmitButtonProps) => {
  const intl = useIntl();
  const { buttonMessage } = useCurrentPageDetails();

  // Track the button state with useState for predictable rendering
  const [buttonState, setButtonState] = useState<ButtonState>('default');

  useEffect(() => {
    // Determine state order: pending > complete > errored > inactive > default
    if (submissionIsPending) {
      setButtonState('pending');
    } else if (submissionIsSuccess) {
      setButtonState('complete');
    } else if (submissionIsError) {
      setButtonState('errored');
    } else if (!formIsValid) {
      setButtonState('inactive');
    } else {
      setButtonState('default');
    }
  }, [formIsValid, submissionIsPending, submissionIsSuccess, submissionIsError]);

  // Define internationalized button labels
  const allButtonMessages = {
    // Inherit the standard button messsage for this checkout step from constants.
    inactive: buttonMessage,
    default: buttonMessage,

    // Override the button message in certain scenarios.
    pending: overrideButtonMessage.submitting,
    complete: overrideButtonMessage.submitted,
    errored: overrideButtonMessage.tryAgain,
  } as Record<ButtonState, MessageDescriptor>;

  return (
    <StatefulButton
      type="submit"
      state={buttonState}
      labels={{
        inactive: intl.formatMessage(allButtonMessages.inactive),
        default: intl.formatMessage(allButtonMessages.default),
        pending: intl.formatMessage(allButtonMessages.pending),
        complete: intl.formatMessage(allButtonMessages.complete),
        errored: intl.formatMessage(allButtonMessages.errored),
      }}
      icons={{
        inactive: undefined,
        default: undefined,
        pending: <Icon src={SpinnerSimple} className="icon-spin" />,
        complete: <Icon src={CheckCircleOutline} />,
        errored: <Icon src={Refresh} />,
      }}
      disabledStates={['inactive', 'pending']}
      variant="secondary"
      data-testid="stepper-submit-button"
    />
  );
};

export default AccountDetailsSubmitButton;
