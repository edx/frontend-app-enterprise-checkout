import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StatefulButton } from '@openedx/paragon';
import { CheckCircleOutline, SpinnerSimple } from '@openedx/paragon/icons';

import { useCurrentPageDetails } from '@/hooks/index';

interface AccountDetailsSubmitButtonProps {
  formIsValid: boolean;
  submissionIsPending: boolean;
  submissionIsSuccess: boolean;
}

const AccountDetailsSubmitButton = ({
  formIsValid,
  submissionIsPending,
  submissionIsSuccess,
}: AccountDetailsSubmitButtonProps) => {
  const intl = useIntl();
  const { buttonMessage } = useCurrentPageDetails();

  let buttonState: 'inactive' | 'default' | 'pending' | 'complete' = 'default';
  if (submissionIsPending) {
    buttonState = 'pending';
  } else if (submissionIsSuccess) {
    buttonState = 'complete';
  } else if (!formIsValid) {
    buttonState = 'inactive';
  }

  return (
    <StatefulButton
      type="submit"
      state={buttonState}
      labels={{
        inactive: intl.formatMessage(buttonMessage),
        default: intl.formatMessage(buttonMessage),
        pending: intl.formatMessage({
          id: 'checkout.submitting',
          defaultMessage: 'Submitting...',
          description: 'Button label when the form is being submitted',
        }),
        complete: intl.formatMessage({
          id: 'checkout.submitted',
          defaultMessage: 'Submitted',
          description: 'Button label when the form has been submitted successfully',
        }),
      }}
      icons={{
        inactive: undefined,
        default: undefined,
        pending: <Icon src={SpinnerSimple} className="icon-spin" />,
        complete: <Icon src={CheckCircleOutline} />,
      }}
      disabledStates={['inactive', 'pending', 'complete']}
      variant="secondary"
      data-testid="stepper-submit-button"
    />
  );
};

export default AccountDetailsSubmitButton;
