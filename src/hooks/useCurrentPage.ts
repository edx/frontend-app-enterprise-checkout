import { CheckoutPageDetails } from '@/components/Stepper/constants';
import useCurrentStep from '@/hooks/useCurrentStep';

function useCurrentPage() {
  const { currentStep, currentSubstep } = useCurrentStep();
  const page = Object.keys(CheckoutPageDetails).find(key => (
    CheckoutPageDetails[key].step === currentStep && CheckoutPageDetails[key].substep === currentSubstep
  ));
  return page;
}

export default useCurrentPage;
