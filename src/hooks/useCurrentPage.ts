import { CheckoutPageDetails } from '@/constants/checkout';
import useCurrentStep from '@/hooks/useCurrentStep';
import { getCheckoutPageDetails } from '@/utils/checkout';

function useCurrentPage(): keyof typeof CheckoutPageDetails | null {
  const { currentStep, currentSubstep } = useCurrentStep();
  const foundDetails = getCheckoutPageDetails({ step: currentStep, substep: currentSubstep });
  if (foundDetails) {
    return foundDetails.name;
  }
  return null;
}

export default useCurrentPage;
