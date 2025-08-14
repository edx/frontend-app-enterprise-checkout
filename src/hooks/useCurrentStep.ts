import { useParams } from 'react-router-dom';

import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';
import { getStepFromParams } from '@/utils/checkout';

function useCurrentStep() {
  const params = useParams<{ step: CheckoutStepKey, substep: CheckoutSubstepKey }>();
  return getStepFromParams(params);
}

export default useCurrentStep;
