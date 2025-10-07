import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { CheckCircleOutline, Refresh, SpinnerSimple } from '@openedx/paragon/icons';
import { useEffect, useState } from 'react';
import { MessageDescriptor } from 'react-intl';

import { useCurrentPageDetails } from '@/hooks/index';

interface PlanDetailsSubmitButtonProps {
  formIsValid: boolean;
  submissionIsPending: boolean;
  submissionIsSuccess: boolean;
  submissionIsError: boolean;
}

type ButtonState = 'inactive' | 'default' | 'pending' | 'complete' | 'errored';

const overrideButtonMessages: Record<string, MessageDescriptor> = defineMessages({
  submitting: {
    id: 'checkout.submitting',
    defaultMessage: 'Submitting...',
    description: 'Button label when submission is in progress',
  },
  submitted: {
    id: 'checkout.submitted',
    defaultMessage: 'Submitted',
    description: 'Button label when submission completed successfully',
  },
  tryAgain: {
    id: 'checkout.tryAgain',
    defaultMessage: 'Try Again',
    description: 'Button label after an error occurred',
  },
});

const PlanDetailsSubmitButton = ({
  formIsValid,
  submissionIsPending,
  submissionIsSuccess,
  submissionIsError,
}: PlanDetailsSubmitButtonProps) => {
  const intl = useIntl();
  const { buttonMessage } = useCurrentPageDetails();

  const [buttonState, setButtonState] = useState<ButtonState>('default');

  useEffect(() => {
    // Priority: pending > complete > errored > inactive > default
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

  return (
    <StatefulButton
      type="submit"
      state={buttonState}
      labels={{
        inactive: intl.formatMessage(buttonMessage),
        default: intl.formatMessage(buttonMessage),
        pending: intl.formatMessage(overrideButtonMessages.submitting),
        complete: intl.formatMessage(overrideButtonMessages.submitted),
        errored: intl.formatMessage(overrideButtonMessages.tryAgain),
      }}
      icons={{
        inactive: undefined,
        default: undefined,
        pending: <Icon src={SpinnerSimple} className="icon-spin" />,
        complete: <Icon src={CheckCircleOutline} />,
        errored: <Icon src={Refresh} />,
      }}
      // Allow re-click after success or error (only block inactive/pending)
      disabledStates={['inactive', 'pending']}
      variant="secondary"
      data-testid="stepper-submit-button"
    />
  );
};

export default PlanDetailsSubmitButton;
