import { useParams } from 'react-router-dom';

import {
  CheckoutPageDetails,
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
  const currentStep = currentStepKey ? CheckoutStepByKey[currentStepKey!] : undefined;
  const currentSubstep = currentSubstepKey ? CheckoutSubstepByKey[currentSubstepKey!] : undefined;
  return { currentStep, currentStepKey, currentSubstep, currentSubstepKey };
}

export function useCurrentPage() {
  const { currentStep, currentSubstep } = useCurrentStep();
  const page = Object.keys(CheckoutPageDetails).find(key => (
    CheckoutPageDetails[key].step === currentStep && CheckoutPageDetails[key].substep === currentSubstep
  ));
  return page;
}

export function useCurrentPageDetails() {
  const currentPage = useCurrentPage();
  if (!currentPage) {
    return null;
  }
  return CheckoutPageDetails[currentPage];
}

export default useCurrentStep;
