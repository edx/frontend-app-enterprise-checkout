import { CheckoutPageDetails } from '@/components/Stepper/constants';
import useCurrentStep from '@/hooks/useCurrentStep';

function useCurrentPage(): keyof typeof CheckoutPageDetails | null {
  const { currentStep, currentSubstep } = useCurrentStep();

  const entry = Object.entries(CheckoutPageDetails).find(
    ([, value]) => value.step === currentStep && value.substep === currentSubstep,
  );

  return entry?.[0] as CheckoutPage ?? null;
}

export default useCurrentPage;
