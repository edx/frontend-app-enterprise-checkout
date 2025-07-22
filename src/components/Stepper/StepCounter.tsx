import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';

import { CheckoutStepKey } from '@/components/Stepper/constants';

const StepCounter: React.FC = () => {
  const { step } = useParams<{ step: string }>();
  const stepKeys = Object.values(CheckoutStepKey);
  const numSteps = stepKeys.length;
  const currentStepIndex = stepKeys.indexOf(step as CheckoutStepKey);
  const currentStep = currentStepIndex + 1;
  return (
    <p className="h3 text-muted font-weight-normal">
      <FormattedMessage
        id="checkout.stepCounter"
        defaultMessage="Step {currentStep} of {numSteps}"
        values={{ currentStep, numSteps }}
        description="Step counter for the checkout process."
      />
    </p>
  );
};

export default StepCounter;
