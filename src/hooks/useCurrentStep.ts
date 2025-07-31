import { useParams } from 'react-router-dom';

import {
  CheckoutStepByKey,
  CheckoutStepKey,
  CheckoutSubstepByKey,
  CheckoutSubstepKey,
} from '@/components/Stepper/constants';

function useCurrentStep() {
  const {
    step: currentStepKey,
    substep: currentSubstepKey,
  } = useParams<{ step: CheckoutStepKey, substep: CheckoutSubstepKey }>();
  const currentStep = currentStepKey ? CheckoutStepByKey[currentStepKey] : undefined;
  const currentSubstep = currentSubstepKey ? CheckoutSubstepByKey[currentSubstepKey] : undefined;
  return { currentStep, currentStepKey, currentSubstep, currentSubstepKey };
}

export default useCurrentStep;
