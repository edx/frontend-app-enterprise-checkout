import { useParams } from 'react-router';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { steps } from '@/components/Stepper/constants';

const StepCounter: React.FC = () => {
  const { step } = useParams<{ step: Step }>();
  const numSteps = steps.length;
  const currentStepIndex = steps.indexOf(step!);
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
