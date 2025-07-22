import { useParams } from 'react-router-dom';

import { CheckoutStepKey } from '@/components/Stepper/constants';

function useCurrentStep() {
  const { step } = useParams<{ step: CheckoutStepKey }>();
  return step;
}

export default useCurrentStep;
